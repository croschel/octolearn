import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { QuizQuestionRow } from '@/types/database'

interface ReportAreasToReviewProps {
  questions: QuizQuestionRow[]
}

export function ReportAreasToReview({ questions }: ReportAreasToReviewProps) {
  const struggling = questions.filter((q) => q.attempt_count >= 3 && !q.is_correct)

  return (
    <div className="mb-6">
      <h2 className="font-heading text-[14px] font-semibold text-foreground mb-3 flex items-center gap-2">
        <AlertTriangle className="size-4 text-warning" />
        Areas to review
      </h2>

      {struggling.length === 0 ? (
        <div className="flex items-center gap-2.5 bg-success/8 border border-success/20 rounded-xl px-4 py-3.5">
          <CheckCircle className="size-4 text-success shrink-0" />
          <p className="text-[13px] text-success">No weak areas — excellent session!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {struggling.map((q) => (
            <div
              key={q.id}
              className="bg-warning/8 border border-warning/20 rounded-xl px-4 py-3.5 flex items-start gap-3"
            >
              <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] text-foreground leading-snug line-clamp-2">
                  {q.question}
                </p>
                <p className="text-[11px] text-warning/70 mt-1">
                  Took 3 attempts — worth revisiting
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
