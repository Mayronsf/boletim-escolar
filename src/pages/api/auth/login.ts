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

  const { email, password } = req.body as { email: string; password: string }
  const normalizedEmail = normalizeEmail(email || '')
  const validationError = validateAuthPayload(normalizedEmail, password || '')
  if (validationError) return res.status(400).json({ error: validationError })

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' })
  }

  await createSession(user.id, res)
  return res.status(200).json({ user: { id: user.id, email: user.email } })
}
