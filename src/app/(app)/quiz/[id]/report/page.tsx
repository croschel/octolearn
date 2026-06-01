import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { QuizReport } from '@/components/quiz/quiz-report'
import { getQuizSessionWithQuestions } from '@/lib/db/queries/quiz'
import { getReportBySessionId } from '@/lib/db/queries/reports'
import { generateReport } from '@/actions/reports'
import type { Report } from '@/types/report'

interface ReportPageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const session = await getQuizSessionWithQuestions(id)
  if (!session) redirect('/dashboard')
  if (session.user_id !== userId) redirect('/dashboard')
  if (session.status !== 'completed') redirect(`/quiz/${id}`)

  // Load existing report or generate one — idempotent: generateReport guards against re-generation
  let report: Report | null = await getReportBySessionId(id).catch(() => null)
  if (!report) {
    const result = await generateReport(id)
    report = result.data
  }

  if (!report) redirect('/dashboard')

  const sessionWithArea = {
    ...session,
    subject_area: session.subject_areas?.title ?? 'Unknown',
  }

  const questions = [...session.quiz_questions].sort((a, b) => a.position - b.position)

  return (
    <QuizReport session={sessionWithArea} questions={questions} report={report} sessionId={id} />
  )
}
