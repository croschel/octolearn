import { Client } from '@notionhq/client'
import { getUserIntegration } from '@/lib/db/queries/integrations'

export class NotionNotConnectedError extends Error {
  constructor() {
    super('Notion account is not connected. Please connect it from Settings.')
    this.name = 'NotionNotConnectedError'
  }
}

export async function getNotionClient(userId: string): Promise<Client> {
  const result = await getUserIntegration(userId, 'notion')

  if (result.error) {
    throw new Error(`Failed to fetch Notion integration: ${result.error.message}`)
  }

  if (!result.data) {
    throw new NotionNotConnectedError()
  }

  return new Client({ auth: result.data.access_token })
}
