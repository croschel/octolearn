'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizQuestionRow } from '@/types/database'

interface ReportQuestionBreakdownProps {
  questions: QuizQuestionRow[]
}

export function ReportQuestionBreakdown({ questions }: ReportQuestionBreakdownProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden mb-24">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand/5 transition-colors"
      >
        <h2 className="font-heading text-[14px] font-semibold text-foreground">
          Question breakdown
          <span className="text-text-disabled font-normal text-[12px] ml-2">
            ({questions.length} questions)
          </span>
        </h2>
        {open ? (
          <ChevronUp className="size-4 text-text-secondary" />
        ) : (
          <ChevronDown className="size-4 text-text-secondary" />
        )}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-t border-border/30 bg-surface-raised/50">
                <th className="px-5 py-2.5 text-left text-text-disabled font-medium">Question</th>
                <th className="px-4 py-2.5 text-left text-text-disabled font-medium">Type</th>
                <th className="px-4 py-2.5 text-left text-text-disabled font-medium">
                  Your answer
                </th>
                <th className="px-4 py-2.5 text-left text-text-disabled font-medium">
                  Correct answer
                </th>
                <th className="px-4 py-2.5 text-center text-text-disabled font-medium">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-brand/5 transition-colors">
                  <td className="px-5 py-3 text-text-secondary max-w-[260px]">
                    <p className="line-clamp-2">{q.question}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'text-[10px] font-medium px-2 py-0.5 rounded border',
                        q.type === 'multiple-choice'
                          ? 'text-brand bg-brand/10 border-brand/20'
                          : 'text-brand-accent bg-brand-accent/10 border-brand-accent/20',
                      )}
                    >
                      {q.type === 'multiple-choice' ? 'MC' : 'Desc'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[180px]">
                    <p className="line-clamp-2">{q.user_answer ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-[180px]">
                    <p className="line-clamp-2">{q.correct_answer}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {q.is_correct === true ? (
                      <CheckCircle className="size-4 text-success mx-auto" />
                    ) : q.is_correct === false ? (
                      <XCircle className="size-4 text-error mx-auto" />
                    ) : (
                      <span className="text-text-disabled">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
