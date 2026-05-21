import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Keep client creation resilient during static builds when env vars are absent.
export const supabase = createClient(
	isSupabaseConfigured ? supabaseUrl : 'https://example.supabase.co',
	isSupabaseConfigured ? supabaseAnonKey : 'public-anon-key-placeholder'
)
