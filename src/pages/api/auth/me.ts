import { NextApiRequest, NextApiResponse } from 'next'
import { getSessionUser } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ user: null })
  return res.status(200).json({ user: { id: user.id, email: user.email } })
}
