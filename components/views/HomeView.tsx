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
    const computed = recomputeRunState(state)
    const cumDays = computed.currentRun || 0
    const unlocked = [...(state.unlockedMilestones || [])]
    let changed = false
    let celebrateKey: string | null = null

    // First: unlock day-based milestones (map to MILESTONES keys)
    for (const dm of DAY_MILESTONES) {
      if (cumDays < dm.day) break
      const mapped = DAY_MILESTONE_MAP[dm.key]
      if (!mapped) continue
      if (unlocked.includes(mapped)) continue
      unlocked.push(mapped)
      changed = true
      const m = MILESTONES.find((x) => x.key === mapped)
      if (m?.celebrate && !celebrateKey) celebrateKey = m.key
    }

    // Then: existing hours-based milestones (keep previous behavior for non-day items)
    for (const m of MILESTONES) {
      if (hours < m.hours) break
      if (unlocked.includes(m.key)) continue
      unlocked.push(m.key)
      changed = true
      if (m.celebrate && !celebrateKey) celebrateKey = m.key
    }

    if (changed) {
      saveState({ ...state, unlockedMilestones: unlocked })
      if (celebrateKey) {
        setTimeout(() => onMilestoneUnlock(celebrateKey!), 600)
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
  const identityLine = WHY_IDENTITY[state.why] || `You're becoming ${ft}.`

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

      {/* Today's ritual */}
      <div className="section-row">
        <div className="section-label">Today&apos;s ritual</div>
        <div className="section-label" id="ritual-trigger-label" style={{ color: 'var(--mid-brown)' }}>{triggerLabel}</div>
      </div>
      <div className="ritual-row" onClick={() => {}}>
        <div className="ritual-icon-box">
          <LeafIcon className="leaf-svg" />
        </div>
        <div className="ritual-body">
          <div className="ritual-name" id="ritual-name">{ritual.name}</div>
          <div className="ritual-sub" id="ritual-when">Your {triggerLabel || 'craving'} ritual</div>
        </div>
        <span className="chevron">›</span>
      </div>

      {/* Refills upsell */}
      {!state.hasRefills && state.ritual === 'necklace' && (
        <div id="refills-upsell" style={{ marginTop: 16 }}>
          <div style={{ background: 'linear-gradient(135deg, var(--pill-bg), #E8F2D8)', borderRadius: 'var(--radius-card)', padding: 20, border: '1px solid rgba(92,138,58,0.25)' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 32 }}>🍃</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--pill-text)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stack your success</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--brown-text)', marginTop: 4 }}>Add flavor refills</div>
                <p style={{ fontSize: 13, color: 'var(--mid-brown)', marginTop: 6 }}>Breath handles the chemistry. Flavor handles the ritual moments. Most long-term quitters stack both.</p>
              </div>
            </div>
            <a href="https://breathefree.shop/products/flavor-refills-copy" target="_blank" rel="noopener" className="btn btn--dark" style={{ marginTop: 14, textDecoration: 'none', display: 'flex', background: 'var(--leaf)' }}>
              See the refills →
            </a>
          </div>
        </div>
      )}

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

      {/* Craving + slip CTAs */}
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
