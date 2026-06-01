import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils/date'

interface ReportScoreHeroProps {
  score: number
  correct: number
  total: number
  mcScore: { correct: number; total: number }
  descriptiveScore: { correct: number; total: number }
  subjectArea: string
  topics: string[]
  date: string
  durationMinutes: number
}

function DonutChart({ score }: { score: number }) {
  const radius = 52
  const circ = 2 * Math.PI * radius
  const strokeDash = (score / 100) * circ

  const colorClass =
    score >= 80 ? 'hsl(var(--success))' : score >= 60 ? 'hsl(var(--warning))' : 'hsl(var(--error))'

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={colorClass}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circ}`}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-heading text-3xl font-bold leading-none',
            score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error',
          )}
        >
          {score}%
        </span>
      </div>
    </div>
  )
}

function resultLabel(score: number): string {
  if (score >= 90) return 'Excellent result'
  if (score >= 80) return 'Great result'
  if (score >= 60) return 'Good effort'
  return 'Keep practicing'
}

interface ConfettiProps {
  score: number
}

function Confetti({ score }: ConfettiProps) {
  if (score < 80) return null
  const colors = ['bg-brand', 'bg-success', 'bg-warning', 'bg-brand-accent', 'bg-error', 'bg-brand']
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className={cn('absolute w-2 h-2 rounded-full opacity-0', colors[i % colors.length])}
          style={{
            left: `${8 + i * 7}%`,
            top: '20%',
            animation: `confetti-${i % 4} 1.5s ease-out ${i * 0.08}s forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function ReportScoreHero({
  score,
  correct,
  total,
  mcScore,
  descriptiveScore,
  subjectArea,
  topics,
  date,
  durationMinutes,
}: ReportScoreHeroProps) {
  return (
    <div className="relative bg-surface border border-border/50 rounded-2xl p-8 mb-6 overflow-hidden">
      <Confetti score={score} />

      <div className="text-center mb-6">
        <DonutChart score={score} />
        <p className="font-heading text-[18px] font-bold text-foreground mt-3">
          {resultLabel(score)}
        </p>
        <p className="text-[13px] text-text-secondary mt-1">
          {subjectArea} · {formatDate(date)} · {durationMinutes}m
        </p>
      </div>

      {/* Breakdown row */}
      <div className="flex items-center justify-center gap-0 divide-x divide-border/50">
        {[
          { label: 'Total', value: `${correct}/${total}` },
          { label: 'MC', value: `${mcScore.correct}/${mcScore.total}` },
          { label: 'Desc', value: `${descriptiveScore.correct}/${descriptiveScore.total}` },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center px-8 py-2">
            <span className="font-heading text-[22px] font-bold text-foreground">{item.value}</span>
            <span className="text-[11px] text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5 justify-center mt-4">
        {topics.map((t) => (
          <span
            key={t}
            className="text-[11px] text-text-secondary bg-surface-raised border border-border/30 rounded-full px-2.5 py-1"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
