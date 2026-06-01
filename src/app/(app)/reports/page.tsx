import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { ReportsList } from '@/components/dashboard/reports-list'
import { getReportsForUser } from '@/lib/db/queries/reports'

export default async function ReportsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const reports = await getReportsForUser(userId).catch(() => [])

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <PageHeader title="Reports" subtitle="All your completed quiz sessions." />
      <ReportsList reports={reports} />
    </div>
  )
}
