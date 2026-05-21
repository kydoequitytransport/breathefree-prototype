'use client'

import { useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { useConfetti } from '@/hooks/useConfetti'

interface BreathingModalProps {
  isOpen: boolean
  onClose: () => void
  urgent?: boolean
  onComplete?: () => void
}

type BreathPhase = 'ready' | 'inhale' | 'hold' | 'exhale'

export function BreathingModal({ isOpen, onClose, urgent = false, onComplete }: BreathingModalProps) {
  const { state, saveState, track } = useApp()
  const { fireConfetti } = useConfetti()
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<BreathPhase>('ready')
  const [subText, setSubText] = useState('Tap start when you\'re ready.')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const totalRounds = urgent ? 6 : 4

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const runRound = (r: number) => {
    if (r >= totalRounds) {
      setPhase('ready')
      setSubText('Done. Your nervous system just reset.')
      setRunning(false)
      if (state) {
        const updated = { ...state, cravingsBeat: (state.cravingsBeat || 0) + 1 }
        saveState(updated)
      }
      track('Breathing Completed', { rounds: totalRounds })
      onClose()
      if (onComplete) onComplete()
      fireConfetti()
      return
    }

    setRound(r + 1)
    setSubText(`Round ${r + 1} of ${totalRounds}`)

    setPhase('inhale')
    timerRef.current = setTimeout(() => {
      setPhase('hold')
      timerRef.current = setTimeout(() => {
        setPhase('exhale')
        timerRef.current = setTimeout(() => {
          runRound(r + 1)
        }, 8000)
      }, 7000)
    }, 4000)
  }

  const startBreathing = () => {
    if (running) return
    setRunning(true)
    setRound(0)
    runRound(0)
  }

  const endEarly = () => {
    clearTimers()
    setRunning(false)
    setPhase('ready')
    setRound(0)
    setSubText('Tap start when you\'re ready.')
    onClose()
  }

  const phaseLabel: Record<BreathPhase, string> = {
    ready: 'Ready',
    inhale: 'Breathe in',
    hold: 'Hold',
    exhale: 'Breathe out',
  }

  return (
    <Modal id="breath-modal" isOpen={isOpen} onClose={endEarly} style={{ textAlign: 'center' }}>
      <h2 id="breath-title">{urgent ? "Breathe. You're safe." : 'Breathe with me.'}</h2>
      <p id="breath-subtitle" style={{ marginTop: 6 }}>
        4 seconds in, 7 hold, 8 out. {totalRounds} rounds.
      </p>
      <div className="breath-stage">
        <div className={`breath-orb${phase !== 'ready' ? ` ${phase}` : ''}`} id="breath-orb" />
        <div className="breath-label" id="breath-label">{phaseLabel[phase]}</div>
      </div>
      <div className="breath-sub" id="breath-sub">{subText}</div>
      <div className="modal-actions">
        {!running && (
          <button className="btn btn--dark" id="breath-start-btn" onClick={startBreathing}>
            Start
          </button>
        )}
        <button className="btn--ghost" onClick={endEarly}>End early</button>
      </div>
    </Modal>
  )
}
