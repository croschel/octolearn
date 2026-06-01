import { createServerClient } from '@/lib/db/client'
import type { SubjectAreaRow } from '@/types/database'

export interface SubjectAreaWithStats extends SubjectAreaRow {
  quizCount: number
  avgScore: number
  lastQuizDate: string | null
}

export async function getSubjectAreasForUser(userId: string): Promise<SubjectAreaRow[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('subject_areas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SubjectAreaRow[]
}

export async function getSubjectAreasWithStats(userId: string): Promise<SubjectAreaWithStats[]> {
  const supabase = createServerClient()

  const { data: areas, error: areasError } = await supabase
    .from('subject_areas')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (areasError) throw new Error(areasError.message)
  if (!areas || areas.length === 0) return []

  const areaRows = areas as SubjectAreaRow[]
  const areaIds = areaRows.map((a) => a.id)

  const { data: sessions, error: sessionsError } = await supabase
    .from('quiz_sessions')
    .select('subject_area_id, correct_answers, total_questions, completed_at, status')
    .in('subject_area_id', areaIds)
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (sessionsError) throw new Error(sessionsError.message)

  type SessionRow = {
    subject_area_id: string | null
    correct_answers: number
    total_questions: number
    completed_at: string | null
    status: string
  }

  const sessionRows = (sessions ?? []) as SessionRow[]

  return areaRows.map((area) => {
    const areaSessions = sessionRows.filter((s) => s.subject_area_id === area.id)
    const quizCount = areaSessions.length

    const scores = areaSessions
      .filter((s) => s.total_questions > 0)
      .map((s) => (s.correct_answers / s.total_questions) * 100)

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    const dates = areaSessions
      .map((s) => s.completed_at)
      .filter((d): d is string => d !== null)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    const lastQuizDate = dates[0] ?? null

    return { ...area, quizCount, avgScore: Math.round(avgScore), lastQuizDate }
  })
}
