'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SubjectAreaCard } from '@/components/dashboard/subject-area-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import type { SubjectAreaWithStats } from '@/lib/db/queries/subject-areas'

interface SubjectAreasGridProps {
  areas: SubjectAreaWithStats[]
}

export function SubjectAreasGrid({ areas }: SubjectAreasGridProps) {
  const router = useRouter()

  if (areas.length === 0) {
    return (
      <EmptyState
        title="Start your first quiz"
        description="Create a quiz for any subject you're studying to see your progress here."
        icon="octopus"
        action={
          <Link href="/quiz/new">
            <Button size="default">New quiz</Button>
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <h2 className="font-heading text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-3">
        Knowledge areas
      </h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {areas.map((area) => (
          <SubjectAreaCard
            key={area.id}
            title={area.title}
            quizCount={area.quizCount}
            lastQuizDate={area.lastQuizDate}
            avgScore={area.avgScore}
            onClick={() => router.push(`/quiz/new?area=${encodeURIComponent(area.title)}`)}
          />
        ))}
      </div>
    </div>
  )
}
