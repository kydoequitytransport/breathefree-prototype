'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { recomputeRunState, freeTerm } from '@/lib/stateUtils'
import { WHY_IDENTITY, WHY_FIRST_PERSON, RITUAL_DATA } from '@/constants'
import { signOut, clearLocalStorage } from '@/lib/userDataService'
import type { ViewId } from '@/types'

interface ProfileViewProps {
  onNavigate: (view: ViewId) => void
  onLogout: () => void
}

interface ProfileViewPropsExt extends ProfileViewProps {
  onSlip?: () => void
}

export function ProfileView({ onNavigate, onLogout, onSlip }: ProfileViewPropsExt) {
  const { state, saveState, track } = useApp()
  const [isEditingQuitDate, setIsEditingQuitDate] = useState(false)
  const [quitDateDraft, setQuitDateDraft] = useState('')

  if (!state) return null

  const computed = recomputeRunState(state)
  const ft = freeTerm(state)
  const money = Math.round(computed.totalCleanDays * (state.dailySpend || 0))
  const whyDisplay = WHY_IDENTITY[state.why] || `You're becoming ${ft}.`

  const handleEditWhy = () => {
    const keys = Object.keys(WHY_IDENTITY)
    const choices = keys.map((k, i) => `${i + 1}. ${WHY_IDENTITY[k]}`).join('\n')
    const pick = prompt(`Pick a new identity anchor (1-${keys.length}):\n\n${choices}`, String(keys.indexOf(state.why) + 1))
    const idx = parseInt(pick || '')
    if (idx >= 1 && idx <= keys.length) {
      const updated = { ...state, why: keys[idx - 1] }
      saveState(updated)
      track('Why Updated', { why: updated.why })
    }
  }

  const handleLogout = async () => {
    if (!confirm('Log out? Your data stays safe — sign back in with the same email.')) return
    track('Logged Out')
    await signOut()
    clearLocalStorage()
    onLogout()
  }

  const handleEditQuitDate = () => {
    const current = state.quitDate || new Date().toISOString().split('T')[0]
    setQuitDateDraft(current)
    setIsEditingQuitDate(true)
  }

  const handleCancelQuitDateEdit = () => {
    setIsEditingQuitDate(false)
    setQuitDateDraft('')
  }

  const handleSaveQuitDate = () => {
    const val = quitDateDraft.trim()
    if (!val || !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      alert('Please use YYYY-MM-DD format.')
      return
    }

    const parsed = new Date(val)
    if (Number.isNaN(parsed.getTime())) {
      alert('Invalid date.')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (parsed > today) {
      alert('Quit date cannot be in the future.')
      return
    }

    const updated = { ...state, quitDate: val, runStartDate: val }
    saveState(updated)
    track('Quit Date Updated', { quitDate: val })
    setIsEditingQuitDate(false)
  }

  const substanceText =
    state.substance === 'both' ? 'smoking and vaping'
    : state.substance === 'vape' ? 'vaping'
    : 'smoking'
  const why = WHY_FIRST_PERSON[state.why] || `I'm becoming ${ft}.`

  const quitDateObj = state.quitDate ? new Date(state.quitDate) : null
  const quitDateDisplay = (quitDateObj && !Number.isNaN(quitDateObj.getTime()))
    ? quitDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  return (
    <div className="view active" id="profile" style={{ padding: '0 22px 24px' }}>
      <Topbar onBackClick={() => onNavigate('home')} backTitle="You" />

      {/* Why card */}
      <div className="why-card">
        <div className="label">Your why</div>
        <p className="why-quote" id="profile-why">&quot;{whyDisplay}&quot;</p>
        <button className="why-edit" onClick={handleEditWhy}>Edit →</button>
      </div>

      {/* Lifetime stats */}
      <div className="lifetime-card">
        <div className="label">Lifetime</div>
        <div className="lifetime-grid">
          <div className="lifetime-stat">
            <div className="num" id="profile-total-days">{computed.totalCleanDays}</div>
            <div className="lbl">Total clean days</div>
          </div>
          <div className="lifetime-stat">
            <div className="num" id="profile-money">${money}</div>
            <div className="lbl">Saved</div>
          </div>
          <div className="lifetime-stat">
            <div className="num" id="profile-cravings">{state.cravingsBeat || 0}</div>
            <div className="lbl">Cravings beaten</div>
          </div>
          <div className="lifetime-stat">
            <div className="num" id="profile-milestones">{(state.unlockedMilestones || []).length}</div>
            <div className="lbl">Milestones hit</div>
          </div>
        </div>
        <p className="lifetime-promise">Lifetime numbers never reset. Slips don&apos;t erase who you are.</p>
      </div>

      {/* Quit date */}
      <div className="quitdate-card">
        {!isEditingQuitDate ? (
          <>
            <div>
              <div className="label">Quit date</div>
              <div className="value" id="profile-quitdate">{quitDateDisplay}</div>
            </div>
            <button className="quitdate-edit" onClick={handleEditQuitDate}>Edit</button>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div className="label">Quit date</div>
            <input
              type="date"
              value={quitDateDraft}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setQuitDateDraft(e.target.value)}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid rgba(45,31,18,0.14)',
                fontFamily: 'inherit',
                fontSize: 14,
                color: 'var(--brown-text)',
                background: 'white',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn--dark" style={{ padding: '9px 12px', fontSize: 14 }} onClick={handleSaveQuitDate}>Save</button>
              <button className="btn--ghost" style={{ width: 'auto', padding: '9px 4px', fontSize: 14 }} onClick={handleCancelQuitDateEdit}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Commitment section removed per design parity */}

      {/* Auth */}
      {/* Slip action */}
      <div style={{ marginTop: 18 }}>
        <div className="slip-profile-card" onClick={() => onSlip ? onSlip() : null}>
          <div className="name">Log a slip</div>
          <div className="sub">No shame. It's data, not defeat.</div>
        </div>
      </div>

      {/* Auth */}
      <div style={{ marginTop: 18 }}>
        <button className="logout-link-subtle" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {/* Dev reset */}
      <button
        style={{ marginTop: 12, fontSize: 10, color: 'rgba(45,31,18,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => { if (confirm('Reset all data?')) { clearLocalStorage(); window.location.reload() } }}
      >
        reset
      </button>
    </div>
  )
}
