import { BrainCircuit, Layers, BookOpen } from 'lucide-react'

const points = [
  {
    icon: BrainCircuit,
    title: 'You forget faster than you learn',
    description:
      "Without active recall, up to 70% of new knowledge is lost within 24 hours. Passive re-reading doesn't stick.",
  },
  {
    icon: Layers,
    title: 'You study many things at once',
    description:
      'Jumping between AWS, TypeScript, and system design makes it hard to track what you actually know.',
  },
  {
    icon: BookOpen,
    title: 'Re-reading wastes your time',
    description:
      'Highlighting and re-reading gives the illusion of learning without building durable memory pathways.',
  },
]

export function PainPoints() {
  return (
    <section className="py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-brand mb-3">
            The problem
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Why most study sessions don&apos;t stick
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border/30 border border-border/30 rounded-2xl overflow-hidden">
          {points.map((point) => {
            const Icon = point.icon
            return (
              <div key={point.title} className="bg-surface p-8 flex flex-col gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/15 flex items-center justify-center">
                  <Icon className="size-5 text-brand" />
                </div>
                <h3 className="font-heading text-[16px] font-semibold text-foreground leading-snug">
                  {point.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {point.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
