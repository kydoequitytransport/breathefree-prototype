'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useApp } from '@/hooks/useApp'
import { useToast } from '@/hooks/useToast'
import { useConfetti } from '@/hooks/useConfetti'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toast } from '@/components/ui/Toast'
import { OnboardingView } from '@/components/views/OnboardingView'
import { HomeView } from '@/components/views/HomeView'
import { CalendarView } from '@/components/views/CalendarView'
import { TribeView } from '@/components/views/TribeView'
import { KitView } from '@/components/views/KitView'
import { ProfileView } from '@/components/views/ProfileView'
import { TriggersView } from '@/components/views/TriggersView'
import { CravingModal } from '@/components/modals/CravingModal'
import { BreathingModal } from '@/components/modals/BreathingModal'
import { SlipModal } from '@/components/modals/SlipModal'
import { BeatModal } from '@/components/modals/BeatModal'
import { MilestoneModal } from '@/components/modals/MilestoneModal'
import { ResetOverlay } from '@/components/modals/ResetOverlay'
import { MILESTONES } from '@/constants'
import { interpolate } from '@/lib/stateUtils'
import type { ViewId, Milestone } from '@/types'
import { supabase } from '@/lib/supabase'

export default function BreatheFreeApp() {
  const { state, isLoading, saveState, hydrateState, setUserId, setSupaReady } = useApp()
  const { message: toastMsg, visible: toastVisible, toast } = useToast()
  const { fireConfetti } = useConfetti()

  const [activeView, setActiveView] = useState<ViewId>('onboarding')
  const [showNav, setShowNav] = useState(false)
  const [showCraving, setShowCraving] = useState(false)
  const [showSlip, setShowSlip] = useState(false)
  const [showBeat, setShowBeat] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(null)
  const [resetOverlay, setResetOverlay] = useState<{ email: string } | null>(null)

  // Handle Supabase recovery links (password reset)
  useEffect(() => {
    const hash = window.location.hash
    const query = window.location.search
    const parseTokens = (str: string) => {
      const params = new URLSearchParams(str.replace(/^[#?]/, ''))
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token') || '',
      }
    }

    let tokens = null
    if (hash.includes('access_token=')) tokens = parseTokens(hash)
    else if (query.includes('access_token=')) tokens = parseTokens(query)

    if (tokens?.access_token) {
      // Decode email from JWT
      let email = ''
      try {
        const payload = tokens.access_token.split('.')[1]
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        const parsed = JSON.parse(decodeURIComponent(escape(json)))
        email = parsed?.email || parsed?.user_metadata?.email || ''
      } catch { /* ignore */ }

      // Capture recovery tokens for later use by the ResetOverlay but
      // do NOT set the global session yet — avoid automatically logging
      // the user in unless they actively set a new password.
      try { (window as any)._bf_recovery = { access_token: tokens.access_token, refresh_token: tokens.refresh_token || '' } } catch (e) {}
      setResetOverlay({ email })
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }
  }, [])

  // Boot: decide initial view (run only once after hydration)
  const initialBootRef = useRef(true)
  useEffect(() => {
    if (isLoading || resetOverlay || !initialBootRef.current) return
    initialBootRef.current = false
    if (state?.name && state?.quitDate) {
      setActiveView('home')
      setShowNav(true)
    } else {
      setActiveView('onboarding')
      setShowNav(false)
    }
  }, [isLoading, state, resetOverlay])

  const handleOnboardingComplete = () => {
    setActiveView('home')
    setShowNav(true)
  }

  const handleNavigate = (view: ViewId) => {
    if (view === 'profile') {
      setActiveView('profile')
      setShowNav(false)
    } else {
      setActiveView(view)
      setShowNav(true)
    }
  }

  const handleBackFromProfile = () => {
    setActiveView('home')
    setShowNav(true)
  }

  const handleMilestoneUnlock = useCallback((key: string) => {
    const m = MILESTONES.find((x) => x.key === key)
    if (m) {
      setActiveMilestone(m)
      if (m.celebrate) fireConfetti()
    }
  }, [fireConfetti])

  const handleCravingBeat = () => {
    setShowBeat(true)
    fireConfetti()
  }

  const handleSlipConfirm = () => {
    toast('Plan locked in. Current run reset — everything else is still yours.')
  }

  const handleLogout = () => {
    setActiveView('onboarding')
    setShowNav(false)
  }

  if (isLoading) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--leaf)">
            <path d="M21 4c-9 0-16 7-16 16 0 0.5 0 1 0.1 1.5C13 21 19 15 21 4z" />
          </svg>
          <p style={{ marginTop: 12, color: 'var(--mid-brown)', fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Reset overlay for password recovery */}
      {resetOverlay && (
        <ResetOverlay
          isOpen={true}
          email={resetOverlay.email}
          onClose={() => {
            ;(async () => {
              try {
                // Clear captured recovery tokens
                try { (window as any)._bf_recovery = null } catch (e) {}
                // Clear local/session storage so no stale session persists
                try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}
                // Try server-side sign out to clear any auth cookies
                try { await supabase.auth.signOut() } catch (e) {}
                // Clear non-HttpOnly cookies visible to JS
                try {
                  document.cookie.split(';').forEach(function(c) {
                    const eqPos = c.indexOf('=');
                    const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
                    if (name) document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
                  });
                } catch (e) {}
                // Reset UI state and history
                setResetOverlay(null)
                try { window.history.replaceState({}, document.title, window.location.pathname) } catch (e) {}
              } catch (e) {
                setResetOverlay(null)
              }
            })()
          }}
        />
      )}

      {/* Views */}
      {activeView === 'onboarding' && (
        <OnboardingView onComplete={handleOnboardingComplete} />
      )}
      {activeView === 'home' && (
        <HomeView
          onNavigate={handleNavigate}
          onCraving={() => setShowCraving(true)}
          onSlip={() => setShowSlip(true)}
          onMilestoneUnlock={handleMilestoneUnlock}
        />
      )}
      {activeView === 'calendar' && (
        <CalendarView onNavigate={handleNavigate} />
      )}
      {activeView === 'tribe' && (
        <TribeView onNavigate={handleNavigate} />
      )}
      {activeView === 'kit' && (
        <KitView onNavigate={handleNavigate} />
      )}
      {activeView === 'profile' && (
        <ProfileView
          onNavigate={handleBackFromProfile}
          onLogout={handleLogout}
          onSlip={() => setShowSlip(true)}
        />
      )}
      {activeView === 'triggers' && (
        <TriggersView onNavigate={handleNavigate} onToast={toast} />
      )}

      {/* Bottom nav */}
      {showNav && (
        <BottomNav activeView={activeView} onNavigate={handleNavigate} />
      )}

      {/* Global modals */}
      <CravingModal
        isOpen={showCraving}
        onClose={() => setShowCraving(false)}
        onBeat={handleCravingBeat}
        onSlip={() => { setShowCraving(false); setShowSlip(true) }}
        onStartBreathing={() => { setShowCraving(false); setShowBreathing(true) }}
      />
      <BreathingModal
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
        onComplete={() => toast('Breathing complete. 🌿')}
      />
      <SlipModal
        isOpen={showSlip}
        onClose={() => setShowSlip(false)}
        onConfirm={handleSlipConfirm}
      />
      <BeatModal
        isOpen={showBeat}
        onClose={() => setShowBeat(false)}
      />
      <MilestoneModal
        isOpen={!!activeMilestone}
        onClose={() => setActiveMilestone(null)}
        milestone={activeMilestone}
        renderedTitle={activeMilestone ? interpolate(activeMilestone.title, state) : ''}
        renderedFact={activeMilestone ? interpolate(activeMilestone.fact, state) : ''}
      />

      {/* Confetti container */}
      <div id="confetti" />

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}
