import { createServerClient } from '@/lib/db/client'
import type { QuizQuestionRow, QuizSessionRow, SubjectAreaRow } from '@/types/database'

export interface NewQuizSession {
  user_id: string
  subject_area_id: string | null
  topics: string[]
  total_questions: number
  status: 'in_progress' | 'completed'
}

export interface NewQuizQuestion {
  session_id: string
  type: 'multiple-choice' | 'descriptive'
  question: string
  options: string[] | null
  correct_answer: string
  explanation: string
  position: number
}

export interface UpdateAttemptData {
  attempt_count?: number
  is_correct?: boolean
  user_answer?: string
  score?: number
}

export interface CompleteSessionData {
  correct_answers: number
  completed_at: string
}

export type QuizSessionWithRelations = QuizSessionRow & {
  subject_areas: Pick<SubjectAreaRow, 'title'> | null
  quiz_questions: QuizQuestionRow[]
}

export async function findOrCreateSubjectArea(userId: string, title: string): Promise<string> {
  const supabase = createServerClient()

  const { data: existing, error: fetchError } = await supabase
    .from('subject_areas')
    .select('id')
    .eq('user_id', userId)
    .eq('title', title)
    .maybeSingle()

  if (fetchError) throw new Error(fetchError.message)

  const existingRow = existing as { id: string } | null
  if (existingRow) return existingRow.id

  const { data: created, error: insertError } = await supabase
    .from('subject_areas')
    .insert({ user_id: userId, title })
    .select('id')
    .single()

  if (insertError || !created) {
    throw new Error(insertError?.message ?? 'Failed to create subject area')
  }

  return (created as { id: string }).id
}

export async function insertQuizSession(data: NewQuizSession): Promise<string> {
  const supabase = createServerClient()

  const { data: session, error } = await supabase
    .from('quiz_sessions')
    .insert(data)
    .select('id')
    .single()

  if (error || !session) throw new Error(error?.message ?? 'Failed to create quiz session')
  return (session as { id: string }).id
}

export async function insertQuizQuestions(questions: NewQuizQuestion[]): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from('quiz_questions').insert(questions)

  if (error) throw new Error(error.message)
}

export async function getQuizSessionWithQuestions(
  sessionId: string,
): Promise<QuizSessionWithRelations | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('quiz_sessions')
    .select('*, subject_areas(title), quiz_questions(*)')
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as QuizSessionWithRelations
}

export async function getQuestionById(questionId: string): Promise<QuizQuestionRow | null> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', questionId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as QuizQuestionRow | null
}

export async function updateQuestionAttempt(
  questionId: string,
  data: UpdateAttemptData,
): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.from('quiz_questions').update(data).eq('id', questionId)

  if (error) throw new Error(error.message)
}

export async function completeQuizSession(
  sessionId: string,
  data: CompleteSessionData,
): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('quiz_sessions')
    .update({ status: 'completed', ...data })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}
