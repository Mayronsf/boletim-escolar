import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const reports = await prisma.schoolReport.findMany({
        include: {
          subjects: true,
        },
      })
      return res.status(200).json(reports)
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching reports' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { studentName, grade, class: className, year, semester, subjects } = req.body
      
      const report = await prisma.schoolReport.create({
        data: {
          studentName,
          grade,
          class: className,
          year,
          semester,
          subjects: {
            create: subjects.map((subject: { name: string; grade: number }) => ({
              name: subject.name,
              grade: subject.grade,
            })),
          },
        },
        include: {
          subjects: true,
        },
      })
      
      return res.status(201).json(report)
    } catch (error) {
      return res.status(500).json({ error: 'Error creating report' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 