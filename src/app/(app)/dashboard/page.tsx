import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PageHeader } from '@/components/ui/page-header'
import { StatsRow } from '@/components/dashboard/stats-row'
import { SubjectAreasGrid } from '@/components/dashboard/subject-areas-grid'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { StreakCard } from '@/components/dashboard/streak-card'
import { Button } from '@/components/ui/button'
import { getSubjectAreasWithStats } from '@/lib/db/queries/subject-areas'
import { getRecentSessions, getDashboardStats } from '@/lib/db/queries/reports'
import { getTimeOfDay } from '@/lib/utils/date'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const firstName = user?.firstName ?? 'there'
  const timeOfDay = getTimeOfDay()

  const [areasWithStats, recentSessions, stats] = await Promise.all([
    getSubjectAreasWithStats(userId).catch(() => []),
    getRecentSessions(userId, 5).catch(() => []),
    getDashboardStats(userId).catch(() => ({
      totalQuizzes: 0,
      avgScore: 0,
      areasStudied: 0,
      streak: 0,
    })),
  ])

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <PageHeader
        title={`Good ${timeOfDay}, ${firstName}`}
        subtitle="Track your progress and start a new quiz."
        action={
          <Link href="/quiz/new">
            <Button size="default">
              <Plus className="size-4" />
              New quiz
            </Button>
          </Link>
        }
      />

      <StatsRow
        totalQuizzes={stats.totalQuizzes}
        avgScore={stats.avgScore}
        areasStudied={stats.areasStudied}
        streak={stats.streak}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <SubjectAreasGrid areas={areasWithStats} />
        <div className="flex flex-col gap-0">
          <StreakCard streak={stats.streak} />
          <RecentActivity sessions={recentSessions} />
        </div>
      </div>
    </div>
  )
}
