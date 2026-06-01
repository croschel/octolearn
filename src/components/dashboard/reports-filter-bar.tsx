'use client'

interface ReportsFilterBarProps {
  areas: string[]
  selectedArea: string
  selectedScore: string
  selectedDate: string
  onAreaChange: (v: string) => void
  onScoreChange: (v: string) => void
  onDateChange: (v: string) => void
}

const scoreOptions = [
  { value: 'all', label: 'All scores' },
  { value: 'strong', label: 'Strong (≥ 80%)' },
  { value: 'average', label: 'Average (60-79%)' },
  { value: 'needs-work', label: 'Needs work (< 60%)' },
]

const dateOptions = [
  { value: 'all', label: 'All time' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

const selectClass =
  'bg-surface border border-border/50 rounded-lg px-3 py-2 text-[12px] text-text-secondary outline-none focus:border-brand/50 transition-colors cursor-pointer'

export function ReportsFilterBar({
  areas,
  selectedArea,
  selectedScore,
  selectedDate,
  onAreaChange,
  onScoreChange,
  onDateChange,
}: ReportsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      <select
        value={selectedArea}
        onChange={(e) => onAreaChange(e.target.value)}
        className={selectClass}
      >
        <option value="all">All areas</option>
        {areas.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>

      <select
        value={selectedScore}
        onChange={(e) => onScoreChange(e.target.value)}
        className={selectClass}
      >
        {scoreOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <select
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className={selectClass}
      >
        {dateOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
