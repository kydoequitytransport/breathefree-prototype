'use client'

import { useEffect, useState, useRef } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { useConfetti } from '@/hooks/useConfetti'

interface BreathingModalProps {
  isOpen: boolean
  onClose: () => void
  urgent?: boolean
  onComplete?: () => void
  onRodeItOut?: () => void
}

type BreathPhase = 'ready' | 'inhale' | 'hold' | 'exhale'

const PLACEHOLDER_SOUNDTRACK = '/audio/meditation-instrumental-placeholder.mp3'

export function BreathingModal({ isOpen, onClose, urgent = false, onComplete, onRodeItOut }: BreathingModalProps) {
  const { state, saveState, track } = useApp()
  const { fireConfetti } = useConfetti()
  const [running, setRunning] = useState(false)
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<BreathPhase>('ready')
  const [completed, setCompleted] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)
  const [subText, setSubText] = useState('Tap start when you\'re ready.')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const creditedRef = useRef(false)
  const totalRounds = urgent ? 6 : 4

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const runRound = (r: number) => {
    if (r >= totalRounds) {
      setPhase('ready')
      setSubText('Done. Your nervous system just reset.')
      setRunning(false)
      setCompleted(true)
      if (audioRef.current) audioRef.current.pause()
      track('Breathing Completed', { rounds: totalRounds })
      if (onComplete) onComplete()
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
    setCompleted(false)
    creditedRef.current = false
    setRound(0)
    runRound(0)
  }

  const awardRodeItOut = () => {
    if (creditedRef.current) return
    creditedRef.current = true

    if (onRodeItOut) {
      onRodeItOut()
    } else if (state) {
      const updated = { ...state, cravingsBeat: (state.cravingsBeat || 0) + 1 }
      saveState(updated)
      track('Craving Beat', { trigger: 'breathing' })
    }

    fireConfetti()
    onClose()
  }

  const endEarly = () => {
    clearTimers()
    if (audioRef.current) audioRef.current.pause()
    setRunning(false)
    setCompleted(false)
    setPhase('ready')
    setRound(0)
    setSubText('Tap start when you\'re ready.')
    onClose()
  }

  useEffect(() => {
    if (!isOpen) {
      clearTimers()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      setRunning(false)
      setCompleted(false)
      setRound(0)
      setPhase('ready')
      setSubText('Tap start when you\'re ready.')
      creditedRef.current = false
      return
    }

    if (!audioRef.current) return
    audioRef.current.muted = soundMuted
    if (running && !soundMuted) {
      void audioRef.current.play().catch(() => {
        // Placeholder track may be missing until real file is provided.
      })
    }
    if (!running) {
      audioRef.current.pause()
    }
  }, [isOpen, running, soundMuted])

  useEffect(() => {
    return () => {
      clearTimers()
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

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
      <audio ref={audioRef} src={PLACEHOLDER_SOUNDTRACK} loop preload="none" />
      <div className="breath-stage">
        <div className={`breath-orb${phase !== 'ready' ? ` ${phase}` : ''}`} id="breath-orb" />
        <div className="breath-label" id="breath-label">{phaseLabel[phase]}</div>
      </div>
      <div className="breath-sub" id="breath-sub">{subText}</div>
      <div style={{ marginTop: 6 }}>
        <button className="btn--ghost" type="button" onClick={() => setSoundMuted((v) => !v)}>
          {soundMuted ? '🔇 Unmute soundtrack' : '🔈 Mute soundtrack'}
        </button>
        <div style={{ fontSize: 11, color: 'var(--mid-brown)' }}>Tam track placeholder is wired at /public/audio/meditation-instrumental-placeholder.mp3</div>
      </div>
      <div className="modal-actions">
        {!running && (
          <button className="btn btn--dark" id="breath-start-btn" onClick={startBreathing}>
            {completed ? 'Start again' : 'Start'}
          </button>
        )}
        {(running || completed) && (
          <button className="btn btn--dark" onClick={awardRodeItOut}>
            I rode it out
          </button>
        )}
        <button className="btn--ghost" onClick={endEarly}>End early</button>
      </div>
    </Modal>
  )
}
