import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  size?: 'sm' | 'md'
}

function getScoreTier(score: number): { label: string; className: string } {
  if (score >= 80)
    return { label: `${score}%`, className: 'bg-success/10 text-success border-success/20' }
  if (score >= 60)
    return { label: `${score}%`, className: 'bg-warning/10 text-warning border-warning/20' }
  return { label: `${score}%`, className: 'bg-error/10 text-error border-error/20' }
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const { label, className } = getScoreTier(score)
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-[12px] px-2.5 py-1',
        className,
      )}
    >
      {label}
    </span>
  )
}
