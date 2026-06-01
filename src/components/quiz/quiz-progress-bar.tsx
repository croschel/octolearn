'use client'

interface QuizProgressBarProps {
  current: number
  total: number
}

export function QuizProgressBar({ current, total }: QuizProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="h-[2px] bg-brand/10 w-full">
      <div
        className="h-full bg-brand transition-all duration-500 ease-in-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
