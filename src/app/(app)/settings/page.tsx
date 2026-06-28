import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { IntegrationCard } from '@/components/settings/integration-card'
import { AccountSection } from '@/components/settings/account-section'
import { getUserIntegration } from '@/lib/db/queries/integrations'

interface SettingsPageProps {
  searchParams: Promise<{ connected?: string; error?: string }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [user, notionResult] = await Promise.all([
    currentUser(),
    getUserIntegration(userId, 'notion'),
  ])

  const params = await searchParams
  const notionIntegration = notionResult.data ?? null

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <PageHeader title="Settings" subtitle="Manage your account and connected integrations." />

      {/* Connected accounts */}
      <section className="mb-10">
        <h2 className="font-heading text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Connected accounts
        </h2>

        <div className="flex flex-col gap-3">
          <IntegrationCard
            provider="notion"
            workspaceName={notionIntegration?.notion_workspace_name ?? null}
            isConnected={notionIntegration !== null}
            connectHref="/api/auth/notion/start"
            successMessage={
              params.connected === 'notion' ? 'Notion connected successfully!' : undefined
            }
            errorMessage={
              params.error === 'notion' ? 'Failed to connect Notion. Please try again.' : undefined
            }
          />
        </div>
      </section>

      {/* Account */}
      <section>
        <h2 className="font-heading text-[13px] font-semibold text-text-secondary uppercase tracking-wider mb-4">
          Account
        </h2>
        <AccountSection
          name={user?.fullName ?? user?.firstName ?? 'Unknown'}
          email={user?.primaryEmailAddress?.emailAddress ?? ''}
        />
      </section>
    </div>
  )
}
