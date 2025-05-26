import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (req.method === 'PUT') {
    try {
      const { studentName, grade, class: className, year, semester, subjects } = req.body

      // First, delete existing subjects
      await prisma.subject.deleteMany({
        where: { schoolReportId: String(id) },
      })

      // Then update the report and create new subjects
      const report = await prisma.schoolReport.update({
        where: { id: String(id) },
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

      return res.status(200).json(report)
    } catch (error) {
      return res.status(500).json({ error: 'Error updating report' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      // Delete subjects first (due to foreign key constraint)
      await prisma.subject.deleteMany({
        where: { schoolReportId: String(id) },
      })

      // Then delete the report
      await prisma.schoolReport.delete({
        where: { id: String(id) },
      })

      return res.status(204).end()
    } catch (error) {
      return res.status(500).json({ error: 'Error deleting report' })
    }
  }

  if (req.method === 'GET') {
    try {
      const report = await prisma.schoolReport.findUnique({
        where: { id: String(id) },
        include: {
          subjects: true,
        },
      })

      if (!report) {
        return res.status(404).json({ error: 'Report not found' })
      }

      return res.status(200).json(report)
    } catch (error) {
      return res.status(500).json({ error: 'Error fetching report' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
} 