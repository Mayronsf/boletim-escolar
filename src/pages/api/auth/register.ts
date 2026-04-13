import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  createSession,
  hashPassword,
  normalizeEmail,
  validateAuthPayload
} from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, schoolName, secretaryName, password, confirmPassword } = req.body as {
    email: string
    schoolName: string
    secretaryName: string
    password: string
    confirmPassword: string
  }
  const normalizedEmail = normalizeEmail(email || '')
  const validationError = validateAuthPayload(normalizedEmail, password || '')
  if (validationError) return res.status(400).json({ error: validationError })
  if (!schoolName?.trim()) return res.status(400).json({ error: 'Nome da escola é obrigatório.' })
  if (!secretaryName?.trim()) return res.status(400).json({ error: 'Responsável pela secretaria é obrigatório.' })
  if (password !== confirmPassword) return res.status(400).json({ error: 'As senhas não conferem.' })

  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existingUser) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' })

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash: hashPassword(password),
      savedData: {
        schoolName: schoolName.trim(),
        secretaryName: secretaryName.trim()
      }
    }
  })

  await createSession(user.id, res)
  return res.status(201).json({ user: { id: user.id, email: user.email } })
}
