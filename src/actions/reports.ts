'use server'

import { auth } from '@clerk/nextjs/server'
import { anthropic, MODELS, createCachedSystemPrompt } from '@/lib/ai/client'
import { buildReportGeneratorPrompt } from '@/lib/ai/prompts/report-generator'
import { buildResumeGeneratorPrompt } from '@/lib/ai/prompts/resume-generator'
import { ReportSummarySchema } from '@/lib/ai/schemas/report'
import { ResumeResponseSchema } from '@/lib/ai/schemas/resume'
import { tryCatch } from '@/lib/utils/try-catch'
import { createServerClient } from '@/lib/db/client'
import { getReportBySessionId } from '@/lib/db/queries/reports'
import type { Result } from '@/lib/utils/try-catch'
import type { Report } from '@/types/report'

// ─── helpers ─────────────────────────────────────────────────────────────────

async function callAI(system: string, user: string, maxTokens = 1200): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODELS.fast,
    max_tokens: maxTokens,
    system: [createCachedSystemPrompt(system)],
    messages: [{ role: 'user', content: user }],
  })

  const block = response.content[0]
  if (!block || block.type !== 'text') throw new Error('Unexpected AI response type')

  if (process.env.NODE_ENV === 'development') {
    console.debug(
      '[AI report]',
      MODELS.fast,
      'input:',
      response.usage.input_tokens,
      'output:',
      response.usage.output_tokens,
    )
  }

  return block.text
}

function stripFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

// ─── generateReport ───────────────────────────────────────────────────────────

export async function generateReport(sessionId: string): Promise<Result<Report>> {
  return tryCatch(async () => {
    const { userId } = await auth()
    if (!userId) throw new Error('UNAUTHORIZED')

    const supabase = createServerClient()

    // Guard: do not regenerate if report already exists
    const existing = await getReportBySessionId(sessionId)
    if (existing) return existing as Report

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*, subject_areas(title)')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) throw new Error('Session not found')
    if ((session as { user_id: string }).user_id !== userId) throw new Error('UNAUTHORIZED')

    type SessionRow = {
      id: string
      user_id: string
      topics: string[]
      total_questions: number
      correct_answers: number
      status: string
      started_at: string
      completed_at: string | null
      subject_areas: { title: string } | null
    }
    const s = session as unknown as SessionRow

    const subjectArea = s.subject_areas?.title ?? 'Unknown'

    // Fetch questions
    const { data: rawQuestions, error: qError } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('position', { ascending: true })

    if (qError) throw new Error(qError.message)

    type QRow = {
      id: string
      question: string
      type: 'multiple-choice' | 'descriptive'
      correct_answer: string
      user_answer: string | null
      attempt_count: number
      is_correct: boolean | null
    }
    const questions = (rawQuestions ?? []) as QRow[]

    const questionParams = questions.map((q) => ({
      question: q.question,
      type: q.type,
      correctAnswer: q.correct_answer,
      userAnswer: q.user_answer,
      attemptCount: q.attempt_count,
      isCorrect: q.is_correct ?? false,
    }))

    // ── Run AI calls in parallel ──────────────────────────────────────────────
    const { system: reportSystem, user: reportUser } = buildReportGeneratorPrompt({
      subjectArea,
      topics: s.topics,
      totalQuestions: s.total_questions,
      correctAnswers: s.correct_answers,
      questions: questionParams,
    })

    const resumePrompt = buildResumeGeneratorPrompt({
      subjectArea,
      topics: s.topics,
    })

    const [reportRaw, resumeRaw] = await Promise.allSettled([
      callAI(reportSystem, reportUser, 1200),
      callAI(
        'You are a learning coach. Return ONLY valid JSON — no markdown fences.',
        resumePrompt,
        1500,
      ),
    ])

    // ── Parse report (required) ───────────────────────────────────────────────
    if (reportRaw.status === 'rejected') {
      throw new Error(`Report AI call failed: ${String(reportRaw.reason)}`)
    }

    const reportParsed = ReportSummarySchema.safeParse(JSON.parse(stripFences(reportRaw.value)))
    if (!reportParsed.success) {
      throw new Error(`Report schema validation failed: ${reportParsed.error.message}`)
    }

    // ── Parse resume (optional — failure does not block report) ──────────────
    let learningResume: string | null = null
    let resources: import('@/types/report').ResourceList | null = null

    if (resumeRaw.status === 'fulfilled') {
      const resumeParsed = ResumeResponseSchema.safeParse(JSON.parse(stripFences(resumeRaw.value)))
      if (resumeParsed.success) {
        learningResume = resumeParsed.data.resume
        resources = resumeParsed.data.resources
      } else {
        console.error('[generateReport] resume schema failed:', resumeParsed.error.message)
      }
    } else {
      console.error('[generateReport] resume AI call failed:', String(resumeRaw.reason))
    }

    // ── Insert report ─────────────────────────────────────────────────────────
    const scorePercentage =
      s.total_questions > 0 ? Math.round((s.correct_answers / s.total_questions) * 100) : 0

    const { data: inserted, error: insertError } = await supabase
      .from('reports')
      .insert({
        user_id: userId,
        session_id: sessionId,
        subject_area: subjectArea,
        topics_covered: s.topics,
        score_percentage: scorePercentage,
        summary: reportParsed.data.summary,
        struggling_topics: reportParsed.data.struggling_topics,
        learning_resume: learningResume,
        resources: resources ?? null,
      })
      .select()
      .single()

    if (insertError || !inserted) {
      throw new Error(insertError?.message ?? 'Failed to insert report')
    }

    return inserted as Report
  }, 'REPORT_GENERATION_FAILED')
}

// ─── retryResume ──────────────────────────────────────────────────────────────

export async function retryResume(
  reportId: string,
): Promise<Result<Pick<Report, 'learning_resume' | 'resources'>>> {
  return tryCatch(async () => {
    const { userId } = await auth()
    if (!userId) throw new Error('UNAUTHORIZED')

    const supabase = createServerClient()

    const { data: report, error: fetchError } = await supabase
      .from('reports')
      .select('id, user_id, subject_area, topics_covered')
      .eq('id', reportId)
      .single()

    if (fetchError || !report) throw new Error('Report not found')
    type ReportMeta = {
      id: string
      user_id: string
      subject_area: string
      topics_covered: string[]
    }
    const r = report as ReportMeta
    if (r.user_id !== userId) throw new Error('UNAUTHORIZED')

    const resumePrompt = buildResumeGeneratorPrompt({
      subjectArea: r.subject_area,
      topics: r.topics_covered,
    })

    const raw = await callAI(
      'You are a learning coach. Return ONLY valid JSON — no markdown fences.',
      resumePrompt,
      1500,
    )

    const parsed = ResumeResponseSchema.safeParse(JSON.parse(stripFences(raw)))
    if (!parsed.success) throw new Error(`Resume schema failed: ${parsed.error.message}`)

    const { error: updateError } = await supabase
      .from('reports')
      .update({
        learning_resume: parsed.data.resume,
        resources: parsed.data.resources,
      })
      .eq('id', reportId)

    if (updateError) throw new Error(updateError.message)

    return { learning_resume: parsed.data.resume, resources: parsed.data.resources }
  }, 'RESUME_RETRY_FAILED')
}

// ─── getPdfData ───────────────────────────────────────────────────────────────

export interface PdfData {
  report: Report
  questions: Array<{
    id: string
    question: string
    type: 'multiple-choice' | 'descriptive'
    correct_answer: string
    user_answer: string | null
    is_correct: boolean | null
  }>
}

export async function getPdfData(reportId: string): Promise<Result<PdfData>> {
  return tryCatch(async () => {
    const { userId } = await auth()
    if (!userId) throw new Error('UNAUTHORIZED')

    const supabase = createServerClient()

    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single()

    if (reportError || !report) throw new Error('Report not found')
    const r = report as { user_id: string; session_id: string }
    if (r.user_id !== userId) throw new Error('UNAUTHORIZED')

    const { data: questions, error: qError } = await supabase
      .from('quiz_questions')
      .select('id, question, type, correct_answer, user_answer, is_correct')
      .eq('session_id', r.session_id)
      .order('position', { ascending: true })

    if (qError) throw new Error(qError.message)

    return {
      report: report as Report,
      questions: (questions ?? []) as PdfData['questions'],
    }
  }, 'PDF_DATA_FETCH_FAILED')
}
