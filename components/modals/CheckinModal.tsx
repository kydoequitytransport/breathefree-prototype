'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { todayKey } from '@/lib/stateUtils'
import { useConfetti } from '@/hooks/useConfetti'

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: () => void
}

const MOODS = ['😤', '😐', '🙂', '💪', '🔥']
const DAY_TYPES = [
  { value: 'stressful', label: 'Stressful' },
  { value: 'boring', label: 'Boring' },
  { value: 'normal', label: 'Normal' },
  { value: 'social', label: 'Social' },
  { value: 'low', label: 'Low energy' },
]
const SYMPTOMS = [
  { value: 'headache', label: 'Headache' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'irritable', label: 'Irritable' },
  { value: 'insomnia', label: "Can't sleep" },
  { value: 'focus', label: 'Foggy focus' },
  { value: 'appetite', label: 'Hungry' },
  { value: 'none', label: 'None today' },
]

export function CheckinModal({ isOpen, onClose, onSave }: CheckinModalProps) {
  const { state, saveState, track } = useApp()
  const { fireConfetti } = useConfetti()
  const [mood, setMood] = useState('')
  const [dayType, setDayType] = useState('')
  const [symptoms, setSymptoms] = useState<string[]>([])

  const toggleSymptom = (value: string) => {
    setSymptoms((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  const handleSave = () => {
    if (!mood) { alert("Tap how you're feeling first."); return }
    if (!dayType) { alert('Tap what kind of day it is.'); return }
    if (!state) return

    const updated = {
      ...state,
      checkinsLogged: [
        ...(state.checkinsLogged || []),
        { date: todayKey(), mood, day: dayType, symptoms },
      ],
    }
    saveState(updated)
    track('Daily Check-in', { mood, day_type: dayType, symptoms })
    onClose()
    fireConfetti()
    onSave()
    setMood('')
    setDayType('')
    setSymptoms([])
  }

  return (
    <Modal id="checkin-modal" isOpen={isOpen} onClose={onClose}>
      <h2>How&apos;s today?</h2>
      <p>Tap one of each. Truth here makes your plan sharper.</p>

      <div className="modal-section-title">How you feel</div>
      <div className="chips" id="checkin-mood" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {MOODS.map((m) => (
          <button
            key={m}
            type="button"
            className={`chip${mood === m ? ' selected' : ''}`}
            style={{ padding: '16px 6px', fontSize: 22, justifyContent: 'center' }}
            onClick={() => setMood(m)}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="modal-section-title">What kind of day is it?</div>
      <div className="chips" id="checkin-daytype">
        {DAY_TYPES.map((d) => (
          <button
            key={d.value}
            type="button"
            className={`chip${dayType === d.value ? ' selected' : ''}`}
            onClick={() => setDayType(d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="modal-section-title">Any withdrawal symptoms?</div>
      <div className="chips" id="checkin-symptoms">
        {SYMPTOMS.map((s) => (
          <button
            key={s.value}
            type="button"
            className={`chip${symptoms.includes(s.value) ? ' selected' : ''}`}
            onClick={() => toggleSymptom(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="modal-actions">
        <button className="btn btn--dark" onClick={handleSave}>Save check-in</button>
        <button className="btn--ghost" onClick={onClose}>Skip today</button>
      </div>
    </Modal>
  )
}
