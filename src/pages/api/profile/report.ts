import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getSessionUser(req)
  if (!user) return res.status(401).json({ error: 'Não autenticado.' })

  if (req.method === 'GET') {
    return res.status(200).json({ data: user.savedData ?? null })
  }

  if (req.method === 'PUT') {
    const { data } = req.body as { data: unknown }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { savedData: data as object }
    })
    return res.status(200).json({ data: updated.savedData ?? null })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
