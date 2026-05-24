'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { AppState, EventLogEntry } from '@/types'
import {
  getLocalState,
  setLocalState,
  getLocalEventLog,
  setLocalEventLog,
  fetchUserData,
  upsertUserData,
  updateLastAppOpen,
  touchUserUpdated,
  getCurrentSession,
} from '@/lib/userDataService'
import { recomputeRunState, runMigrations } from '@/lib/stateUtils'

interface AppContextValue {
  state: AppState | null
  eventLog: EventLogEntry[]
  userId: string | null
  supaReady: boolean
  isLoading: boolean
  saveState: (nextState: AppState, nextLog?: EventLogEntry[]) => void
  setState: React.Dispatch<React.SetStateAction<AppState | null>>
  setEventLog: React.Dispatch<React.SetStateAction<EventLogEntry[]>>
  track: (event: string, props?: Record<string, unknown>) => void
  hydrateState: () => Promise<void>
  setUserId: React.Dispatch<React.SetStateAction<string | null>>
  setSupaReady: React.Dispatch<React.SetStateAction<boolean>>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null)
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [supaReady, setSupaReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialHydrationRef = useRef(true)

  const queueSupabaseWrite = useCallback(
    (nextState: AppState, nextLog: EventLogEntry[]) => {
      if (!userId || !supaReady || initialHydrationRef.current) return
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current)
      writeTimerRef.current = setTimeout(async () => {
        try {
          await upsertUserData(userId, nextState, nextLog)
        } catch (e) {
          console.error('Supabase write failed', e)
        }
      }, 200)
    },
    [userId, supaReady]
  )

  const saveState = useCallback(
    (nextState: AppState, nextLog?: EventLogEntry[]) => {
      const deduped = {
        ...nextState,
        unlockedMilestones: Array.from(new Set(nextState.unlockedMilestones || [])),
      }
      const log = nextLog ?? eventLog

      if (!userId || !supaReady) {
        setLocalState(deduped)
        setLocalEventLog(log)
      }

      setState(deduped)
      if (nextLog) setEventLog(nextLog)
      queueSupabaseWrite(deduped, log)
    },
    [userId, supaReady, eventLog, queueSupabaseWrite]
  )

  const track = useCallback(
    (event: string, props: Record<string, unknown> = {}) => {
      setEventLog((prev) => {
        const entry: EventLogEntry = {
          event,
          properties: { timestamp: new Date().toISOString(), ...props },
        }
        const next = [...prev, entry]
        setLocalEventLog(next)
        return next
      })
    },
    []
  )

  const hydrateState = useCallback(async () => {
    initialHydrationRef.current = true
    try {
      const { data: sessionData } = await getCurrentSession()
      const session = sessionData?.session
      if (session?.user) {
        const uid = session.user.id
        setUserId(uid)
        const { data, error } = await fetchUserData(uid)
        if (data && !error) {
          const migrated = runMigrations(data.state as AppState)
          const computed = recomputeRunState(migrated)
          setState(computed)
          setEventLog(data.event_log || [])
          setLocalState(computed)
          setLocalEventLog(data.event_log || [])
          setSupaReady(true)
        } else {
          const local = getLocalState()
          const localLog = getLocalEventLog()
          if (local) {
            const migrated = runMigrations(local)
            const computed = recomputeRunState(migrated)
            setState(computed)
            setEventLog(localLog)
            await upsertUserData(uid, computed, localLog)
          }
          setSupaReady(true)
        }
      } else {
        const local = getLocalState()
        const localLog = getLocalEventLog()
        if (local) {
          const migrated = runMigrations(local)
          setState(recomputeRunState(migrated))
          setEventLog(localLog)
        }
        setSupaReady(false)
      }
    } catch (err) {
      console.error('hydrateState failed', err)
      const local = getLocalState()
      if (local) setState(recomputeRunState(runMigrations(local)))
    } finally {
      initialHydrationRef.current = false
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    hydrateState()
  }, [hydrateState])

  // Update last_app_open_at when the app becomes active in the browser.
  useEffect(() => {
    if (!userId) return
    // Simpler approach: touch the existing `user_data.updated_at` timestamp
    // on every app open/focus. This avoids adding new columns and is easy to
    // query for activity. It requires the `user_data` table to have an
    // `updated_at` column (most Supabase setups include it).
    touchUserUpdated(userId).catch(() => {})

    const onFocus = () => {
      touchUserUpdated(userId).catch(() => {})
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') touchUserUpdated(userId).catch(() => {})
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [userId])

  return (
    <AppContext.Provider
      value={{
        state,
        eventLog,
        userId,
        supaReady,
        isLoading,
        saveState,
        setState,
        setEventLog,
        track,
        hydrateState,
        setUserId,
        setSupaReady,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
