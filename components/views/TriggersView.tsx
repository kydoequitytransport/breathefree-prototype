'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { RITUAL_DATA } from '@/constants'
import { CheckinModal } from '@/components/modals/CheckinModal'
import { BreathingModal } from '@/components/modals/BreathingModal'
import type { ViewId } from '@/types'

interface TriggersViewProps {
  onNavigate: (view: ViewId) => void
  onToast: (msg: string) => void
}

export function TriggersView({ onNavigate, onToast }: TriggersViewProps) {
  const { state, saveState, track, eventLog } = useApp()
  const [showCheckin, setShowCheckin] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [riskyEvent, setRiskyEvent] = useState('')
  const [riskyDate, setRiskyDate] = useState('')
  const [riskyPlan, setRiskyPlan] = useState('')
  const [showRiskyForm, setShowRiskyForm] = useState(false)
  const [showAddRitualForm, setShowAddRitualForm] = useState(false)
  const [ritualNameDraft, setRitualNameDraft] = useState('')
  const [ritualWhenDraft, setRitualWhenDraft] = useState('')

  if (!state) return null

  const saveRiskyDay = () => {
    if (!riskyEvent.trim()) { onToast('Enter the event name.'); return }
    const updated = {
      ...state,
      riskyDayPlans: [
        ...(state.riskyDayPlans || []),
        { event: riskyEvent.trim(), date: riskyDate, plan: riskyPlan.trim() },
      ],
    }
    saveState(updated)
    track('Risky Day Planned', { event: riskyEvent })
    setRiskyEvent('')
    setRiskyDate('')
    setRiskyPlan('')
    setShowRiskyForm(false)
    onToast('Plan locked in.')
  }

  const deleteRisky = (idx: number) => {
    const updated = {
      ...state,
      riskyDayPlans: (state.riskyDayPlans || []).filter((_, i) => i !== idx),
    }
    saveState(updated)
    onToast('Plan removed.')
  }

  const addRitual = () => {
    const name = ritualNameDraft.trim()
    const when = ritualWhenDraft.trim()
    if (!name) {
      onToast('Add a ritual name first.')
      return
    }

    const updated = {
      ...state,
      customRituals: [
        ...(state.customRituals || []),
        {
          name,
          when: when || 'Anytime',
          createdAt: new Date().toISOString(),
        },
      ],
    }
    saveState(updated)
    setRitualNameDraft('')
    setRitualWhenDraft('')
    setShowAddRitualForm(false)
    onToast('Ritual added.')
  }

  const removeRitual = (idx: number) => {
    const updated = {
      ...state,
      customRituals: (state.customRituals || []).filter((_, i) => i !== idx),
    }
    saveState(updated)
    onToast('Ritual removed.')
  }

  // Build trigger map data sorted highest to lowest, based on craving wins.
  const buildTriggerMap = () => {
    // Keep map aligned with current Craving/Slip options.
    const baselineKeys = ['stress', 'social', 'alcohol', 'meal', '10pm', 'caught']
    const triggerLabels: Record<string, string> = {
      stress: 'Stress',
      social: 'Social pressure',
      alcohol: 'Alcohol',
      meal: 'After meals',
      '10pm': '10PM',
      caught: 'Caught off guard',
    }

    const prettifyLabel = (key: string) =>
      key
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')

    const aliasMap: Record<string, string> = {
      stress: 'stress',
      social: 'social',
      'social pressure': 'social',
      alcohol: 'alcohol',
      meal: 'meal',
      'after meal': 'meal',
      'after meals': 'meal',
      '10pm': '10pm',
      '10 pm': '10pm',
      night: '10pm',
      evening: '10pm',
      'late evening': '10pm',
      caught: 'caught',
      'caught off guard': 'caught',
    }

    const normalizeTrigger = (raw: string) => {
      const t = raw.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!t) return ''
      if (t === 'other' || t === 'unknown') return ''
      return aliasMap[t] || t
    }

    const beatCounts: Record<string, number> = {}
    const legacyCounts: Record<string, number> = {}
    const log = Array.isArray(eventLog) ? eventLog : []

    for (const ev of log) {
      const evName = String(ev.event || '').toLowerCase().trim()
      const t = normalizeTrigger(String((ev as any).trigger || ev.properties?.trigger || ''))
      if (!t || t === 'other' || t === 'unknown') continue
      if (evName === 'craving beat') beatCounts[t] = (beatCounts[t] || 0) + 1
      if (evName === 'slip logged') legacyCounts[t] = (legacyCounts[t] || 0) + 1
    }

    const hasBeatData = Object.keys(beatCounts).length > 0
    const counts = hasBeatData ? beatCounts : legacyCounts
    const keys = Array.from(new Set([...baselineKeys, ...Object.keys(counts)]))
    const maxVal = Math.max(...Object.values(counts), 1)
    const rows = keys.map((key) => {
      const count = counts[key] || 0
      const pct = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0
      const label = triggerLabels[key] || prettifyLabel(key)
      return { key, label, count, pct }
    }).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })

    const topKey = Object.keys(counts).reduce((a, b) => ((counts[a] || 0) >= (counts[b] || 0) ? a : b), '')
    const hasData = Object.keys(counts).length > 0
    const topLabel = triggerLabels[topKey] || (topKey ? prettifyLabel(topKey) : '')
    return { rows, hasData, topKey, topLabel }
  }

  const { rows: triggerRows, hasData, topKey, topLabel } = buildTriggerMap()

  return (
    <div className="view active" id="triggers" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="section-row">
        <div className="section-label">Trigger map</div>
      </div>
      <div id="trigger-map">
        <div className="trigger-card">
          <h3>Trigger map</h3>
          {triggerRows.map((r) => (
            <div key={r.key} className="trigger-row">
              <div className="trigger-name">{r.label}</div>
              <div className={`trigger-bar-track trigger-bar--${r.count === Math.max(...triggerRows.map((x) => x.count)) ? 'top' : 'low'}`}>
                <div className="trigger-bar-fill" style={{ width: `${r.pct}%` }} />
              </div>
              <div className="trigger-count">{r.count}</div>
            </div>
          ))}
          <div className="trigger-synth">
            {hasData && topKey ? (
              <>Your #1 trigger is <b>{topLabel}</b>. Your ritual is tuned for it.</>
            ) : (
              <>Log a craving to see your top trigger.</>
            )}
          </div>
        </div>
      </div>

      <div className="section-row">
        <div className="section-label">Your rituals</div>
      </div>
      <div id="rituals-list">
        <div className="ritual-card">
          <div className="ritual-body">
            <div className="ritual-name">{RITUAL_DATA.necklace.name}</div>
            <div className="ritual-sub">Your main craving tool</div>
          </div>
        </div>
        {showAddRitualForm && (
          <div className="callout" style={{ marginBottom: 12 }}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label>Ritual name</label>
              <input
                type="text"
                placeholder="e.g. Cold water reset"
                value={ritualNameDraft}
                onChange={(e) => setRitualNameDraft(e.target.value)}
              />
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>When to use it</label>
              <input
                type="text"
                placeholder="e.g. During work stress"
                value={ritualWhenDraft}
                onChange={(e) => setRitualWhenDraft(e.target.value)}
              />
            </div>
            <button className="btn btn--dark" style={{ padding: '10px 14px', fontSize: 14 }} onClick={addRitual}>
              Save ritual
            </button>
          </div>
        )}

        {(state.customRituals || []).map((r, i) => (
          <div key={i} className="ritual-card">
            <div className="ritual-body">
              <div className="ritual-name">{r.name}</div>
              <div className="ritual-sub">{r.when || 'Anytime'}</div>
            </div>
            <button className="ritual-remove-btn" onClick={() => removeRitual(i)}>Remove</button>
          </div>
        ))}

        <button className="add-link" onClick={() => setShowAddRitualForm((v) => !v)}>
          {showAddRitualForm ? 'Cancel' : '+ Add a ritual'}
        </button>
      </div>

      {/* Breathing tool removed to match original index.html (breathing is handled via modal elsewhere) */}

      {/* Risky day plans */}
      <div className="section-row">
        <div className="section-label">Risky day plans</div>
        {/* <button className="link" onClick={() => setShowRiskyForm(true)}>+ Add plan</button> */}
      </div>

      {/* Risky day plan form hidden as requested */}

      <div id="risky-list">
        {(!state.riskyDayPlans || state.riskyDayPlans.length === 0) ? (
          <div className="callout callout-empty">No plans yet. Pre-planning beats improvising every time. Examples: holidays, vacations, work stress weeks, anniversaries.</div>
        ) : (
          state.riskyDayPlans.map((plan, i) => (
            <div key={i} className="risky-plan-card">
              <div>
                <div className="rpc-event">{plan.event || 'Unnamed event'}</div>
                {plan.date && (
                  <div className="rpc-date">
                    {new Date(plan.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
                <div className="rpc-plan">{plan.plan}</div>
              </div>
              <div className="rpc-actions">
                <button className="del" onClick={() => deleteRisky(i)}>Remove</button>
              </div>
            </div>
          ))
        )}
        {/* <button className="btn--white-outline" style={{ marginTop: 12, display: 'block', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setShowRiskyForm(true)}>+ Plan a risky day</button> */}
      </div>

      <CheckinModal
        isOpen={showCheckin}
        onClose={() => setShowCheckin(false)}
        onSave={() => onToast('Checked in. Your trigger map got sharper.')}
      />
      <BreathingModal
        isOpen={showBreathing}
        onClose={() => setShowBreathing(false)}
        onComplete={() => onToast('Breathing complete. 🌿')}
      />
    </div>
  )
}
