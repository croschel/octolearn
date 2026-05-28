import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export function createServerClient(serviceRoleKey?: string) {
  const key = serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
