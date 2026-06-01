interface StreakCardProps {
  streak: number
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <div className="bg-brand/5 border border-brand/15 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] text-text-secondary font-normal">Study streak</p>
        <span className="text-lg" aria-hidden>
          🔥
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-heading text-4xl font-bold text-brand">{streak}</span>
        <span className="text-[13px] text-text-secondary">days</span>
      </div>
      <p className="text-[12px] text-text-disabled mt-1">
        {streak === 0
          ? 'Take a quiz today to start your streak'
          : streak === 1
            ? 'Great start — keep it going!'
            : `${streak} consecutive days of studying`}
      </p>
    </div>
  )
}
