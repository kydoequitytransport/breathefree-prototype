'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { freeTerm, recomputeRunState, toYMD, parseStartMs } from '@/lib/stateUtils'

const SLIP_TRIGGERS = [
  { value: 'stress', label: 'Stress' },
  { value: 'social', label: 'Social pressure' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'meal', label: 'After meal' },
  { value: '10pm', label: '10PM' },
  { value: 'caught', label: 'Caught off guard' },
  { value: 'other', label: 'Other' },
]

interface SlipModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function SlipModal({ isOpen, onClose, onConfirm }: SlipModalProps) {
  const { state, saveState, track } = useApp()
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [otherText, setOtherText] = useState('')
  const [slipDate, setSlipDate] = useState(new Date().toISOString().split('T')[0])

  if (!state) return null

  const computed = recomputeRunState(state)
  const ft = freeTerm(state)
  const lifetimeDays = computed.totalCleanDays
  const money = Math.round(computed.totalCleanDays * (state.dailySpend || 0))

  const handleBounceBack = () => {
    let slipTrigger = selectedTrigger
    if (slipTrigger === 'other' && otherText) slipTrigger = otherText

    const todayStr = new Date().toISOString().split('T')[0]
    const chosen = slipDate || todayStr

    if (chosen > todayStr) { alert('Cannot log a slip in the future.'); return }
    if (state.quitDate && chosen < state.quitDate) { alert('Selected date is before your quit date.'); return }

    const prevSource = state.runStartDate || state.quitDate || new Date().toISOString()
    const prevStartMs = parseStartMs(prevSource) || Date.now()
    const prevStartDate = new Date(prevStartMs)
    const prevStartMidMs = Date.UTC(prevStartDate.getUTCFullYear(), prevStartDate.getUTCMonth(), prevStartDate.getUTCDate())
    const chosenMs = parseStartMs(chosen) || Date.now()
    const chosenDate = new Date(chosenMs)
    const chosenMidMs = Date.UTC(chosenDate.getUTCFullYear(), chosenDate.getUTCMonth(), chosenDate.getUTCDate())
    let runAtSlipDays = Math.floor((chosenMidMs - prevStartMidMs) / 86400000)
    if (isNaN(runAtSlipDays) || runAtSlipDays < 0) runAtSlipDays = 0

    const newRunStartMs = chosenMidMs + 86400000
    const newRunStart = new Date(newRunStartMs)

    const slipsLog = [...(state.slipsLog || [])]
    if (!slipsLog.includes(chosen)) slipsLog.push(chosen)

    const updated = recomputeRunState({
      ...state,
      bestRun: Math.max(state.bestRun || 0, runAtSlipDays),
      lifetimeCleanDays: (state.lifetimeCleanDays || 0) + runAtSlipDays,
      slipsLog,
      slipCount: slipsLog.length,
      runStartDate: toYMD(newRunStart),
    })

    track('Slip Logged', { trigger: slipTrigger, run_length_at_slip: runAtSlipDays, slip_date: chosen })
    saveState(updated)
    onClose()
    onConfirm()
    setSelectedTrigger('')
    setOtherText('')
    setSlipDate(new Date().toISOString().split('T')[0])
  }

  return (
    <Modal id="slip-modal" isOpen={isOpen} onClose={onClose}>
      <div style={{ background: 'linear-gradient(135deg, #F2D9D5, #F8EBE8)', padding: 20, borderRadius: 'var(--radius-card)', marginBottom: 16 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>🤝</div>
        <h2 style={{ color: '#7C3A33' }}>That&apos;s data, not defeat.</h2>
        <p style={{ marginTop: 8, color: '#7C3A33' }}>One slip doesn&apos;t erase who you&apos;re becoming. Relapse is part of how the brain unlearns.</p>
      </div>

      <div style={{ background: 'white', borderRadius: 'var(--radius-card)', padding: 16, marginBottom: 14 }}>
        <h3>What happened?</h3>
        <p style={{ fontSize: 13, color: 'var(--mid-brown)', marginTop: 4 }}>Knowing the trigger turns the slip into a better plan.</p>
        <div style={{ marginTop: 12 }}>
          <label style={{ display: 'block', fontSize: 13, color: 'var(--mid-brown)', marginBottom: 6 }}>When did this happen?</label>
          <input
            id="slip-date"
            type="date"
            value={slipDate}
            min={state.quitDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSlipDate(e.target.value)}
            style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #eee', background: '#fafafa' }}
          />
        </div>
        <div className="chips" style={{ marginTop: 14 }}>
          {SLIP_TRIGGERS.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`chip${selectedTrigger === t.value ? ' selected' : ''}`}
              onClick={() => setSelectedTrigger(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {selectedTrigger === 'other' && (
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              placeholder="Describe what happened..."
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              style={{ width: '100%', padding: '13px 16px', borderRadius: 999, border: '1.5px solid #ccc', fontSize: 15 }}
            />
          </div>
        )}
      </div>

      <div className="callout" style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: 'var(--brown-text)', lineHeight: 1.7 }}>
          ✓ Your lifetime clean days (<strong id="slip-lifetime">{lifetimeDays}</strong>)<br />
          ✓ Your money saved ($<strong id="slip-money">{money}</strong>)<br />
          ✓ Your identity — you&apos;re still becoming <span id="slip-free-term">{ft}</span><br />
          ✓ Your rituals, your why
        </p>
        <p style={{ fontSize: 13, color: 'var(--mid-brown)', marginTop: 10 }}>Only your current run restarts at 0. Everything else you earned is yours.</p>
      </div>

      <div className="modal-actions">
        <button className="btn btn--dark" onClick={handleBounceBack}>
          Lock in my plan for next time →
        </button>
      </div>
    </Modal>
  )
}
