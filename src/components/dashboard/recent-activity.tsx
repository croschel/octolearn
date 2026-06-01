import Link from 'next/link'
import { ScoreBadge } from '@/components/quiz/score-badge'
import { formatDistanceToNow } from '@/lib/utils/date'
import type { RecentSession } from '@/lib/db/queries/reports'
import { BookOpen } from 'lucide-react'

interface RecentActivityProps {
  sessions: RecentSession[]
}

export function RecentActivity({ sessions }: RecentActivityProps) {
  return (
    <div className="bg-surface border border-border/50 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-foreground">Recent activity</h2>
        {sessions.length > 0 && (
          <Link
            href="/reports"
            className="text-[12px] text-brand hover:text-brand-hover transition-colors"
          >
            View all
          </Link>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="px-4 py-6 text-[13px] text-text-disabled text-center">No sessions yet</p>
      ) : (
        <div className="divide-y divide-border/30">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/quiz/${session.session_id}/report`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-brand/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                <BookOpen className="size-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {session.subject_area}
                </p>
                <p className="text-[11px] text-text-disabled truncate">
                  {session.topics.slice(0, 2).join(', ')}
                  {session.topics.length > 2 ? ` +${session.topics.length - 2} more` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <ScoreBadge score={session.score_percentage} size="sm" />
                <span className="text-[10px] text-text-disabled">
                  {session.completed_at ? formatDistanceToNow(session.completed_at) : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
