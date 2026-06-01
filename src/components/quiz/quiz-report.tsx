'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ReportScoreHero } from '@/components/quiz/report-score-hero'
import { ReportAreasToReview } from '@/components/quiz/report-areas-to-review'
import { ReportResume } from '@/components/quiz/report-resume'
import { ReportReferences } from '@/components/quiz/report-references'
import { ReportQuestionBreakdown } from '@/components/quiz/report-question-breakdown'
import type { QuizQuestionRow, QuizSessionRow } from '@/types/database'
import type { Report, ResourceList } from '@/types/report'

// Dynamic import breaks the Turbopack SSR module graph so @react-pdf/renderer never
// lands in the server bundle — required because the package uses Node-incompatible browser APIs.
const ReportExportBar = dynamic(
  () => import('@/components/quiz/report-export-bar').then((m) => m.ReportExportBar),
  { ssr: false },
)

interface QuizReportProps {
  session: QuizSessionRow & { subject_area: string }
  questions: QuizQuestionRow[]
  report: Report
  sessionId: string
}

export function QuizReport({ session, questions, report, sessionId }: QuizReportProps) {
  const [resources, setResources] = useState<ResourceList | null>(report.resources)

  const mcQuestions = questions.filter((q) => q.type === 'multiple-choice')
  const descQuestions = questions.filter((q) => q.type === 'descriptive')

  const mcCorrect = mcQuestions.filter((q) => q.is_correct).length
  const descCorrect = descQuestions.filter((q) => q.is_correct === true).length

  const totalCorrect = session.correct_answers
  const totalQuestions = session.total_questions
  const score = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  const completedAt = session.completed_at ?? new Date().toISOString()
  const startedAt = session.started_at
  const durationMinutes = Math.max(
    1,
    Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000),
  )

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <ReportScoreHero
        score={score}
        correct={totalCorrect}
        total={totalQuestions}
        mcScore={{ correct: mcCorrect, total: mcQuestions.length }}
        descriptiveScore={{ correct: descCorrect, total: descQuestions.length }}
        subjectArea={session.subject_area}
        topics={session.topics}
        date={completedAt}
        durationMinutes={durationMinutes}
      />
      <ReportAreasToReview questions={questions} />
      <ReportResume
        resume={report.learning_resume}
        reportId={report.id}
        onResourcesLoaded={setResources}
      />
      <ReportReferences resources={resources} />
      <ReportQuestionBreakdown questions={questions} />
      <ReportExportBar
        sessionId={sessionId}
        reportId={report.id}
        notionPageId={report.notion_page_id}
        subjectArea={session.subject_area}
        completedAt={completedAt}
        report={report}
        questions={questions}
      />
    </div>
  )
}
