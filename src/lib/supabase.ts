import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (import.meta.env as unknown as Record<string, string>).NEXT_PUBLIC_SUPABASE_URL ||
  (import.meta.env as unknown as Record<string, string>).SUPABASE_URL ||
  ''

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (import.meta.env as unknown as Record<string, string>).NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  (import.meta.env as unknown as Record<string, string>).SUPABASE_ANON_KEY ||
  ''


export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseAnonKey.includes('your-anon-key'),
)

// Fallback dummy URL and anon key to prevent createClient crash if env vars are unset during dev
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder-citypulse.supabase.co'
const safeAnonKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key'

export const supabase = createClient<Database>(safeUrl, safeAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
