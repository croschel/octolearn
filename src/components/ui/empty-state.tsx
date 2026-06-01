import { cn } from '@/lib/utils'
import { Folder } from 'lucide-react'

function OctopusHead({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-20 h-20', className)}
    >
      <ellipse cx="40" cy="36" rx="24" ry="26" fill="hsl(var(--brand-primary))" opacity="0.15" />
      <ellipse cx="40" cy="35" rx="20" ry="22" fill="hsl(var(--brand-primary))" opacity="0.6" />
      <circle cx="33" cy="30" r="4" fill="white" opacity="0.9" />
      <circle cx="47" cy="30" r="4" fill="white" opacity="0.9" />
      <circle cx="34" cy="31" r="2" fill="hsl(222 47% 11%)" />
      <circle cx="48" cy="31" r="2" fill="hsl(222 47% 11%)" />
      <path
        d="M35 40 Q40 44 45 40"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      <path
        d="M25 48 Q22 55 24 60"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M32 52 Q30 59 31 63"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M40 53 Q40 60 39 64"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M48 52 Q50 59 49 63"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M55 48 Q58 55 56 60"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
  icon?: 'octopus' | 'folder'
}

export function EmptyState({ title, description, action, icon = 'octopus' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      {icon === 'octopus' ? (
        <OctopusHead />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-surface border border-border/50 flex items-center justify-center">
          <Folder className="size-8 text-text-disabled" />
        </div>
      )}
      <div>
        <h3 className="font-heading text-[16px] font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-[13px] text-text-secondary max-w-xs">{description}</p>
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
