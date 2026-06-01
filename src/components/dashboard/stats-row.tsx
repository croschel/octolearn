import { cn } from '@/lib/utils'

interface StatsRowProps {
  totalQuizzes: number
  avgScore: number
  areasStudied: number
  streak: number
}

function StatCard({
  label,
  value,
  sub,
  valueClassName,
}: {
  label: string
  value: string | number
  sub?: string
  valueClassName?: string
}) {
  return (
    <div className="bg-surface border border-border/50 rounded-xl p-4">
      <p className="text-[11px] text-text-secondary mb-1.5 font-normal">{label}</p>
      <p
        className={cn(
          'font-heading text-[26px] font-bold text-foreground leading-none',
          valueClassName,
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[11px] text-brand/70 mt-1.5">{sub}</p>}
    </div>
  )
}

export function StatsRow({ totalQuizzes, avgScore, areasStudied, streak }: StatsRowProps) {
  const avgScoreClassName =
    avgScore >= 80
      ? 'text-success'
      : avgScore >= 60
        ? 'text-warning'
        : avgScore > 0
          ? 'text-error'
          : 'text-foreground'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7">
      <StatCard
        label="Total quizzes"
        value={totalQuizzes}
        sub={totalQuizzes === 1 ? '1 session' : `${totalQuizzes} sessions`}
      />
      <StatCard
        label="Avg score"
        value={avgScore > 0 ? `${avgScore}%` : '—'}
        sub={
          avgScore >= 80
            ? 'Excellent'
            : avgScore >= 60
              ? 'Good progress'
              : avgScore > 0
                ? 'Keep going'
                : 'No data yet'
        }
        valueClassName={avgScoreClassName}
      />
      <StatCard
        label="Areas studied"
        value={areasStudied}
        sub={areasStudied === 1 ? '1 subject' : `${areasStudied} subjects`}
      />
      <StatCard
        label="Study streak"
        value={streak > 0 ? `${streak}` : '0'}
        sub={streak > 0 ? `🔥 ${streak} day${streak === 1 ? '' : 's'} in a row` : 'Start today!'}
      />
    </div>
  )
}
