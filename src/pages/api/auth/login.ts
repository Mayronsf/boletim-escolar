import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  createSession,
  normalizeEmail,
  validateAuthPayload,
  verifyPassword
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      error: 'DATABASE_URL não está configurada no servidor (Vercel → Settings → Environment Variables).'
    })
  }

  const { email, password } = req.body as { email: string; password: string }
  const normalizedEmail = normalizeEmail(email || '')
  const validationError = validateAuthPayload(normalizedEmail, password || '')
  if (validationError) return res.status(400).json({ error: validationError })

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
    }

    await createSession(user.id, res)
    return res.status(200).json({ user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('[api/auth/login]', err)
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('P1001') || msg.includes("Can't reach database") || msg.includes('ECONNREFUSED')) {
      return res.status(500).json({
        error:
          'Não foi possível conectar ao banco. Confira DATABASE_URL e DIRECT_URL na Vercel.'
      })
    }
    return res.status(500).json({ error: 'Erro ao entrar. Tente novamente.' })
  }
}
