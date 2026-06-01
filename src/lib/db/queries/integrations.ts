import { createServerClient } from '@/lib/db/client'
import { tryCatch } from '@/lib/utils/try-catch'
import type { Result } from '@/lib/utils/try-catch'

export interface UserIntegration {
  id: string
  user_id: string
  provider: 'notion' | 'google'
  access_token: string
  refresh_token: string | null
  expires_at: string | null
  notion_bot_id: string | null
  notion_workspace_name: string | null
  created_at: string
  updated_at: string
}

export interface IntegrationData {
  access_token: string
  refresh_token?: string | null
  expires_at?: string | null
  notion_bot_id?: string | null
  notion_workspace_name?: string | null
}

export async function getUserIntegration(
  userId: string,
  provider: 'notion' | 'google',
): Promise<Result<UserIntegration | null>> {
  return tryCatch(async () => {
    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('user_integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data as UserIntegration | null
  }, 'INTEGRATION_FETCH_FAILED')
}

export async function upsertUserIntegration(
  userId: string,
  provider: 'notion' | 'google',
  data: IntegrationData,
): Promise<Result<UserIntegration>> {
  return tryCatch(async () => {
    const supabase = createServerClient()
    const { data: row, error } = await supabase
      .from('user_integrations')
      .upsert(
        {
          user_id: userId,
          provider,
          access_token: data.access_token,
          refresh_token: data.refresh_token ?? null,
          expires_at: data.expires_at ?? null,
          notion_bot_id: data.notion_bot_id ?? null,
          notion_workspace_name: data.notion_workspace_name ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' },
      )
      .select()
      .single()

    if (error || !row) throw new Error(error?.message ?? 'Failed to upsert integration')
    return row as UserIntegration
  }, 'INTEGRATION_UPSERT_FAILED')
}

export async function deleteUserIntegration(
  userId: string,
  provider: 'notion' | 'google',
): Promise<Result<void>> {
  return tryCatch(async () => {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('user_integrations')
      .delete()
      .eq('user_id', userId)
      .eq('provider', provider)

    if (error) throw new Error(error.message)
  }, 'INTEGRATION_DELETE_FAILED')
}
