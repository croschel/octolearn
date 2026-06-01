import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { upsertUserIntegration } from '@/lib/db/queries/integrations'

interface NotionTokenResponse {
  access_token: string
  bot_id: string
  workspace_name: string
  workspace_id: string
  workspace_icon: string | null
  owner: unknown
  duplicated_template_id: string | null
  request_id: string
}

export async function GET(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const stateParam = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  if (errorParam) {
    redirect('/settings?error=notion')
  }

  if (!code || !stateParam) {
    redirect('/settings?error=notion')
  }

  // Validate CSRF state
  const cookieStore = await cookies()
  const storedState = cookieStore.get('notion_oauth_state')?.value
  cookieStore.delete('notion_oauth_state')

  if (!storedState || storedState !== stateParam) {
    redirect('/settings?error=notion')
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const clientSecret = process.env.NOTION_CLIENT_SECRET
  const redirectUri = process.env.NOTION_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    redirect('/settings?error=notion')
  }

  let tokenData: NotionTokenResponse
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text()
      console.error('[notion/callback] token exchange failed:', errBody)
      redirect('/settings?error=notion')
    }

    tokenData = (await tokenRes.json()) as NotionTokenResponse
  } catch (err) {
    console.error('[notion/callback] fetch error:', err)
    redirect('/settings?error=notion')
  }

  const result = await upsertUserIntegration(userId, 'notion', {
    access_token: tokenData.access_token,
    notion_bot_id: tokenData.bot_id,
    notion_workspace_name: tokenData.workspace_name,
  })

  if (result.error) {
    console.error('[notion/callback] upsert failed:', result.error)
    redirect('/settings?error=notion')
  }

  redirect('/settings?connected=notion')
}
