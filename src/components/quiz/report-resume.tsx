'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface ReportResumeProps {
  resume?: string
}

export function ReportResume({ resume }: ReportResumeProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <h2 className="font-heading text-[14px] font-semibold text-foreground">Learning resume</h2>
        {resume && (
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="text-[12px] text-text-secondary hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {collapsed ? (
              <>
                Expand <ChevronDown className="size-3.5" />
              </>
            ) : (
              <>
                Collapse <ChevronUp className="size-3.5" />
              </>
            )}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 py-4">
          {resume ? (
            <div className="prose prose-sm prose-invert max-w-none text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {resume}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
