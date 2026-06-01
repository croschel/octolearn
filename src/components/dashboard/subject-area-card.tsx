import { cn } from '@/lib/utils'
import { formatDistanceToNow } from '@/lib/utils/date'

interface SubjectAreaCardProps {
  title: string
  quizCount: number
  lastQuizDate: string | null
  avgScore: number
  onClick?: () => void
}

function getScoreBorderClass(score: number): string {
  if (score >= 80) return 'border-l-success'
  if (score >= 60) return 'border-l-warning'
  if (score > 0) return 'border-l-error'
  return 'border-l-border'
}

function getScorePillClass(score: number): string {
  if (score >= 80) return 'bg-success/10 text-success border-success/20'
  if (score >= 60) return 'bg-warning/10 text-warning border-warning/20'
  if (score > 0) return 'bg-error/10 text-error border-error/20'
  return 'bg-surface text-text-secondary border-border/50'
}

function getProgressClass(score: number): string {
  if (score >= 80) return 'bg-success'
  if (score >= 60) return 'bg-warning'
  if (score > 0) return 'bg-error'
  return 'bg-border'
}

export function SubjectAreaCard({
  title,
  quizCount,
  lastQuizDate,
  avgScore,
  onClick,
}: SubjectAreaCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full text-left bg-surface border border-border/50 rounded-xl p-4',
        'border-l-2 transition-all hover:border-brand/30 hover:shadow-md',
        getScoreBorderClass(avgScore),
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-heading text-[15px] font-semibold text-foreground leading-snug group-hover:text-brand transition-colors">
          {title}
        </h3>
        <span
          className={cn(
            'shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full border',
            getScorePillClass(avgScore),
          )}
        >
          {avgScore > 0 ? `${avgScore}%` : 'New'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-border/30 rounded-full mb-3 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', getProgressClass(avgScore))}
          style={{ width: `${Math.min(avgScore, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-text-disabled">
        <span>
          {quizCount} quiz{quizCount !== 1 ? 'zes' : ''}
        </span>
        <span>{lastQuizDate ? `Last: ${formatDistanceToNow(lastQuizDate)}` : 'Not started'}</span>
      </div>
    </button>
  )
}
