import {
  AcademicRecord,
  Bimester,
  Concept,
  DefaultValues,
  Matter,
  StudentAcademicRecord,
  SubjectSituation
} from '@/interfaces/types'

export const DEFAULT_ACTIVE_SUBJECTS: Matter[] = [
  'Português',
  'Matemática',
  'Artes',
  'Ciências',
  'História',
  'Geografia',
  'Educação Física',
  'Inglês',
  'Espanhol'
]

export const DEFAULT_INACTIVE_SUBJECTS: Matter[] = [
  'Física',
  'Química',
  'Biologia',
  'Filosofia',
  'Sociologia',
  'Ensino Religioso'
]

export const ALL_MATTERS: Matter[] = [...DEFAULT_ACTIVE_SUBJECTS, ...DEFAULT_INACTIVE_SUBJECTS]

export function mergeDefaultActiveSubjects(subjects: Matter[]): Matter[] {
  const merged = [...subjects]
  for (const subject of DEFAULT_ACTIVE_SUBJECTS) {
    if (!merged.includes(subject)) merged.push(subject)
  }
  return merged
}

export function filterInactiveSubjects(inactive: Matter[], active: Matter[]): Matter[] {
  return inactive.filter(subject => !active.includes(subject))
}

export function createDefaultAcademicRecord(): AcademicRecord {
  return {
    grades: JSON.parse(DefaultValues.BIMESTER) as Bimester,
    absences: JSON.parse(DefaultValues.BIMESTER) as Bimester,
    concept: DefaultValues.CONCEPT as Concept,
    totalClasses: DefaultValues.TOTAL_CLASSES,
    totalAbsences: DefaultValues.TOTAL_ABSENCES,
    finalResult: DefaultValues.FINAL_RESULT as SubjectSituation
  }
}

export function ensureAcademicRecords(
  subjects: Matter[],
  records: StudentAcademicRecord
): StudentAcademicRecord {
  const next = { ...records }
  for (const subject of subjects) {
    if (!next[subject]) next[subject] = createDefaultAcademicRecord()
  }
  return next
}
