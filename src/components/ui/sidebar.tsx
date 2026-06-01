'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { LayoutDashboard, PlusCircle, FileText, Settings, Plus, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubjectArea {
  id: string
  title: string
}

interface SidebarProps {
  activePath: string
  subjectAreas: SubjectArea[]
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quiz/new', label: 'New quiz', icon: PlusCircle },
  { href: '/reports', label: 'Reports', icon: FileText },
]

function OctopusMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('w-7 h-7', className)}
    >
      <circle cx="16" cy="12" r="8" fill="hsl(var(--brand-primary))" />
      <circle cx="13" cy="10" r="1.5" fill="white" />
      <circle cx="19" cy="10" r="1.5" fill="white" />
      <path
        d="M9 18 Q7 22 8 26"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 20 Q10 25 11 28"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 21 Q16 26 15 29"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 20 Q22 25 21 28"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M23 18 Q25 22 24 26"
        stroke="hsl(var(--brand-primary))"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Sidebar({ activePath, subjectAreas }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useUser()

  const effectivePath = activePath || pathname

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.firstName
        ? user.firstName.slice(0, 2).toUpperCase()
        : 'U'

  return (
    <aside className="hidden md:flex w-[220px] shrink-0 flex-col bg-surface border-r border-border/50 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pb-6 pt-6 border-b border-border/50">
        <OctopusMark />
        <span className="font-heading font-bold text-[15px] text-foreground tracking-tight">
          OctoLearn
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 pt-4 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = effectivePath === item.href || effectivePath.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] transition-colors',
                isActive
                  ? 'bg-brand/10 text-foreground border-l-2 border-brand'
                  : 'text-text-secondary hover:bg-brand/5 hover:text-foreground',
              )}
            >
              <Icon
                className={cn('size-4 shrink-0', isActive ? 'text-brand' : 'text-text-secondary')}
              />
              {item.label}
            </Link>
          )
        })}

        {/* Knowledge areas */}
        <div className="mt-4 mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[1.5px] text-text-disabled">
          Knowledge areas
        </div>
        <div className="flex flex-col gap-0.5">
          {subjectAreas.map((area) => (
            <Link
              key={area.id}
              href={`/quiz/new?area=${encodeURIComponent(area.title)}`}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors',
                'text-text-secondary hover:bg-brand/5 hover:text-foreground',
              )}
            >
              <BookOpen className="size-3.5 shrink-0 text-text-disabled" />
              <span className="truncate">{area.title}</span>
            </Link>
          ))}
          <Link
            href="/quiz/new"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-text-disabled hover:text-text-secondary transition-colors"
          >
            <Plus className="size-3.5 shrink-0" />
            Add area
          </Link>
        </div>
      </nav>

      {/* User info */}
      <div className="px-3 pt-3 pb-4 border-t border-border/50 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center text-[11px] font-semibold text-text-inverse shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-foreground truncate">
            {user?.fullName ?? user?.firstName ?? 'User'}
          </p>
          <p className="text-[11px] text-text-disabled truncate">
            {user?.primaryEmailAddress?.emailAddress ?? ''}
          </p>
        </div>
        <Link
          href="/settings"
          className="text-text-disabled hover:text-text-secondary transition-colors"
        >
          <Settings className="size-4" />
        </Link>
      </div>
    </aside>
  )
}
