'use client'

import { useRef, useState } from 'react'
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

  // Build trigger map data sorted highest to lowest, based on craving wins.
  const buildTriggerMap = () => {
    const baselineKeys = ['meal', '10pm', 'stress', 'break', 'social', 'bored', 'morning', 'anxious', 'caught', 'alcohol', 'social pressure']
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
    const normalizeTrigger = (raw: string) => {
      const t = raw.toLowerCase().trim()
      if (!t) return ''
      if (t === 'night' || t === 'evening') return '10pm'
      if (t === 'after meal' || t === 'after meals') return 'meal'
      if (t === 'work break') return 'break'
      if (t === 'caught off guard') return 'caught'
      if (t === 'anxiety') return 'anxious'
      if (t === 'first coffee') return 'morning'
      return t
    }
    const beatCounts: Record<string, number> = {}
    const legacyCounts: Record<string, number> = {}
    const log = Array.isArray(eventLog) ? eventLog : []
    for (const ev of log) {
      const evName = String(ev.event || '').toLowerCase().trim()
      const t = normalizeTrigger(String((ev as any).trigger || ev.properties?.trigger || ''))
      if (!t || t === 'other' || t === 'unknown') continue
      if (evName === 'craving beat') {
        beatCounts[t] = (beatCounts[t] || 0) + 1
      }
      if (evName === 'slip logged') {
        legacyCounts[t] = (legacyCounts[t] || 0) + 1
      }
    }
    const hasBeatData = Object.keys(beatCounts).length > 0
    const counts = hasBeatData ? beatCounts : legacyCounts
    const keys = Array.from(new Set([...baselineKeys, ...Object.keys(counts)]))
    const maxVal = Math.max(...Object.values(counts), 1)
    const rows = keys.map((key) => {
      const count = counts[key] || 0
      const pct = maxVal > 0 ? Math.round((count / maxVal) * 100) : 0
      const label = triggerLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1))
      return { key, label, count, pct }
    }).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      return a.label.localeCompare(b.label)
    })
    const topKey = Object.keys(counts).reduce((a, b) => (counts[a] || 0) >= (counts[b] || 0) ? a : b, '')
    const hasData = Object.keys(counts).length > 0
    const topLabel = triggerLabels[topKey] || (topKey ? topKey.charAt(0).toUpperCase() + topKey.slice(1) : '')
    return { rows, hasData, topKey, topLabel }
  }

  const { rows: triggerRows, hasData, topKey, topLabel } = buildTriggerMap()
  const triggerRef = useRef<HTMLDivElement | null>(null)

  const exportNodeAsPNG = async (node: HTMLElement, filename = 'trigger-map.png') => {
    const loadHtml2CanvasFromCdn = () => new Promise<any>((resolve, reject) => {
      if (typeof window !== 'undefined' && (window as any).html2canvas) return resolve((window as any).html2canvas)
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
      s.onload = () => resolve((window as any).html2canvas)
      s.onerror = reject
      document.head.appendChild(s)
    })

    try {
      let html2canvas: any = null
      try {
        html2canvas = await loadHtml2CanvasFromCdn()
      } catch (err) {
        console.error('html2canvas load failed', err)
      }

      if (!html2canvas) {
        alert('Image export is currently unavailable.')
        return
      }

      const canvas = await html2canvas(node, { scale: window.devicePixelRatio || 1 })
      canvas.toBlob((b: Blob | null) => {
        if (!b) {
          alert('Unable to export image.')
          return
        }
        const a = document.createElement('a')
        a.href = URL.createObjectURL(b)
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
      }, 'image/png')
    } catch (err) {
      console.error('export failed', err)
      alert('Export failed. Try again in a moment.')
    }
  }

  return (
    <div className="view active" id="triggers" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="page-header">
        <h1 className="page-title">Your triggers &amp; rituals</h1>
        <p className="page-intro">Every craving you log here builds a map of your real triggers</p>
      </div>

      <div className="section-row">
        <div className="section-label">Trigger map</div>
      </div>
      <div id="trigger-map">
          <div className="trigger-card" ref={triggerRef}>
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
            {hasData && topKey ? (
              <>Your #1 trigger is <b>{topLabel}</b>. Your ritual is tuned for it.</>
            ) : (
              <>Log a craving to see your top trigger.</>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="btn btn--white-outline btn--small" onClick={() => {
              if (triggerRef.current) exportNodeAsPNG(triggerRef.current, 'trigger-map.png')
            }}>
              Download trigger map image
            </button>
          </div>
        </div>
      </div>

      <div className="section-row">
        <div className="section-label">Your rituals</div>
      </div>
      <div id="rituals-list">
        <div className="ritual-card">
          <div className="ritual-body">
            <div className="ritual-name">{RITUAL_DATA[state.ritual || 'necklace'].name}</div>
            <div className="ritual-sub">Your main craving tool</div>
          </div>
        </div>
        <div className="ritual-card">
          <div className="ritual-body">
            <div className="ritual-name">Flavor refills</div>
            <div className="ritual-sub">Backup · after meals</div>
          </div>
        </div>
        <div className="ritual-card">
          <div className="ritual-body">
            <div className="ritual-name">5 slow breaths</div>
            <div className="ritual-sub">Anywhere, anytime</div>
          </div>
        </div>
        <button className="add-link" onClick={() => onToast('Add ritual coming soon')}>+ Add a ritual</button>
        {(state.customRituals || []).map((r, i) => (
          <div key={i} className="ritual-card">
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
