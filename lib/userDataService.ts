import { supabase } from './supabase'
import type { AppState, EventLogEntry } from '@/types'

const LOCAL_STATE_KEY = 'bf_state'
const LOCAL_EVENT_LOG_KEY = 'bf_event_log'

export function getLocalState(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setLocalState(state: AppState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state))
}

export function getLocalEventLog(): EventLogEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_EVENT_LOG_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function setLocalEventLog(log: EventLogEntry[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_EVENT_LOG_KEY, JSON.stringify(log))
}

export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.clear()
}

export async function fetchUserData(userId: string) {
  return supabase
    .from('user_data')
    .select('state, event_log')
    .eq('user_id', userId)
    .single()
}

export async function upsertUserData(
  userId: string,
  state: AppState,
  eventLog: EventLogEntry[]
) {
  return supabase
    .from('user_data')
    .upsert({ user_id: userId, state, event_log: eventLog })
}

export async function getCurrentSession() {
  return supabase.auth.getSession()
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function resetPasswordForEmail(email: string, redirectTo: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo })
}

export async function updateUserPassword(password: string) {
  return supabase.auth.updateUser({ password })
}
