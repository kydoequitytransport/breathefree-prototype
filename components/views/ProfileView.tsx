'use client'

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

  const substanceText =
    state.substance === 'both' ? 'smoking and vaping'
    : state.substance === 'vape' ? 'vaping'
    : 'smoking'
  const why = WHY_FIRST_PERSON[state.why] || `I'm becoming ${ft}.`

  const quitDateDisplay = state.quitDate
    ? new Date(state.quitDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
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
            <div className="lbl">Cravings beat</div>
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
        <div>
          <div className="label">Quit date</div>
          <div className="value" id="profile-quitdate">{quitDateDisplay}</div>
        </div>
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
        <button className="btn--ghost" onClick={handleLogout} style={{ color: 'var(--coral)' }}>
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
