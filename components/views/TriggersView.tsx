'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { RITUAL_DATA } from '@/constants'
import { CheckinModal } from '@/components/modals/CheckinModal'
import { BreathingModal } from '@/components/modals/BreathingModal'
import { todayKey } from '@/lib/stateUtils'
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

  if (!state) return null

  const hasCheckedInToday = (state.checkinsLogged || []).some((c) => c.date === todayKey())

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

  // Build trigger map data similar to original index.html
  const buildTriggerMap = () => {
    const triggerLabels: Record<string, string> = {
      meal: 'After meals',
      '10pm': '10PM',
      night: '10PM',
      stress: 'Stress',
      break: 'Work break',
      social: 'Social',
      bored: 'Bored',
      morning: 'Morning',
      anxious: 'Anxious',
      caught: 'Caught off guard',
      alcohol: 'Alcohol',
      'social pressure': 'Social pressure',
    }
    const preferredOrder = ['meal', '10pm', 'stress', 'break', 'social', 'bored', 'morning', 'anxious', 'caught', 'alcohol', 'social pressure']
    const counts: Record<string, number> = {}
    const log = Array.isArray(eventLog) ? eventLog : []
    for (const ev of log) {
      const t = ((ev as any).trigger || ev.properties?.trigger || '').toLowerCase().trim()
      if ((ev.event === 'Slip Logged' || ev.event === 'Craving Beat') && t && t !== 'other') {
        counts[t] = (counts[t] || 0) + 1
      }
    }
    const allKeys = Array.from(new Set([...preferredOrder, ...Object.keys(counts).filter(k => !preferredOrder.includes(k))]))
    const maxVal = Math.max(...Object.values(counts), 1)
    const hasSlip = Object.values(counts).some(v => v > 0)
    const rows = allKeys.map((key) => {
      const count = counts[key] || 0
      const pct = hasSlip && maxVal > 0 ? Math.round((count / maxVal) * 100) : 0
      const label = triggerLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1))
      return { key, label, count, pct }
    }).filter(r => r.count > 0 || preferredOrder.includes(r.key))
    const topKey = Object.keys(counts).reduce((a, b) => (counts[a] || 0) >= (counts[b] || 0) ? a : b, '')
    return { rows, hasSlip, topKey }
  }

  const { rows: triggerRows, hasSlip, topKey } = buildTriggerMap()

  return (
    <div className="view active" id="triggers" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="page-header">
        <h1 className="page-title">Your triggers &amp; rituals</h1>
        <p className="page-intro">Every craving you log here builds a map of your real triggers — not guesses.</p>
      </div>

      <div className="section-row">
        <div className="section-label">Trigger map</div>
      </div>
      <div id="trigger-map">
        <div className="trigger-card">
          <h3>Trigger map</h3>
          {triggerRows.map((r) => (
            <div key={r.key} className="trigger-row">
              <div className="trigger-name">{r.label}</div>
              <div className={`trigger-bar-track trigger-bar--${r.count === Math.max(...triggerRows.map(x => x.count)) ? 'top' : 'low'}`}>
                <div className="trigger-bar-fill" style={{ width: `${r.pct}%` }} />
              </div>
              <div className="trigger-count">{r.count}</div>
            </div>
          ))}
          <div className="trigger-synth">
            {hasSlip && topKey ? (
              <>Your #1 trigger is <b>{topKey}</b>. Your ritual is tuned for it.</>
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
        <div className="ritual-card ritual-card--default">
          <div className="ritual-icon-box">{RITUAL_DATA[state.ritual || 'necklace'].icon}</div>
          <div className="ritual-body">
            <div className="ritual-name">{RITUAL_DATA[state.ritual || 'necklace'].name}</div>
            <div className="ritual-sub">Primary · your main craving tool</div>
          </div>
          <div className="pill-default">Default</div>
        </div>
        <div className="ritual-card">
          <div className="ritual-icon-box">🍃</div>
          <div className="ritual-body">
            <div className="ritual-name">Flavor refills</div>
            <div className="ritual-sub">Backup · after meals</div>
          </div>
        </div>
        <div className="ritual-card">
          <div className="ritual-icon-box">💨</div>
          <div className="ritual-body">
            <div className="ritual-name">5 slow breaths</div>
            <div className="ritual-sub">Anywhere, anytime</div>
          </div>
        </div>
        <button className="add-link" onClick={() => onToast('Add ritual coming soon')}>+ Add a ritual</button>
        
        <div className="section-row" style={{ marginTop: 18 }}>
          <div className="section-label">IF / THEN PLAN</div>
        </div>
        <div className="callout" style={{ marginTop: 8, marginBottom: 12 }}>
          <p>If I try to work on this then this should be working</p>
          <a className="callout-link" href="#" onClick={(e) => { e.preventDefault(); onToast('Edit plan coming soon') }}>Edit my plan →</a>
        </div>
        {(state.customRituals || []).map((r, i) => (
          <div key={i} className="ritual-card">
            <div className="ritual-icon-box">✨</div>
            <div className="ritual-body"><div className="ritual-name">{r.name}</div><div className="ritual-sub">{r.when || 'Anytime'}</div></div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid-brown)', fontSize: 20, padding: '0 6px' }} onClick={() => {
              const updated = { ...state, customRituals: (state.customRituals || []).filter((_, idx) => idx !== i) }
              saveState(updated)
              onToast('Ritual removed.')
            }}>×</button>
          </div>
        ))}
      </div>

      {/* Breathing tool removed to match original index.html (breathing is handled via modal elsewhere) */}

      {/* Risky day plans */}
      <div className="section-row">
        <div className="section-label">Risky day plans</div>
        <button className="link" onClick={() => setShowRiskyForm(true)}>+ Add plan</button>
      </div>

      {showRiskyForm && (
        <div style={{ background: 'white', borderRadius: 'var(--radius-card)', padding: 16, marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Plan a risky day</h3>
          <p style={{ fontSize: 13, color: 'var(--mid-brown)', marginBottom: 12 }}>Weddings, flights, nights out — pre-plan, don&apos;t improvise.</p>
          <div className="field">
            <label>What&apos;s the event?</label>
            <input type="text" placeholder="e.g. Sarah's wedding, flight to LA" value={riskyEvent} onChange={(e) => setRiskyEvent(e.target.value)} />
          </div>
          <div className="field">
            <label>When?</label>
            <input type="date" value={riskyDate} onChange={(e) => setRiskyDate(e.target.value)} />
          </div>
          <div className="field">
            <label>What&apos;s your plan?</label>
            <textarea
              rows={3}
              placeholder="e.g. Keep necklace in pocket. Step outside every 30 min. Text Jordan if it gets hard."
              value={riskyPlan}
              onChange={(e) => setRiskyPlan(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1.5px solid var(--soft-cream)', fontFamily: 'inherit', fontSize: 14, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn--dark" onClick={saveRiskyDay}>Lock in my plan</button>
            <button className="btn--ghost" onClick={() => setShowRiskyForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div id="risky-list">
        {(!state.riskyDayPlans || state.riskyDayPlans.length === 0) ? (
          <div className="callout callout-empty">No plans yet. Pre-planning beats improvising every time.</div>
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
        <button className="btn--white-outline" style={{ marginTop: 12, display: 'block', width: '100%', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setShowRiskyForm(true)}>+ Plan a risky day</button>
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
