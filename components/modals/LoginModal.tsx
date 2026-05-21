'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { signIn, resetPasswordForEmail } from '@/lib/userDataService'
import { useApp } from '@/hooks/useApp'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  initialEmail?: string
}

export function LoginModal({ isOpen, onClose, onSuccess, initialEmail }: LoginModalProps) {
  const { hydrateState } = useApp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)

  // If the parent supplies an initial email (e.g. onboarding detected an existing
  // account), pre-fill the email field when the modal opens.
  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail)
      setMode('login')
      setError('')
    }
  }, [isOpen, initialEmail])

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: err } = await signIn(email, password)
      if (err) throw err
      await hydrateState()
      onClose()
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async () => {
    if (!email) { setError('Enter your email to reset password.'); return }
    setLoading(true)
    try {
      const { error: err } = await resetPasswordForEmail(email, window.location.origin + '/')
      if (err) throw err
      setError('Password reset email sent. Check your inbox.')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal id="login-modal" isOpen={isOpen} onClose={onClose}>
      <h2>Log in to your account</h2>
      <div className="field" style={{ marginTop: 16 }}>
        <label>Email</label>
        <input
          type="email"
          id="login-email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {mode === 'login' && (
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            id="login-password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
      )}
      {error && (
        <div style={{ color: 'var(--coral)', marginTop: 10, fontSize: 13, textAlign: 'center' }}>
          {error}
        </div>
      )}
      <div className="modal-actions">
        {mode === 'login' ? (
          <>
            <button className="btn btn--dark" onClick={handleLogin} disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
            <button className="btn--ghost" onClick={() => setMode('forgot')}>
              Forgot password?
            </button>
            <button className="btn--ghost" onClick={onClose}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn--dark" onClick={handleForgot} disabled={loading}>
              {loading ? 'Sending…' : 'Send reset email'}
            </button>
            <button className="btn--ghost" onClick={() => setMode('login')}>
              Back to login
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
