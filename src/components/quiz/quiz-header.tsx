'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizHeaderProps {
  subjectArea: string
  currentIndex: number
  totalQuestions: number
  correctCount: number
  sessionId?: string
}

export function QuizHeader({
  subjectArea,
  currentIndex,
  totalQuestions,
  correctCount,
}: QuizHeaderProps) {
  const [confirming, setConfirming] = useState(false)
  const scoreClass =
    totalQuestions > 0 && correctCount / totalQuestions >= 0.8
      ? 'text-success bg-success/10 border-success/20'
      : correctCount / totalQuestions >= 0.6
        ? 'text-warning bg-warning/10 border-warning/20'
        : 'text-success bg-success/10 border-success/20'

  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border/30 relative">
      {/* Left */}
      <div className="flex items-center gap-3">
        <span className="font-heading font-semibold text-[13px] text-text-disabled">OctoLearn</span>
        <span className="bg-brand/10 border border-brand/25 rounded-md px-2.5 py-1 text-[11px] font-medium text-text-secondary">
          {subjectArea}
        </span>
      </div>

      {/* Center */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5">
        <span className="text-[12px] text-text-disabled whitespace-nowrap">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'font-heading text-[13px] font-semibold border rounded-md px-2.5 py-1',
            scoreClass,
          )}
        >
          {correctCount} / {totalQuestions} correct
        </span>
        {confirming ? (
          <div className="flex items-center gap-2 text-[12px]">
            <span className="text-text-secondary">Exit quiz?</span>
            <Link href="/dashboard" className="text-error hover:underline">
              Yes, exit
            </Link>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-text-disabled hover:text-text-secondary"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-text-disabled hover:text-foreground transition-colors"
            aria-label="Exit quiz"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}
