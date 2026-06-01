import { auth } from '@clerk/nextjs/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET(): Promise<Response> {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clientId = process.env.NOTION_CLIENT_ID
  const redirectUri = process.env.NOTION_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return Response.json({ error: 'Notion OAuth is not configured' }, { status: 500 })
  }

  const state = crypto.randomUUID()

  const cookieStore = await cookies()
  cookieStore.set('notion_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60,
    path: '/',
  })

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    owner: 'user',
    state,
  })

  redirect(`https://api.notion.com/v1/oauth/authorize?${params.toString()}`)
}
