import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

function OctopusHero() {
  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto">
      {/* Main octopus SVG */}
      <svg
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Glow */}
        <ellipse
          cx="150"
          cy="155"
          rx="70"
          ry="60"
          fill="hsl(var(--brand-primary))"
          opacity="0.12"
        />
        {/* Body */}
        <ellipse cx="150" cy="130" rx="55" ry="60" fill="hsl(var(--brand-primary))" />
        <ellipse cx="150" cy="130" rx="50" ry="55" fill="hsl(263 70% 58%)" />
        {/* Eyes */}
        <circle cx="134" cy="118" r="9" fill="white" />
        <circle cx="166" cy="118" r="9" fill="white" />
        <circle cx="136" cy="120" r="5" fill="hsl(222 47% 11%)" />
        <circle cx="168" cy="120" r="5" fill="hsl(222 47% 11%)" />
        <circle cx="138" cy="118" r="1.5" fill="white" />
        <circle cx="170" cy="118" r="1.5" fill="white" />
        {/* Mouth */}
        <path
          d="M141 138 Q150 145 159 138"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arms */}
        <path
          d="M105 165 Q80 190 82 215 Q84 230 90 228"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M118 178 Q100 205 100 228 Q100 240 106 240"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M135 183 Q130 210 133 235 Q134 248 138 248"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M150 185 Q150 212 152 236 Q153 248 155 250"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M165 183 Q170 210 168 235 Q167 248 163 248"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M178 178 Q196 205 196 228 Q196 240 190 240"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M192 165 Q215 190 214 215 Q212 230 206 228"
          stroke="hsl(var(--brand-primary))"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arm highlights */}
        <path
          d="M105 165 Q80 190 82 215 Q84 230 90 228"
          stroke="hsl(263 70% 65%)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
        <path
          d="M192 165 Q215 190 214 215 Q212 230 206 228"
          stroke="hsl(263 70% 65%)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </svg>

      {/* Floating badges */}
      <div className="absolute -top-2 -right-2 bg-surface border border-border/70 rounded-xl px-3 py-2 text-[11px] font-medium text-foreground shadow-md">
        AWS ☁️
      </div>
      <div className="absolute top-1/4 -left-6 bg-surface border border-border/70 rounded-xl px-3 py-2 text-[11px] font-medium text-foreground shadow-md">
        TypeScript 🔷
      </div>
      <div className="absolute bottom-1/4 -right-4 bg-surface border border-border/70 rounded-xl px-3 py-2 text-[11px] font-medium text-foreground shadow-md">
        React Native ⚛️
      </div>
      <div className="absolute -bottom-2 left-1/4 bg-surface border border-border/70 rounded-xl px-3 py-2 text-[11px] font-medium text-foreground shadow-md">
        Java ☕
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 px-6 md:px-10">
      {/* Background gradient blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, hsl(var(--brand-primary)) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-3.5 py-1.5 text-[12px] font-medium text-brand mb-6">
            <span>AI-powered knowledge retention</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-tight tracking-tight text-foreground mb-5">
            Study more. <span className="text-brand">Forget less.</span> Know more.
          </h1>

          <p className="text-[16px] text-text-secondary leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
            Input what you studied today, get a personalized quiz, and build a lasting knowledge
            base — all powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-10">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-brand text-text-inverse font-medium text-[15px] px-6 py-3.5 rounded-xl hover:bg-brand-hover transition-colors"
            >
              Start learning free
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border border-border/70 text-text-secondary font-normal text-[15px] px-6 py-3.5 rounded-xl hover:border-border hover:text-foreground transition-colors"
            >
              <Play className="size-3.5 fill-current" />
              See how it works
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="flex -space-x-2">
              {['CR', 'AS', 'MK', 'JL'].map((init) => (
                <div
                  key={init}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-brand-hover border-2 border-background flex items-center justify-center text-[10px] font-semibold text-text-inverse"
                >
                  {init}
                </div>
              ))}
            </div>
            <span className="text-[13px] text-text-secondary">
              Trusted by <span className="text-foreground font-medium">200+</span> engineers
              studying in public
            </span>
          </div>
        </div>

        {/* Right: mascot */}
        <div className="flex justify-center">
          <OctopusHero />
        </div>
      </div>
    </section>
  )
}
