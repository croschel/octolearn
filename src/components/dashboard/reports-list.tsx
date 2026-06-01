'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { ScoreBadge } from '@/components/quiz/score-badge'
import { EmptyState } from '@/components/ui/empty-state'
import { ReportsFilterBar } from '@/components/dashboard/reports-filter-bar'
import { formatDate } from '@/lib/utils/date'
import type { ReportRow } from '@/types/database'
import { Button } from '@/components/ui/button'

interface ReportsListProps {
  reports: ReportRow[]
}

function getWeekStart(): Date {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d
}

function getMonthStart(): Date {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d
}

export function ReportsList({ reports }: ReportsListProps) {
  const [selectedArea, setSelectedArea] = useState('all')
  const [selectedScore, setSelectedScore] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')

  const areas = [...new Set(reports.map((r) => r.subject_area))].sort()

  const filtered = reports.filter((r) => {
    if (selectedArea !== 'all' && r.subject_area !== selectedArea) return false
    if (selectedScore === 'strong' && r.score_percentage < 80) return false
    if (selectedScore === 'average' && (r.score_percentage < 60 || r.score_percentage >= 80))
      return false
    if (selectedScore === 'needs-work' && r.score_percentage >= 60) return false
    if (selectedDate === 'week' && new Date(r.created_at) < getWeekStart()) return false
    if (selectedDate === 'month' && new Date(r.created_at) < getMonthStart()) return false
    return true
  })

  return (
    <div>
      <ReportsFilterBar
        areas={areas}
        selectedArea={selectedArea}
        selectedScore={selectedScore}
        selectedDate={selectedDate}
        onAreaChange={setSelectedArea}
        onScoreChange={setSelectedScore}
        onDateChange={setSelectedDate}
      />

      {filtered.length === 0 ? (
        <EmptyState
          title="No quizzes yet"
          description="Start your first quiz to see your reports here."
          icon="octopus"
          action={
            <Link href="/quiz/new">
              <Button size="default">New quiz</Button>
            </Link>
          }
        />
      ) : (
        <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
          <div className="divide-y divide-border/20">
            {filtered.map((report) => (
              <Link
                key={report.id}
                href={`/quiz/${report.session_id}/report`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-brand/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[13px] font-medium text-foreground">{report.subject_area}</p>
                    {(report.notion_page_id || report.drive_file_id) && (
                      <span className="flex items-center gap-1">
                        {report.notion_page_id && (
                          <span title="Saved to Notion">
                            <CheckCircle className="size-3 text-brand-accent" />
                          </span>
                        )}
                        {report.drive_file_id && (
                          <span title="Saved to Drive">
                            <CheckCircle className="size-3 text-brand" />
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-disabled truncate">
                    {report.topics_covered.slice(0, 3).join(', ')}
                    {report.topics_covered.length > 3 &&
                      ` +${report.topics_covered.length - 3} more`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ScoreBadge score={report.score_percentage} size="sm" />
                  <span className="text-[11px] text-text-disabled hidden sm:block">
                    {formatDate(report.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
