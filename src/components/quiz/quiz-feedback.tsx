'use client'

import { Lightbulb, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizFeedbackProps {
  type: 'hint' | 'explanation' | 'correct' | 'incorrect'
  message: string
  attemptCount: number
  isStreaming?: boolean
}

const MAX_ATTEMPTS = 3

export function QuizFeedback({ type, message, attemptCount, isStreaming }: QuizFeedbackProps) {
  if (type === 'correct') {
    return (
      <div className="mt-3 flex items-start gap-2.5 bg-success/8 border border-success/25 rounded-xl px-4 py-3">
        <CheckCircle className="size-4 text-success shrink-0 mt-0.5" />
        <p className="text-[12px] text-success leading-relaxed">{message}</p>
      </div>
    )
  }

  if (type === 'incorrect' && attemptCount >= MAX_ATTEMPTS) {
    return (
      <div className="mt-3 bg-brand/8 border border-brand/30 rounded-xl px-4 py-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base" aria-hidden>
            🐙
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand/80">
            Full explanation
          </p>
          {isStreaming && (
            <span className="text-[10px] text-text-disabled animate-pulse">streaming...</span>
          )}
        </div>
        <p className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
          {message || 'Loading explanation...'}
        </p>
      </div>
    )
  }

  if (type === 'hint' || type === 'incorrect') {
    return (
      <div className="mt-3 bg-warning/8 border border-warning/20 rounded-xl px-4 py-3">
        <div className="flex items-start gap-2.5">
          <Lightbulb className="size-4 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[11px] font-medium text-warning/90 mb-1">Hint</p>
            <p className="text-[12px] text-warning/80 leading-relaxed">{message}</p>
          </div>
        </div>
        {/* Attempt dots */}
        <div className="flex gap-1.5 mt-3">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                i < attemptCount ? 'bg-error' : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3 flex items-start gap-2.5 bg-error/7 border border-error/20 rounded-xl px-4 py-3">
      <XCircle className="size-4 text-error shrink-0 mt-0.5" />
      <p className="text-[12px] text-error/80 leading-relaxed">{message}</p>
    </div>
  )
}
