'use client'

import { useState } from 'react'
import type { AppState } from '@/types'
import { useApp } from '@/hooks/useApp'
import { signUp, signIn } from '@/lib/userDataService'
import { recomputeRunState } from '@/lib/stateUtils'
import { LoginModal } from '@/components/modals/LoginModal'

interface OnboardingViewProps {
  onComplete: () => void
}

const STEPS = 5

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="onb-progress">
      {Array.from({ length: STEPS }).map((_, i) => (
        <div
          key={i}
          className={`onb-progress-dot${i <= current ? ' active' : ''}`}
          data-step={i}
        />
      ))}
    </div>
  )
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { saveState, hydrateState, setUserId, setSupaReady } = useApp()
  const [step, setStep] = useState(0)
  const [showLogin, setShowLogin] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPasswordHint, setShowPasswordHint] = useState(false)
  const [substance, setSubstance] = useState('')
  const [why, setWhy] = useState('')
  const [whyOther, setWhyOther] = useState('')
  const [quitDate, setQuitDate] = useState(new Date().toISOString().split('T')[0])
  const [dailySpend, setDailySpend] = useState('')
  const [hasRefills, setHasRefills] = useState('')
  const [trigger, setTrigger] = useState('')
  const [error, setError] = useState('')

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1))
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const validateStep = () => {
    if (step === 0) return true
    if (step === 1) {
      if (!name.trim()) { setError('Enter your first name.'); return false }
      if (!substance) { setError('Pick what you want to quit.'); return false }
      return true
    }
    if (step === 2) {
      if (!why) { setError('Pick your why.'); return false }
      return true
    }
    if (step === 3) {
      if (!quitDate) { setError('Pick a quit date.'); return false }
      return true
    }
    return true
  }

  const handleNext = async () => {
    setError('')
    if (!validateStep()) return

    // On step 1 we collect email/password — do a safe signup attempt
    // to detect an existing account (like the original index.html flow).
    if (step === 1) {
      if (!email || !/.+@.+\..+/.test(email)) { setError('Enter a valid email.'); return }
      if (!password || password.length < 6) { setShowPasswordHint(true); return }
      setShowPasswordHint(false)

      if (!signupDone) {
        try {
          const { error: signupErr } = await signUp(email, password)
          if (signupErr) {
            const msg = signupErr.message || ''
            if (/already registered|already exists|user already exists|account already exists/i.test(msg)) {
              setError('Account exists, please log in.')
              setShowLogin(true)
              return
            } else {
              setError(signupErr.message || 'Signup failed')
              return
            }
          } else {
            // Signup attempt succeeded — mark so we don't try again on finish
            setSignupDone(true)
          }
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : 'Signup check failed')
          return
        }
      }
    }

    if (step === STEPS - 1) {
      handleFinish()
    } else {
      goNext()
    }
  }

  const handleFinish = async () => {
    const baseState: AppState = {
      name: name.trim(),
      email,
      substance: substance as AppState['substance'],
      why: why === 'other' ? whyOther || 'other' : why,
      quitDate,
      dailySpend: parseFloat(dailySpend) || 0,
      hasRefills: hasRefills === 'yes',
      trigger: trigger || 'stress',
      ritual: hasRefills === 'yes' ? 'refills' : 'necklace',
      activeFlavor: 'Cool Mint',
      runStartDate: quitDate,
      startedAt: new Date().toISOString(),
      currentRun: 0,
      totalCleanDays: 0,
      lifetimeCleanDays: 0,
      bestRun: 0,
      slipCount: 0,
      slipsLog: [],
      cravingsBeat: 0,
      unlockedMilestones: [],
      checkinsLogged: [],
      riskyDayPlans: [],
      customRituals: [],
      customTriggers: [],
      waves: [],
    }

    const computed = recomputeRunState(baseState)

    if (email && password) {
      try {
        if (!signupDone) await signUp(email, password)
        await signIn(email, password)
        await hydrateState()
      } catch (e) {
        // Continue without auth if signup/signin fails
      }
    }

    saveState(computed)
    onComplete()
  }

  return (
    <div id="onboarding" className="view active">
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={onComplete}
        initialEmail={email}
      />

      {/* Step 0 - Welcome */}
      {step === 0 && (
        <div className="onb-step active" data-step={0}>
          <ProgressDots current={0} />
          <div style={{ fontSize: 44, marginBottom: 16 }}>🌿</div>
          <h1>Welcome to BreatheFree.</h1>
          <p style={{ marginTop: 14, fontSize: 17, color: 'var(--brown-text)' }}>
            This isn&apos;t a streak counter. It&apos;s a quit partner — built around how the brain actually breaks nicotine habits.
          </p>
          <p style={{ marginTop: 14, color: 'var(--mid-brown)' }}>
            Three minutes to set up. No shame if you slip. Your progress is yours to keep.
          </p>
          <div className="onb-cta">
            <button type="button" className="btn btn--dark" onClick={goNext}>Let&apos;s start →</button>
          </div>
        </div>
      )}

      {/* Step 1 - About you */}
      {step === 1 && (
        <div className="onb-step active" data-step={1}>
          <ProgressDots current={1} />
          <div className="onb-eyebrow">About you</div>
          <h2>A few quick details.</h2>
          <p style={{ marginTop: 8 }}>Your first name shows in your pod. Your email syncs progress across devices.</p>
          <div className="field" style={{ marginTop: 20 }}>
            <label>First name</label>
            <input type="text" placeholder="Tam" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setShowPasswordHint(e.target.value.length > 0 && e.target.value.length < 6) }}
            />
            {showPasswordHint && (
              <div style={{ marginTop: 6, background: '#2D1F12', color: '#F2E6D0', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
                Password should be at least 6 characters.
              </div>
            )}
          </div>
          <div style={{ marginBottom: 18 }}>
            <button
              style={{ fontSize: 13, color: 'var(--leaf)', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
              onClick={() => setShowLogin(true)}
            >
              Already have an account? Log in
            </button>
          </div>
          <div className="field">
            <label>What do you want to quit?</label>
            <div className="chips" id="onb-substance">
              {[{ value: 'vape', label: 'Vaping' }, { value: 'smoke', label: 'Smoking' }, { value: 'both', label: 'Both' }].map((opt) => (
                <button key={opt.value} type="button" className={`chip${substance === opt.value ? ' selected' : ''}`} onClick={() => setSubstance(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {error && <p style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</p>}
          <div className="onb-cta">
            <button className="btn btn--dark" onClick={handleNext}>Continue →</button>
            <button className="btn--ghost" onClick={goBack} style={{ marginTop: 8 }}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 2 - Why */}
      {step === 2 && (
        <div className="onb-step active" data-step={2}>
          <ProgressDots current={2} />
          <div className="onb-eyebrow">Your why</div>
          <h2>Who are you becoming?</h2>
          <p style={{ marginTop: 8, color: 'var(--mid-brown)' }}>
            The single biggest predictor of quitting for good is a clear identity — not willpower. Pick the one that hits hardest.
          </p>
          <div className="chips" id="onb-why" style={{ marginTop: 0, flexDirection: 'column', gap: 10 }}>
            {[
              { value: 'parent', label: '👨‍👧 Someone my kids look up to' },
              { value: 'athlete', label: '🏃 Someone who breathes easy again' },
              { value: 'control', label: '🧘 Someone in control of my own days' },
              { value: 'saver', label: "💰 Someone who doesn't burn money on this" },
              { value: 'free', label: "🌿 Someone who's just… free of it" },
              { value: 'other', label: '✏️ Other…' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`chip${why === opt.value ? ' selected' : ''}`}
                style={{ width: '100%', justifyContent: 'flex-start', padding: '16px 18px' }}
                onClick={() => setWhy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
            {why === 'other' && (
              <div className="field" style={{ marginTop: 0 }}>
                <input
                  type="text"
                  placeholder="Type your own why..."
                  value={whyOther}
                  onChange={(e) => setWhyOther(e.target.value)}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 999, border: '1.5px solid #ccc', fontSize: 15 }}
                />
              </div>
            )}
          </div>
          {error && <p style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</p>}
          <div className="onb-cta">
            <button className="btn btn--dark" onClick={handleNext}>Continue →</button>
            <button className="btn--ghost" onClick={goBack} style={{ marginTop: 8 }}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 3 - Quit date + spend */}
      {step === 3 && (
        <div className="onb-step active" data-step={3}>
          <ProgressDots current={3} />
          <div className="onb-eyebrow">The start line</div>
          <h2>When are you quitting?</h2>
          <p style={{ marginTop: 8, color: 'var(--mid-brown)' }}>
            Fresh-start dates work best. Pick a Monday, the 1st, or a birthday. Already quit? Pick a past date — the app catches up to where you really are.
          </p>
          <div className="field" style={{ marginTop: 20 }}>
            <label>Quit date</label>
            <input type="date" id="onb-quitdate" value={quitDate} onChange={(e) => setQuitDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Daily spend on smoking / vaping</label>
            <input type="number" id="onb-spend" placeholder="20" inputMode="numeric" value={dailySpend} onChange={(e) => setDailySpend(e.target.value)} />
            <div className="muted" style={{ marginTop: 6 }}>We&apos;ll turn this into wins you can feel.</div>
          </div>
          {error && <p style={{ color: 'var(--coral)', fontSize: 13 }}>{error}</p>}
          <div className="onb-cta">
            <button className="btn btn--dark" onClick={handleNext}>Continue →</button>
            <button className="btn--ghost" onClick={goBack} style={{ marginTop: 8 }}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 4 - Toolkit */}
      {step === 4 && (
        <div className="onb-step active" data-step={4}>
          <ProgressDots current={4} />
          <div className="onb-eyebrow">Your toolkit</div>
          <h2>When a craving hits, the necklace is your move.</h2>
          <p style={{ marginTop: 8, color: 'var(--mid-brown)' }}>
            Nicotine addiction is two loops — the chemical one and the hand-to-mouth one. Your BreatheFree necklace handles both with resistance breathing.
          </p>
          <div className="product-card" style={{ marginTop: 16 }}>
            <div className="product-icon">🫁</div>
            <div className="product-body">
              <div className="product-name">BreatheFree necklace</div>
              <div className="product-sub">Your primary ritual · activated</div>
            </div>
            <div className="pill-active">Ready</div>
          </div>
          <div className="field" style={{ marginTop: 20 }}>
            <label>Do you also have flavor refills?</label>
            <div className="chips" id="onb-has-refills">
              {[{ value: 'yes', label: "Yes, I've got refills" }, { value: 'no', label: 'Not yet — necklace only' }].map((opt) => (
                <button key={opt.value} type="button" className={`chip${hasRefills === opt.value ? ' selected' : ''}`} onClick={() => setHasRefills(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="muted" style={{ marginTop: 8 }}>Refills add flavor when breath alone isn&apos;t enough.</div>
          </div>
          <div className="field" style={{ marginTop: 20 }}>
            <label>When&apos;s your hardest craving moment?</label>
            <div className="chips" id="onb-trigger">
              {[
                { value: 'morning', label: 'First coffee' },
                { value: 'meal', label: 'After meals' },
                { value: 'break', label: 'Work break' },
                { value: 'stress', label: 'Stress' },
                { value: 'night', label: '10PM wind-down' },
                { value: 'social', label: 'Social' },
              ].map((opt) => (
                <button key={opt.value} type="button" className={`chip${trigger === opt.value ? ' selected' : ''}`} onClick={() => setTrigger(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="muted" style={{ marginTop: 8 }}>We&apos;ll set a gentle reminder for this window.</div>
          </div>
          <div className="onb-cta">
            <button className="btn btn--dark" onClick={handleNext}>Start my journey →</button>
            <button className="btn--ghost" onClick={goBack} style={{ marginTop: 8 }}>← Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
