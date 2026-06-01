'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="p-6 md:p-8 flex items-center justify-center min-h-[40vh]">
      <div className="bg-surface border border-border/50 rounded-2xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="size-8 text-warning mx-auto mb-4" />
        <h2 className="font-heading text-[16px] font-semibold text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-[13px] text-text-secondary mb-6">{error.message}</p>
        <div className="flex items-center justify-center gap-3">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
          <Link href="/dashboard">
            <Button size="sm" variant="outline">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
