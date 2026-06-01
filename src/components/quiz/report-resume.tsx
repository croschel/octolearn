'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { retryResume } from '@/actions/reports'
import type { ResourceList } from '@/types/report'

interface ReportResumeProps {
  resume?: string | null
  reportId?: string
  onResourcesLoaded?: (resources: ResourceList) => void
}

export function ReportResume({
  resume: initialResume,
  reportId,
  onResourcesLoaded,
}: ReportResumeProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [resume, setResume] = useState(initialResume)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  async function handleRetry() {
    if (!reportId) return
    setIsRetrying(true)
    setRetryError(null)
    const result = await retryResume(reportId)
    setIsRetrying(false)
    if (result.error) {
      setRetryError('Retry failed. Please try again.')
      return
    }
    setResume(result.data?.learning_resume ?? null)
    if (result.data?.resources && onResourcesLoaded) {
      onResourcesLoaded(result.data.resources)
    }
  }

  const showSkeleton = resume == null && !isRetrying

  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <h2 className="font-heading text-[14px] font-semibold text-foreground">Learning resume</h2>
        <div className="flex items-center gap-3">
          {showSkeleton && reportId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="text-[12px]"
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          )}
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
      </div>

      {!collapsed && (
        <div className="px-5 py-4">
          {isRetrying ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : resume ? (
            <div className="text-[13px] text-text-secondary leading-relaxed whitespace-pre-wrap">
              {resume}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </div>
              {retryError && <p className="text-[12px] text-error mt-2">{retryError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
