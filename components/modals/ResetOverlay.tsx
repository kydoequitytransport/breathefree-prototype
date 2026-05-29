'use client'

import { useState } from 'react'
import { updateUserPassword } from '@/lib/userDataService'
import { supabase } from '@/lib/supabase'

interface ResetOverlayProps {
  isOpen: boolean
  email: string
  onClose: () => void
}

export function ResetOverlay({ isOpen, email, onClose }: ResetOverlayProps) {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleUpdate = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      // If recovery tokens were captured earlier, set the session now so
      // `updateUser` will work. Avoid relying on a global session being
      // present — set it only when the user confirms the new password.
      try {
        const rec = (window as any)._bf_recovery
        if (rec && rec.access_token) {
          try { await supabase.auth.setSession(rec) } catch (e) { /* ignore */ }
        }
      } catch (e) { /* ignore */ }

      const { error } = await updateUserPassword(password)
      if (error) throw error
      setMessage('Password updated - reloading...')
      setTimeout(() => {
        onClose()
        window.history.replaceState({}, document.title, window.location.pathname)
        window.location.reload()
      }, 1000)
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(45,31,18,0.5)',
        display: 'flex', alignItems: 'flex-end', zIndex: 200,
      }}
    >
      <div
        style={{
          background: 'var(--cream)', borderRadius: '22px 22px 0 0',
          padding: '28px 24px 40px', width: '100%', maxWidth: 430, margin: '0 auto',
        }}
      >
        <h2>Set a new password</h2>
        <p style={{ marginTop: 8, color: 'var(--mid-brown)' }}>
          Set a new password for your account.
        </p>
        <div className="field" style={{ marginTop: 16 }}>
          <label>Email</label>
          <input type="email" value={email} disabled style={{ opacity: 0.7 }} />
        </div>
        <div className="field">
          <label>New password</label>
          <input
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {message && (
          <p style={{ marginTop: 8, fontSize: 13, color: 'var(--brown-text)' }}>{message}</p>
        )}
        <div className="modal-actions">
          <button className="btn btn--dark" onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating…' : 'Set new password'}
          </button>
          <button className="btn--ghost" onClick={onClose}>Back to app</button>
        </div>
      </div>
    </div>
  )
}
