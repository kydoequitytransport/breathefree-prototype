'use client'

import { useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { LeafIcon } from '@/components/ui/LeafIcon'
import { useApp } from '@/hooks/useApp'
import {
  recomputeRunState,
  freeTerm,
  getStageLabel,
  sameDay,
  interpolate,
} from '@/lib/stateUtils'
import { WHY_IDENTITY, RITUAL_DATA, MILESTONES } from '@/constants'
import type { ViewId } from '@/types'
import { subscribeForPush } from '@/lib/notifications'

interface HomeViewProps {
  onNavigate: (view: ViewId) => void
  onCraving: () => void
  onSlip: () => void
  onMilestoneUnlock: (milestoneKey: string) => void
}

export function HomeView({ onNavigate, onCraving, onSlip, onMilestoneUnlock }: HomeViewProps) {
  const { state, saveState, track } = useApp()
  const MIN_MILESTONE_MODAL_DAY = 7

  const checkForNewMilestones = useCallback(() => {
    if (!state) return
    const computed = recomputeRunState(state)
    const currentRun = computed.currentRun || 0
    const previousRun = Math.max(0, state.currentRun || 0)
    const unlocked = new Set(state.unlockedMilestones || [])
    const newlyUnlockedCelebrations: string[] = []
    let changed = false

    // Unlock milestone keys based on consecutive clean days (current run).
    for (const m of MILESTONES) {
      if (currentRun < m.day) break
      if (unlocked.has(m.key)) continue
      unlocked.add(m.key)
      changed = true
      if (m.celebrate && m.day >= MIN_MILESTONE_MODAL_DAY) newlyUnlockedCelebrations.push(m.key)
    }

    if (changed) {
      const crossedNow = newlyUnlockedCelebrations.filter((key) => {
        const milestone = MILESTONES.find((m) => m.key === key)
        return !!milestone && milestone.day > previousRun
      })
      const modalKey = crossedNow[crossedNow.length - 1] || newlyUnlockedCelebrations[newlyUnlockedCelebrations.length - 1] || null

      saveState({ ...state, ...computed, unlockedMilestones: Array.from(unlocked) })
      if (modalKey) {
        setTimeout(() => onMilestoneUnlock(modalKey), 600)
      }
    }
  }, [state, saveState, onMilestoneUnlock])

  useEffect(() => {
    checkForNewMilestones()
  }, [checkForNewMilestones])

  if (!state) return null

  const computed = recomputeRunState(state)
  const ft = freeTerm(state)
  const stage = getStageLabel(computed.totalCleanDays)
  const money = Math.round(computed.totalCleanDays * (state.dailySpend || 0))
  const ritual = RITUAL_DATA[state.ritual] ?? RITUAL_DATA.necklace
  const identityLine = WHY_IDENTITY[state.why] || state.why || `You're becoming ${ft}.`
  const sortedRiskyPlans = (state.riskyDayPlans || [])
    .slice()
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : Number.POSITIVE_INFINITY
      const bTime = b.date ? new Date(b.date).getTime() : Number.POSITIVE_INFINITY
      const safeATime = Number.isNaN(aTime) ? Number.POSITIVE_INFINITY : aTime
      const safeBTime = Number.isNaN(bTime) ? Number.POSITIVE_INFINITY : bTime
      return safeATime - safeBTime
    })
  const primaryRiskyPlan = sortedRiskyPlans[0]
  const settings = state.notificationSettings
  const shouldShowReminderPrompt =
    (!settings || !settings.enabled) &&
    settings?.permission !== 'denied' &&
    !settings?.promptDismissed

  const handleEnableReminders = async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return

    const nextPermission = await Notification.requestPermission()
    if (nextPermission !== 'granted') {
      saveState({
        ...state,
        notificationSettings: {
          enabled: false,
          permission: nextPermission,
          reminderTime: settings?.reminderTime || '20:00',
          quietHoursStart: settings?.quietHoursStart || '22:00',
          quietHoursEnd: settings?.quietHoursEnd || '07:00',
          promptDismissed: nextPermission === 'denied',
          pushSubscription: settings?.pushSubscription || null,
        },
      })
      track('Notifications Permission Result', { permission: nextPermission })
      return
    }

    try {
      const pushSubscription = await subscribeForPush()
      saveState({
        ...state,
        notificationSettings: {
          enabled: true,
          permission: 'granted',
          reminderTime: settings?.reminderTime || '20:00',
          quietHoursStart: settings?.quietHoursStart || '22:00',
          quietHoursEnd: settings?.quietHoursEnd || '07:00',
          promptDismissed: true,
          pushSubscription,
        },
      })
      track('Notifications Enabled', { source: 'home_prompt' })
    } catch (error) {
      saveState({
        ...state,
        notificationSettings: {
          enabled: false,
          permission: 'granted',
          reminderTime: settings?.reminderTime || '20:00',
          quietHoursStart: settings?.quietHoursStart || '22:00',
          quietHoursEnd: settings?.quietHoursEnd || '07:00',
          promptDismissed: false,
          pushSubscription: null,
        },
      })
      track('Notifications Enable Failed', {
        source: 'home_prompt',
        message: error instanceof Error ? error.message : 'unknown',
      })
    }
  }

  const handleDismissReminderPrompt = () => {
    saveState({
      ...state,
      notificationSettings: {
        enabled: settings?.enabled || false,
        permission: settings?.permission || 'default',
        reminderTime: settings?.reminderTime || '20:00',
        quietHoursStart: settings?.quietHoursStart || '22:00',
        quietHoursEnd: settings?.quietHoursEnd || '07:00',
        promptDismissed: true,
        pushSubscription: settings?.pushSubscription || null,
      },
    })
    track('Notifications Prompt Dismissed', { source: 'home_prompt' })
  }

  // Week strip
  const today = new Date()
  const dow = today.getDay()
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  const baselineQuitDate = new Date(state.quitDate || state.runStartDate)
  const slips = (state.slipsLog || []).map((s) => new Date(s))

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const isToday = sameDay(d, today)
    const isFuture = d > today
    const isSlip = slips.some((s) => sameDay(s, d))
    const isClean = !isFuture && !isSlip && d >= baselineQuitDate
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
    return { d, isToday, isFuture, isSlip, isClean, dayName }
  })

  return (
    <div className="view active" id="home" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <p className="identity-line" id="identity-line">{identityLine}</p>

      {/* Dark hero card */}
      <div className="hero-dark">
        <div className="hero-row">
          <div className="hero-stage" id="hero-identity">{state.name}{stage ? ` · ${stage}` : ''}</div>
        </div>
        <div className="hero-mid">
          <LeafIcon className="leaf-svg" style={{ width: 44, height: 44, flexShrink: 0, color: 'var(--leaf-bright)' }} />
          <div>
            <div className="hero-num" id="total-clean-days">{computed.totalCleanDays}</div>
            <div className="hero-num-label-row">
              <div className="hero-num-label">Days since quit date</div>
              <span className="hint-wrap">
                <button
                  className="hint-btn"
                  type="button"
                  aria-label="About total clean days"
                >
                  ?
                </button>
                <span className="hint-popover" role="tooltip">
                  Every day since your quit date counts. Slips included. Showing up and continuing to try is what counts here.
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="hero-divider" />
        <div className="hero-money-row">
          <div className="hero-money-label">Money saved</div>
          <div className="hero-money-value" id="money-saved-display">${money}</div>
        </div>
      </div>

      {/* Week strip */}
      <div className="section-row">
        <div className="section-label">This week</div>
        <button className="link" onClick={() => onNavigate('calendar')}>View calendar →</button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--mid-brown)', marginTop: -4, marginBottom: 8 }}>
        Timezone: {state.timezone || 'UTC'}
      </div>
      <div className="weekstrip" id="weekstrip">
        {weekDays.map(({ d, isToday, isFuture, isSlip, isClean, dayName }) => {
          let cls = 'weekcell'
          if (isToday) cls += ' weekcell--today'
          if (isFuture) cls += ' weekcell--future'
          if (isSlip) cls += ' weekcell--slip'
          return (
            <div key={d.toISOString()} className={cls}>
              <span className="dow">{dayName.slice(0, 1)}</span>
              {isSlip ? (
                <>
                  <span className="date">{d.getDate()}</span>
                  <span className="slip-label">slip</span>
                </>
              ) : (
                <>
                  {isClean && <LeafIcon className="leaf-svg" />}
                  <span className="date">{d.getDate()}</span>
                </>
              )}
            </div>
          )
        })}
      </div>

      {shouldShowReminderPrompt && (
        <div className="notif-card" style={{ marginTop: 18 }}>
          <div className="section-label">Stay on track</div>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--brown-text)', lineHeight: 1.5 }}>
            Turn on reminders for daily check-ins, streak protection, and milestone nudges.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btn--dark" style={{ padding: '10px 12px', fontSize: 14 }} onClick={handleEnableReminders}>
              Enable reminders
            </button>
            <button className="btn--ghost" style={{ width: 'auto', padding: '10px 4px', fontSize: 14 }} onClick={handleDismissReminderPrompt}>
              Not now
            </button>
          </div>
        </div>
      )}

      {/* IF / THEN plan */}
      <div className="section-row">
        <div className="section-label">If / Then Plan</div>
        <button className="link" onClick={() => onNavigate('triggers')}>Edit →</button>
      </div>
      <div className="callout" style={{ marginBottom: 8 }}>
        {primaryRiskyPlan ? (
          <>
            <p>
              <strong>If</strong> {primaryRiskyPlan.event || 'I hit a risky moment'}, <strong>then</strong> {primaryRiskyPlan.plan || `I use ${ritual.name.toLowerCase()}.`}
            </p>
          </>
        ) : (
          <>
            <p><strong>If</strong> I feel a craving, <strong>then</strong> I do 5 slow breaths and ride the wave for 90 seconds.</p>
            <a className="callout-link" href="#" onClick={(e) => { e.preventDefault(); onNavigate('triggers') }}>
              Create my plan →
            </a>
          </>
        )}
      </div>

      {/* Craving + slip CTAs (moved up; Circle removed) */}
      <div style={{ marginTop: 24 }}>
        <button className="btn btn--coral" onClick={onCraving}>
          <svg className="bolt" viewBox="0 0 24 24" fill="white">
            <polygon points="13,2 4,14 12,14 11,22 20,10 12,10" />
          </svg>
          Craving now
        </button>
        <button className="slip-link" onClick={onSlip}>I slipped</button>
      </div>

    </div>
  )
}
