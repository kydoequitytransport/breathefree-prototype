'use client'

import { useState } from 'react'
import { LeafIcon } from '@/components/ui/LeafIcon'

interface InstructionsViewProps {
  onDone: () => void
}

const STEPS = [
  {
    eyebrow: 'Step 1',
    title: 'Start your day from Home',
    body: 'Home shows your clean days, saved money, and today\'s support actions. If cravings hit, tap Craving and follow the breathing guide first.',
  },
  {
    eyebrow: 'Step 2',
    title: 'Use quick actions during hard moments',
    body: 'Tap Craving when urges spike. If you slip, log it right away. Logging is not punishment, it helps your plan adapt and keeps your data honest.',
  },
  {
    eyebrow: 'Step 3',
    title: 'Check your patterns and progress',
    body: 'Calendar and Triggers help you see streaks and risky moments. Use these pages to plan ahead for your hardest times of day.',
  },
  {
    eyebrow: 'Step 4',
    title: 'Customize from your Profile anytime',
    body: 'In Profile, you can edit your why, quit date, timezone, and reminders. You can also reopen this guide from Profile whenever you need a refresher.',
  },
] as const

function Progress({ current }: { current: number }) {
  return (
    <div className="onb-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
      {STEPS.map((_, idx) => (
        <div key={idx} className={`onb-progress-dot${idx <= current ? ' active' : ''}`} />
      ))}
    </div>
  )
}

export function InstructionsView({ onDone }: InstructionsViewProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleBack = () => {
    if (step === 0) {
      onDone()
      return
    }
    setStep((prev) => prev - 1)
  }

  const handleNext = () => {
    if (isLast) {
      onDone()
      return
    }
    setStep((prev) => prev + 1)
  }

  return (
    <div id="instructions" className="view active">
      <div className="inst-step">
        <Progress current={step} />

        <div className="inst-toprow">
          <button type="button" className="icon-btn" aria-label="Back" onClick={handleBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button type="button" className="inst-skip" onClick={onDone}>
            Skip
          </button>
        </div>

        <div className="inst-hero-icon" aria-hidden>
          <LeafIcon className="leaf-svg" style={{ width: 34, height: 34, color: 'var(--leaf)' }} />
        </div>

        <div className="inst-eyebrow">{current.eyebrow}</div>
        <h2>{current.title}</h2>
        <p className="inst-copy">{current.body}</p>

        <div className="inst-actions">
          <button type="button" className="btn btn--dark" onClick={handleNext}>
            {isLast ? 'Go to Home' : 'Next →'}
          </button>
          <button type="button" className="btn--ghost" onClick={onDone}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}
