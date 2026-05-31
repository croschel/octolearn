import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// The Supabase generic requires the exact generated schema format.
// We use plain clients here and enforce types at the query-function boundary instead.
export type AppSupabaseClient = SupabaseClient

export function createBrowserClient(): AppSupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey)
}

export function createServerClient(serviceRoleKey?: string): AppSupabaseClient {
  const key = serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
