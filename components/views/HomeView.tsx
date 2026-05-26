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
  hoursSinceRunStart,
  parseStartMs,
  interpolate,
} from '@/lib/stateUtils'
import { WHY_IDENTITY, RITUAL_DATA, TRIGGER_LABELS, MILESTONES, DAY_MILESTONES, DAY_MILESTONE_MAP } from '@/constants'
import type { ViewId } from '@/types'

interface HomeViewProps {
  onNavigate: (view: ViewId) => void
  onCraving: () => void
  onSlip: () => void
  onMilestoneUnlock: (milestoneKey: string) => void
}

export function HomeView({ onNavigate, onCraving, onSlip, onMilestoneUnlock }: HomeViewProps) {
  const { state, saveState } = useApp()

  const checkForNewMilestones = useCallback(() => {
    if (!state) return
    const hours = hoursSinceRunStart(state)
    const days = hours / 24
    const runStartMs = parseStartMs(state.runStartDate || state.quitDate || state.startedAt || '')
    const updatedAtMs = state.updatedAt ? new Date(state.updatedAt).getTime() : NaN
    const previousHours = runStartMs && !Number.isNaN(updatedAtMs)
      ? Math.max(0, (updatedAtMs - runStartMs) / (1000 * 60 * 60))
      : hours
    const previousDays = previousHours / 24
    const computed = recomputeRunState(state)
    const cumDays = computed.currentRun || 0
    const unlocked = [...(state.unlockedMilestones || [])]
    let changed = false
    let celebrateKey: string | null = null
    let fallbackCelebrateKey: string | null = null

    // First: unlock day-based milestones (map to MILESTONES keys)
    for (const dm of DAY_MILESTONES) {
      if (cumDays < dm.day) break
      const mapped = DAY_MILESTONE_MAP[dm.key]
      if (!mapped) continue
      if (unlocked.includes(mapped)) continue
      unlocked.push(mapped)
      changed = true
      const m = MILESTONES.find((x) => x.key === mapped)
      if (!m?.celebrate) continue
      if (m.day > previousDays && m.day <= days) celebrateKey = m.key
      else fallbackCelebrateKey = m.key
    }

    // Then: existing hours-based milestones (keep previous behavior for non-day items)
    for (const m of MILESTONES) {
      if (days < m.day) break
      if (unlocked.includes(m.key)) continue
      unlocked.push(m.key)
      changed = true
      if (!m.celebrate) continue
      if (m.day > previousDays && m.day <= days) celebrateKey = m.key
      else fallbackCelebrateKey = m.key
    }

    if (changed) {
      const modalKey = celebrateKey || fallbackCelebrateKey
      saveState({ ...state, unlockedMilestones: unlocked })
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
  const triggerLabel = TRIGGER_LABELS[state.trigger] || ''
  const identityLine = WHY_IDENTITY[state.why] || state.why || `You're becoming ${ft}.`

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
          <div className="hero-day-badge" id="hero-day-badge">DAY {computed.currentRun}</div>
        </div>
        <div className="hero-mid">
          <LeafIcon className="leaf-svg" style={{ width: 44, height: 44, flexShrink: 0, color: 'var(--leaf-bright)' }} />
          <div>
            <div className="hero-num" id="total-clean-days">{computed.totalCleanDays}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="hero-num-label">Days since quit date</div>
              <button className="hint-btn" title={"Every day since your quit date counts. Slips included. Showing up and continuing to try is what counts here."} style={{ background: 'none', border: 'none', cursor: 'help', color: 'var(--mid-brown)', fontWeight: 700 }}>?</button>
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

      {/* IF / THEN plan */}
      <div className="section-row">
        <div className="section-label">IF / THEN plan</div>
        <button className="link" onClick={() => onNavigate('triggers')}>Edit →</button>
      </div>
      <div className="callout" style={{ marginBottom: 8 }}>
        {state.riskyDayPlans && state.riskyDayPlans.length > 0 ? (
          <>
            <p>
              <strong>If</strong> {state.riskyDayPlans[0].event || 'I hit a risky moment'}, <strong>then</strong> {state.riskyDayPlans[0].plan || `I use ${ritual.name.toLowerCase()}.`}
            </p>
            <p style={{ marginTop: 8, fontSize: 12, color: 'var(--mid-brown)' }}>
              Trigger focus: {triggerLabel || 'Any craving moment'}
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
