import { ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Input your topics',
    description:
      "Tell OctoLearn what subject area you're studying and which specific topics you covered today. Takes 30 seconds.",
  },
  {
    number: '02',
    title: 'Take the quiz',
    description:
      'Get a personalized quiz with a mix of multiple-choice and descriptive questions. Wrong answers trigger helpful hints.',
  },
  {
    number: '03',
    title: 'Get your report',
    description:
      'Receive a full report with your score, a learning resume, and curated references ranked free to paid.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 md:px-10 bg-surface/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-brand mb-3">
            How it works
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Three steps to lasting knowledge
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector arrows — desktop only */}
          <div className="hidden md:flex absolute top-8 left-[calc(33.3%+12px)] right-[calc(33.3%+12px)] items-center justify-between pointer-events-none z-10">
            <ArrowRight className="size-5 text-text-disabled" />
            <ArrowRight className="size-5 text-text-disabled" />
          </div>

          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-surface border border-border/50 rounded-2xl p-6 flex flex-col gap-4"
            >
              <span
                className="font-heading text-6xl font-bold tracking-tight leading-none"
                style={{ color: 'hsl(var(--brand-primary) / 0.07)' }}
                aria-hidden
              >
                {step.number}
              </span>
              <div className="-mt-4">
                <p className="text-[11px] font-medium uppercase tracking-[2px] text-brand/70 mb-2">
                  Step {step.number}
                </p>
                <h3 className="font-heading text-[18px] font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
