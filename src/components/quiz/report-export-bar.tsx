'use client'

import { Download, FileText, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReportExportBarProps {
  sessionId: string
  reportId?: string
}

const TOOLTIP = 'Coming in the next update'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ReportExportBar(_props: ReportExportBarProps) {
  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border/50 px-5 py-3 flex items-center justify-between gap-4">
      <p className="text-[13px] text-text-secondary font-medium hidden sm:block">
        Save this report
      </p>
      <div className="flex items-center gap-2 ml-auto">
        <div title={TOOLTIP}>
          <Button variant="outline" size="sm" disabled>
            <Download className="size-4" />
            Download PDF
          </Button>
        </div>
        <div title={TOOLTIP}>
          <Button variant="outline" size="sm" disabled>
            <FileText className="size-4" />
            Save to Notion
          </Button>
        </div>
        <div title={TOOLTIP}>
          <Button size="sm" disabled>
            <HardDrive className="size-4" />
            Save to Drive
          </Button>
        </div>
      </div>
    </div>
  )
}
