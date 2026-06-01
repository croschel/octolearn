import { createServerClient } from '@/lib/db/client'
import type { ReportRow } from '@/types/database'

export interface RecentSession {
  id: string
  subject_area: string
  topics: string[]
  completed_at: string | null
  score_percentage: number
  session_id: string
}

export async function getReportsForUser(userId: string): Promise<ReportRow[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as ReportRow[]
}

export async function getReportBySessionId(sessionId: string): Promise<ReportRow | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as ReportRow | null
}

export async function getRecentSessions(userId: string, limit = 5): Promise<RecentSession[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('id, topics, completed_at, correct_answers, total_questions, subject_areas(title)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  if (!data) return []

  type RawRow = {
    id: string
    topics: string[]
    completed_at: string | null
    correct_answers: number
    total_questions: number
    subject_areas: { title: string } | { title: string }[] | null
  }

  return (data as unknown as RawRow[]).map((row) => ({
    id: row.id,
    subject_area: Array.isArray(row.subject_areas)
      ? (row.subject_areas[0]?.title ?? 'Unknown')
      : (row.subject_areas?.title ?? 'Unknown'),
    topics: row.topics,
    completed_at: row.completed_at,
    score_percentage:
      row.total_questions > 0 ? Math.round((row.correct_answers / row.total_questions) * 100) : 0,
    session_id: row.id,
  }))
}

export async function getDashboardStats(userId: string): Promise<{
  totalQuizzes: number
  avgScore: number
  areasStudied: number
  streak: number
}> {
  const supabase = createServerClient()

  const { data: sessions, error } = await supabase
    .from('quiz_sessions')
    .select('correct_answers, total_questions, completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  if (error) throw new Error(error.message)

  const { data: areas, error: areasError } = await supabase
    .from('subject_areas')
    .select('id')
    .eq('user_id', userId)

  if (areasError) throw new Error(areasError.message)

  type SessionRow = {
    correct_answers: number
    total_questions: number
    completed_at: string | null
  }
  const rows = (sessions ?? []) as SessionRow[]

  const totalQuizzes = rows.length
  const areasStudied = (areas ?? []).length

  const scores = rows
    .filter((s) => s.total_questions > 0)
    .map((s) => (s.correct_answers / s.total_questions) * 100)
  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  // Compute streak: consecutive days with at least one quiz
  const completedDates = rows
    .map((s) => s.completed_at)
    .filter((d): d is string => d !== null)
    .map((d) => new Date(d).toISOString().split('T')[0] as string)

  const uniqueDates = [...new Set(completedDates)].sort((a, b) => (a > b ? -1 : 1))

  let streak = 0
  const today = new Date().toISOString().split('T')[0] as string
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0] as string

  if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === yesterday)) {
    streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = uniqueDates[i - 1] as string
      const curr = uniqueDates[i] as string
      const diffMs = new Date(prev).getTime() - new Date(curr).getTime()
      if (diffMs <= 86400000) {
        streak++
      } else {
        break
      }
    }
  }

  return { totalQuizzes, avgScore, areasStudied, streak }
}
