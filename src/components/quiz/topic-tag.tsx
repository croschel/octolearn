import { X } from 'lucide-react'

interface TopicTagProps {
  label: string
  onRemove: () => void
}

export function TopicTag({ label, onRemove }: TopicTagProps) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-brand/15 border border-brand/30 rounded-md px-2 py-1 text-[12px] font-medium text-foreground">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="text-text-disabled hover:text-foreground transition-colors"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}
