import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const fallbackUrl = 'https://placeholder.supabase.co'
const fallbackAnonKey = 'public-anon-key-placeholder'

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = createClient(
	supabaseUrl || fallbackUrl,
	supabaseAnonKey || fallbackAnonKey,
	isSupabaseConfigured
		? undefined
		: {
				auth: {
					persistSession: false,
					autoRefreshToken: false,
				},
			}
)
