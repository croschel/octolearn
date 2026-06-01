import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/ui/sidebar'
import { BottomNav } from '@/components/ui/bottom-nav'
import { getSubjectAreasForUser } from '@/lib/db/queries/subject-areas'
import { headers } from 'next/headers'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const headersList = await headers()
  const pathname = headersList.get('x-invoke-path') ?? '/dashboard'

  let subjectAreas: { id: string; title: string }[] = []
  try {
    const areas = await getSubjectAreasForUser(userId)
    subjectAreas = areas.map((a) => ({ id: a.id, title: a.title }))
  } catch {
    // Non-critical — render with empty list
  }

  return (
    <div className="flex h-full min-h-screen bg-background">
      <Sidebar activePath={pathname} subjectAreas={subjectAreas} />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
