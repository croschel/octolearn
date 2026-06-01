'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { deleteUserIntegration } from '@/lib/db/queries/integrations'
import type { Result } from '@/lib/utils/try-catch'

export async function disconnectIntegration(provider: 'notion' | 'google'): Promise<Result<void>> {
  const { userId } = await auth()
  if (!userId) {
    return { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } }
  }

  const result = await deleteUserIntegration(userId, provider)
  if (result.error) return result

  revalidatePath('/settings')
  return { data: undefined, error: null }
}
