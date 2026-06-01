import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-20 px-6 md:px-10">
      <div className="max-w-2xl mx-auto">
        <div className="border border-brand/20 bg-gradient-to-br from-brand/10 to-brand/5 rounded-3xl p-10 text-center">
          <p className="text-[12px] font-medium uppercase tracking-[2px] text-brand mb-4">
            Free to start — no credit card needed
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight mb-4">
            Start retaining what you learn today
          </h2>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8 max-w-md mx-auto">
            Join engineers and students who use OctoLearn to turn study sessions into lasting
            knowledge — one quiz at a time.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 bg-brand text-text-inverse font-medium text-[15px] px-8 py-3.5 rounded-xl hover:bg-brand-hover transition-colors"
          >
            Create your free account
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
