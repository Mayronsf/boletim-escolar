import { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE_NAME = 'boletim_session'
const SESSION_TTL_DAYS = 30

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export const verifyPassword = (password: string, storedHash: string) => {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) return false
  const hashBuffer = Buffer.from(key, 'hex')
  const suppliedBuffer = scryptSync(password, salt, 64)
  return timingSafeEqual(hashBuffer, suppliedBuffer)
}

export const createSession = async (userId: string, res: NextApiResponse) => {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS)

  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt
    }
  })

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  const cookie = `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}${secure}`
  res.setHeader('Set-Cookie', cookie)
}

export const clearSession = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = req.cookies[SESSION_COOKIE_NAME]
  if (token) {
    await prisma.session.deleteMany({ where: { token } })
  }
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`)
}

export const getSessionUser = async (req: NextApiRequest) => {
  const token = req.cookies[SESSION_COOKIE_NAME]
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!session) return null
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { token } }).catch(() => null)
    return null
  }

  return session.user
}

export const validateAuthPayload = (email: string, password: string) => {
  if (!email || !password) return 'E-mail e senha são obrigatórios.'
  if (!email.includes('@')) return 'Informe um e-mail válido.'
  if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.'
  return null
}

export { normalizeEmail }
