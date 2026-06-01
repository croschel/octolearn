import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ResourceItem {
  title: string
  url: string
  type: 'Docs' | 'Video' | 'Article' | 'Repo' | 'Course' | 'Book'
  priceRange?: '$' | '$$' | '$$$'
}

export interface TopicResources {
  topic: string
  free: ResourceItem[]
  freemium: ResourceItem[]
  paid: ResourceItem[]
}

export type ResourceList = TopicResources[]

interface ReportReferencesProps {
  resources?: ResourceList
}

const tierConfig = {
  free: { label: 'Free', className: 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' },
  freemium: { label: 'Freemium', className: 'text-warning bg-warning/10 border-warning/20' },
  paid: { label: 'Paid', className: 'text-brand bg-brand/10 border-brand/20' },
} as const

function ResourceLink({ item }: { item: ResourceItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 py-2 text-[13px] text-text-secondary hover:text-foreground group transition-colors"
    >
      <ExternalLink className="size-3.5 shrink-0 text-text-disabled group-hover:text-brand transition-colors" />
      <span className="flex-1">{item.title}</span>
      <span className="text-[10px] text-text-disabled bg-surface-raised border border-border/30 rounded px-1.5 py-0.5">
        {item.type}
      </span>
      {item.priceRange && <span className="text-[10px] text-text-disabled">{item.priceRange}</span>}
    </a>
  )
}

function TierSection({
  tier,
  items,
}: {
  tier: 'free' | 'freemium' | 'paid'
  items: ResourceItem[]
}) {
  if (items.length === 0) return null
  const config = tierConfig[tier]
  return (
    <div className="mb-3">
      <span
        className={cn(
          'inline-flex text-[10px] font-medium uppercase tracking-wider border rounded px-2 py-0.5 mb-2',
          config.className,
        )}
      >
        {config.label}
      </span>
      <div className="divide-y divide-border/20">
        {items.map((item) => (
          <ResourceLink key={item.url} item={item} />
        ))}
      </div>
    </div>
  )
}

export function ReportReferences({ resources }: ReportReferencesProps) {
  return (
    <div className="bg-surface border border-border/50 rounded-2xl overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-border/30">
        <h2 className="font-heading text-[14px] font-semibold text-foreground">References</h2>
      </div>

      <div className="px-5 py-4">
        {!resources ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <Accordion multiple defaultValue={resources.map((r) => r.topic)}>
            {resources.map((topicResource) => (
              <AccordionItem key={topicResource.topic} value={topicResource.topic}>
                <AccordionTrigger className="text-[13px] font-medium text-foreground">
                  {topicResource.topic}
                </AccordionTrigger>
                <AccordionContent>
                  <TierSection tier="free" items={topicResource.free} />
                  <TierSection tier="freemium" items={topicResource.freemium} />
                  <TierSection tier="paid" items={topicResource.paid} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  )
}
