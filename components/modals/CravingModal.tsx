'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { RITUAL_DATA } from '@/constants'
import { freeTerm } from '@/lib/stateUtils'

const CRAVING_TRIGGERS = [
  { value: 'stress', label: 'Stress' },
  { value: 'social', label: 'Social pressure' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'meal', label: 'After meal' },
  { value: '10pm', label: '10PM' },
  { value: 'caught', label: 'Caught off guard' },
  { value: 'other', label: 'Other' },
]

interface CravingModalProps {
  isOpen: boolean
  onClose: () => void
  onBeat: () => void
  onSlip: () => void
  onStartBreathing?: () => void
}

export function CravingModal({ isOpen, onClose, onBeat, onSlip, onStartBreathing }: CravingModalProps) {
  const { state, saveState, track } = useApp()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedTrigger, setSelectedTrigger] = useState('')
  const [otherText, setOtherText] = useState('')

  const ritual = RITUAL_DATA[state?.ritual ?? 'necklace'] ?? RITUAL_DATA.necklace

  const allTriggers = [
    ...CRAVING_TRIGGERS,
    ...(state?.customTriggers ?? []).map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) })),
  ]

  const handleTriggerSelect = (value: string) => {
    setSelectedTrigger(value)
    if (value !== 'other') {
      setTimeout(() => setStep(2), 200)
    }
  }

  const handleOtherSubmit = () => {
    if (!otherText.trim()) return
    const key = otherText.toLowerCase()
    if (state && !state.customTriggers?.includes(key)) {
      saveState({ ...state, customTriggers: [...(state.customTriggers ?? []), key] })
    }
    setSelectedTrigger(key)
    setStep(2)
  }

  const handleBeat = () => {
    if (!state) return
    const trigger = selectedTrigger === 'other' ? otherText.toLowerCase() : selectedTrigger
    const updated = { ...state, cravingsBeat: (state.cravingsBeat || 0) + 1 }
    saveState(updated)
    track('Craving Beat', { trigger })
    onClose()
    onBeat()
    setStep(1)
    setSelectedTrigger('')
    setOtherText('')
  }

  const handleClose = () => {
    onClose()
    setStep(1)
    setSelectedTrigger('')
    setOtherText('')
  }

  return (
    <Modal id="craving-modal" isOpen={isOpen} onClose={handleClose}>
      {step === 1 ? (
        <>
          <h2>What triggered this?</h2>
          <p>Knowing it turns the craving into data.</p>
          <div className="chips" id="craving-triggers" style={{ marginTop: 16 }}>
            {allTriggers.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`chip${selectedTrigger === t.value ? ' selected' : ''}`}
                onClick={() => handleTriggerSelect(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {selectedTrigger === 'other' && (
            <div id="craving-other-wrap" style={{ marginTop: 12 }}>
              <input
                type="text"
                id="craving-other-input"
                placeholder="Describe your trigger..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                style={{ width: '100%', padding: '13px 16px', borderRadius: 999, border: '1.5px solid #ccc', fontSize: 15 }}
              />
              <button className="btn btn--dark" style={{ marginTop: 12 }} onClick={handleOtherSubmit}>
                Continue →
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div id="craving-step-2">
            <h2>Your move.</h2>
            <p>You have everything you need.</p>
            <div className="product-card" style={{ marginTop: 16 }}>
              <div className="product-icon" id="craving-ritual-icon">{ritual.icon}</div>
              <div className="product-body">
                <div className="product-name" id="craving-ritual-name">{ritual.name}</div>
                <div className="product-sub" id="craving-ritual-script">{ritual.script}</div>
              </div>
            </div>
            <div className="modal-actions">
              <button
                className="btn btn--dark"
                onClick={() => {
                  onClose()
                  if (onStartBreathing) onStartBreathing()
                }}
              >
                Start guided breathing →
              </button>

              <button
                className="btn--white-outline"
                style={{ cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={handleBeat}
              >
                I rode it out 💪
              </button>

              <button className="btn--ghost" style={{ color: 'var(--coral)' }} onClick={() => { handleClose(); onSlip() }}>
                I slipped
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
