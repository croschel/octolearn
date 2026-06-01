import { createElement } from 'react'
import { Cloud, Coffee, Atom, Code2, Terminal, Container, BookOpen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubjectAreaIconProps {
  title: string
  className?: string
}

function getIcon(title: string): LucideIcon {
  const lower = title.toLowerCase()
  if (lower.includes('aws') || lower.includes('amazon') || lower.includes('cloud')) return Cloud
  if (lower.includes('java') && !lower.includes('javascript')) return Coffee
  if (lower.includes('react') || lower.includes('angular') || lower.includes('vue')) return Atom
  if (lower.includes('typescript') || lower.includes('javascript')) return Code2
  if (
    lower.includes('python') ||
    lower.includes('node') ||
    lower.includes('go ') ||
    lower.includes('golang')
  )
    return Terminal
  if (lower.includes('docker') || lower.includes('kubernetes') || lower.includes('k8s'))
    return Container
  return BookOpen
}

export function SubjectAreaIcon({ title, className }: SubjectAreaIconProps) {
  return createElement(getIcon(title), { className: cn('size-4', className) })
}
