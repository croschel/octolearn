'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function OctopusMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
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

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-200',
        scrolled ? 'border-b border-border/50 backdrop-blur-md bg-background/90' : 'bg-transparent',
      )}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <OctopusMark />
          <span className="font-heading font-bold text-[17px] text-foreground tracking-tight">
            OctoLearn
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-text-secondary hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[13px] text-text-secondary hover:text-foreground transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-[13px] font-medium bg-brand text-text-inverse px-5 py-2 rounded-lg hover:bg-brand-hover transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-text-secondary hover:text-foreground transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-6 pb-6 pt-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] text-text-secondary"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
            <Link href="/sign-in" className="text-[14px] text-text-secondary py-2">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-[14px] font-medium bg-brand text-text-inverse px-5 py-3 rounded-lg text-center hover:bg-brand-hover transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
