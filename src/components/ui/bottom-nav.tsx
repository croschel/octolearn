'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/quiz/new', label: 'New quiz', icon: PlusCircle },
  { href: '/reports', label: 'Reports', icon: FileText },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border/50 flex items-stretch">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[10px] transition-colors',
              isActive ? 'text-brand' : 'text-text-secondary',
            )}
          >
            <Icon className="size-5 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
