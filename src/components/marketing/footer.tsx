import Link from 'next/link'

function OctopusMark() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
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

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-8 px-6 md:px-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <OctopusMark />
          <span className="font-heading font-bold text-[14px] text-foreground">OctoLearn</span>
        </Link>
        <p className="text-[12px] text-text-disabled order-last md:order-none">
          © {new Date().getFullYear()} OctoLearn. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          {['Privacy', 'Terms', 'Contact'].map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-[12px] text-text-secondary hover:text-foreground transition-colors"
            >
              {link}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
