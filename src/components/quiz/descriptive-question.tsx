'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuizFeedback } from '@/components/quiz/quiz-feedback'
import type { QuizQuestion } from '@/types/quiz'
import type { EvaluationResult } from '@/types/quiz'

interface DescriptiveQuestionProps {
  question: QuizQuestion
  onSubmit: (answer: string) => void
  evaluation: EvaluationResult | undefined
  isEvaluating: boolean
  streamedExplanation?: string
  isStreaming?: boolean
}

export function DescriptiveQuestion({
  question,
  onSubmit,
  evaluation,
  isEvaluating,
  streamedExplanation,
  isStreaming,
}: DescriptiveQuestionProps) {
  const [answer, setAnswer] = useState('')
  const answered = !!evaluation

  function handleSubmit() {
    if (!answer.trim() || isEvaluating || answered) return
    onSubmit(answer.trim())
  }

  const feedbackType = evaluation?.isCorrect
    ? 'correct'
    : evaluation?.showExplanation
      ? 'explanation'
      : 'hint'

  return (
    <div>
      <p className="font-heading text-[16px] font-semibold text-foreground leading-snug mb-5">
        {question.question}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        readOnly={answered}
        placeholder="Write your answer here..."
        rows={4}
        className="w-full bg-surface border border-brand/35 rounded-xl px-4 py-3.5 text-[13px] text-foreground placeholder:text-text-disabled leading-relaxed resize-none outline-none focus:border-brand/60 transition-colors disabled:opacity-70"
      />

      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-text-disabled">{answer.length} characters</span>
        {!answered && (
          <Button size="sm" onClick={handleSubmit} disabled={!answer.trim() || isEvaluating}>
            {isEvaluating ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Evaluating...
              </>
            ) : (
              'Submit answer'
            )}
          </Button>
        )}
      </div>

      {evaluation && (
        <QuizFeedback
          type={feedbackType}
          message={
            feedbackType === 'explanation'
              ? (streamedExplanation ?? evaluation.feedback)
              : feedbackType === 'correct'
                ? `Correct! ${evaluation.feedback}`
                : evaluation.feedback
          }
          attemptCount={evaluation.attemptCount}
          isStreaming={isStreaming}
        />
      )}
    </div>
  )
}
