import { Sparkles, Target, FileText, BookMarked, Share2, LayoutDashboard } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Smart quiz generation',
    description:
      '70% multiple choice + 30% descriptive questions tailored to your exact topics and difficulty.',
  },
  {
    icon: Target,
    title: 'Adaptive feedback',
    description:
      'Wrong answers get progressive hints. Three failures trigger a full AI explanation with your octopus guide.',
  },
  {
    icon: FileText,
    title: 'Learning resume',
    description:
      'Every session generates a concise written resume of what you studied and how the concepts connect.',
  },
  {
    icon: BookMarked,
    title: 'Curated references',
    description:
      "Topic-specific resources ranked from free (docs, YouTube) to paid (Udemy, O'Reilly) — specific, not generic.",
  },
  {
    icon: Share2,
    title: 'Notion & Drive export',
    description:
      'Save your report to Notion or Google Drive with one click. Your knowledge base grows automatically.',
  },
  {
    icon: LayoutDashboard,
    title: 'Knowledge dashboard',
    description:
      'Track your progress across all subject areas. See streaks, average scores, and areas to revisit.',
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[11px] font-medium uppercase tracking-[2px] text-brand mb-3">
            Features
          </p>
          <h2 className="font-heading text-3xl font-bold text-foreground tracking-tight">
            Everything you need to retain knowledge
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group bg-surface border border-border/50 rounded-2xl p-6 flex flex-col gap-3 transition-colors hover:border-brand/30 hover:bg-brand/5 cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/15 flex items-center justify-center group-hover:bg-brand/15 transition-colors">
                  <Icon className="size-5 text-brand" />
                </div>
                <h3 className="font-heading text-[15px] font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
