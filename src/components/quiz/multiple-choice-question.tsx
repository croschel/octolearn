'use client'

import { cn } from '@/lib/utils'
import { QuizFeedback } from '@/components/quiz/quiz-feedback'
import type { QuizQuestion } from '@/types/quiz'
import type { EvaluationResult } from '@/types/quiz'

const LETTERS = ['A', 'B', 'C', 'D'] as const

interface MultipleChoiceQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: string) => void
  evaluation: EvaluationResult | undefined
  isEvaluating: boolean
  selectedAnswer: string | undefined
  streamedExplanation?: string
  isStreaming?: boolean
}

function getOptionState(
  option: string,
  selected: string | undefined,
  evaluation: EvaluationResult | undefined,
  correct: string,
): 'default' | 'selected' | 'correct' | 'incorrect' {
  if (!evaluation && option !== selected) return 'default'
  if (!evaluation && option === selected) return 'selected'
  if (option === correct && evaluation) return 'correct'
  if (option === selected && !evaluation?.isCorrect) return 'incorrect'
  return 'default'
}

const optionStyles: Record<string, string> = {
  default: 'bg-surface border-border/50 hover:border-brand/35 text-text-secondary',
  selected: 'bg-brand/10 border-brand/50 text-foreground',
  correct: 'bg-success/8 border-success/50 text-success',
  incorrect: 'bg-error/7 border-error/40 text-error/80',
}

const letterStyles: Record<string, string> = {
  default: 'bg-brand/10 border-brand/20 text-brand/70',
  selected: 'bg-brand/20 border-brand/40 text-brand',
  correct: 'bg-success/20 border-success/40 text-success',
  incorrect: 'bg-error/15 border-error/30 text-error',
}

export function MultipleChoiceQuestion({
  question,
  onAnswer,
  evaluation,
  isEvaluating,
  selectedAnswer,
  streamedExplanation,
  isStreaming,
}: MultipleChoiceQuestionProps) {
  const answered = !!evaluation
  const showExplanation = evaluation?.showExplanation ?? false

  return (
    <div>
      <p className="font-heading text-[16px] font-semibold text-foreground leading-snug mb-5">
        {question.question}
      </p>

      <div className="flex flex-col gap-2">
        {question.options.map((option, idx) => {
          const letter = LETTERS[idx] ?? 'A'
          const state = getOptionState(option, selectedAnswer, evaluation, question.correctAnswer)
          const disabled = answered || isEvaluating

          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(option)}
              className={cn(
                'flex items-center gap-2.5 border rounded-xl px-4 py-3 text-[13px] text-left transition-all',
                optionStyles[state],
                disabled && !answered && 'opacity-50 cursor-not-allowed',
                answered && state === 'default' && 'opacity-40 cursor-not-allowed',
              )}
            >
              <span
                className={cn(
                  'w-[22px] h-[22px] rounded-md border flex items-center justify-center text-[10px] font-semibold shrink-0',
                  letterStyles[state],
                )}
              >
                {letter}
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {evaluation && !evaluation.isCorrect && (
        <QuizFeedback
          type={showExplanation ? 'explanation' : 'hint'}
          message={
            showExplanation ? (streamedExplanation ?? evaluation.feedback) : evaluation.feedback
          }
          attemptCount={evaluation.attemptCount}
          isStreaming={isStreaming}
        />
      )}

      {evaluation?.isCorrect && (
        <QuizFeedback
          type="correct"
          message="Correct! Well done."
          attemptCount={evaluation.attemptCount}
        />
      )}
    </div>
  )
}
