import { User, Mail } from 'lucide-react'

interface AccountSectionProps {
  name: string
  email: string
}

export function AccountSection({ name, email }: AccountSectionProps) {
  return (
    <div className="bg-surface border border-border/50 rounded-xl p-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/30 flex items-center justify-center">
            <User className="size-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-[11px] text-text-disabled mb-0.5">Full name</p>
            <p className="text-[13px] font-medium text-foreground">{name}</p>
          </div>
        </div>
        <div className="h-px bg-border/40" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/30 flex items-center justify-center">
            <Mail className="size-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-[11px] text-text-disabled mb-0.5">Email address</p>
            <p className="text-[13px] font-medium text-foreground">{email}</p>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-text-disabled mt-4">
        Name and email are managed by your Clerk account.
      </p>
    </div>
  )
}
