'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { recomputeRunState, freeTerm, detectBrowserTimeZone, todayKeyInTimeZone } from '@/lib/stateUtils'
import { WHY_IDENTITY } from '@/constants'
import { signOut, clearLocalStorage } from '@/lib/userDataService'
import type { ViewId } from '@/types'
import { subscribeForPush, unsubscribeFromPush } from '@/lib/notifications'

interface ProfileViewProps {
  onNavigate: (view: ViewId) => void
  onLogout: () => void
}

interface ProfileViewPropsExt extends ProfileViewProps {
  onSlip?: () => void
}

export function ProfileView({ onNavigate, onLogout, onSlip }: ProfileViewPropsExt) {
  const { state, saveState, track } = useApp()
  const [isEditingWhy, setIsEditingWhy] = useState(false)
  const [whyDraft, setWhyDraft] = useState('')
  const [whyError, setWhyError] = useState('')
  const [isEditingQuitDate, setIsEditingQuitDate] = useState(false)
  const [quitDateDraft, setQuitDateDraft] = useState('')
  const [isEditingTimezone, setIsEditingTimezone] = useState(false)
  const [timezoneDraft, setTimezoneDraft] = useState('')
  const [isSavingReminders, setIsSavingReminders] = useState(false)

  if (!state) return null

  const computed = recomputeRunState(state)
  const ft = freeTerm(state)
  const money = Math.round(computed.totalCleanDays * (state.dailySpend || 0))
  const whyDisplay = WHY_IDENTITY[state.why] || state.why || `You're becoming ${ft}.`
  const notificationSettings = state.notificationSettings
  const remindersEnabled = !!notificationSettings?.enabled

  const updateNotificationSettings = (patch: Partial<NonNullable<typeof state.notificationSettings>>) => {
    const nextSettings = {
      enabled: notificationSettings?.enabled || false,
      permission: notificationSettings?.permission || (typeof Notification !== 'undefined' ? Notification.permission : 'default'),
      reminderTime: notificationSettings?.reminderTime || '20:00',
      quietHoursStart: notificationSettings?.quietHoursStart || '22:00',
      quietHoursEnd: notificationSettings?.quietHoursEnd || '07:00',
      promptDismissed: notificationSettings?.promptDismissed || false,
      pushSubscription: notificationSettings?.pushSubscription || null,
      ...patch,
    }

    saveState({
      ...state,
      notificationSettings: nextSettings,
    })
    return nextSettings
  }

  const handleStartWhyEdit = () => {
    setWhyDraft(whyDisplay)
    setWhyError('')
    setIsEditingWhy(true)
  }

  const handleCancelWhyEdit = () => {
    setIsEditingWhy(false)
    setWhyDraft('')
    setWhyError('')
  }

  const handleSaveWhy = () => {
    const next = whyDraft.trim()
    if (!next) {
      setWhyError('Please enter your why.')
      return
    }
    const updated = { ...state, why: next }
    saveState(updated)
    track('Why Updated', { why: next })
    setIsEditingWhy(false)
    setWhyError('')
  }

  const handleLogout = async () => {
    if (!confirm('Log out? Your data stays safe - sign back in with the same email.')) return
    track('Logged Out')
    await signOut()
    clearLocalStorage()
    onLogout()
  }

  const handleEditQuitDate = () => {
    const current = state.quitDate || todayKeyInTimeZone(state.timezone)
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

    const todayStr = todayKeyInTimeZone(state.timezone)
    if (val > todayStr) {
      alert('Quit date cannot be in the future.')
      return
    }

    const updated = { ...state, quitDate: val, runStartDate: val }
    saveState(updated)
    track('Quit Date Updated', { quitDate: val })
    setIsEditingQuitDate(false)
  }

  const handleEditTimezone = () => {
    setTimezoneDraft(state.timezone || detectBrowserTimeZone())
    setIsEditingTimezone(true)
  }

  const handleCancelTimezoneEdit = () => {
    setTimezoneDraft('')
    setIsEditingTimezone(false)
  }

  const handleUseDeviceTimezone = () => {
    setTimezoneDraft(detectBrowserTimeZone())
  }

  const handleSaveTimezone = () => {
    const nextTz = timezoneDraft.trim() || 'UTC'
    const updated = { ...state, timezone: nextTz }
    saveState(updated)
    track('Timezone Updated', { timezone: nextTz })
    setIsEditingTimezone(false)
  }

  const handleEnableReminders = async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return

    setIsSavingReminders(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        updateNotificationSettings({ enabled: false, permission, promptDismissed: permission === 'denied' })
        track('Notifications Permission Result', { permission, source: 'profile' })
        return
      }

      const pushSubscription = await subscribeForPush()
      updateNotificationSettings({
        enabled: true,
        permission: 'granted',
        promptDismissed: true,
        pushSubscription,
      })
      track('Notifications Enabled', { source: 'profile' })
    } catch (error) {
      updateNotificationSettings({ enabled: true, permission: 'granted', promptDismissed: true, pushSubscription: null })
      track('Notifications Enable Failed', {
        source: 'profile',
        message: error instanceof Error ? error.message : 'unknown',
      })
    } finally {
      setIsSavingReminders(false)
    }
  }

  const handleDisableReminders = async () => {
    setIsSavingReminders(true)
    try {
      await unsubscribeFromPush()
    } catch {
      // No-op: local disable still applies even if unsubscribe fails.
    }

    updateNotificationSettings({ enabled: false, pushSubscription: null })
    track('Notifications Disabled', { source: 'profile' })
    setIsSavingReminders(false)
  }

  const handleChangeReminderTime = (value: string) => {
    updateNotificationSettings({ reminderTime: value })
  }

  const handleChangeQuietStart = (value: string) => {
    updateNotificationSettings({ quietHoursStart: value })
  }

  const handleChangeQuietEnd = (value: string) => {
    updateNotificationSettings({ quietHoursEnd: value })
  }

  const handleShowReminderCardAgain = () => {
    updateNotificationSettings({
      enabled: false,
      permission: 'default',
      promptDismissed: false,
      pushSubscription: null,
    })
    track('Notifications Prompt Reset', { source: 'profile' })
  }

  const quitDateObj = state.quitDate ? new Date(state.quitDate) : null
  const quitDateDisplay = (quitDateObj && !Number.isNaN(quitDateObj.getTime()))
    ? quitDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '-'

  return (
    <div className="view active" id="profile" style={{ padding: '0 22px 24px' }}>
      <Topbar onBackClick={() => onNavigate('home')} backTitle="You" />

      {/* Why card */}
      <div className="why-card">
        <div className="label">Your why</div>
        {!isEditingWhy ? (
          <>
            <p className="why-quote" id="profile-why">&quot;{whyDisplay}&quot;</p>
            <button className="why-edit" onClick={handleStartWhyEdit}>Edit →</button>
          </>
        ) : (
          <>
            <textarea
              value={whyDraft}
              onChange={(e) => { setWhyDraft(e.target.value); if (whyError) setWhyError('') }}
              rows={3}
              placeholder="Write your own reason..."
              style={{
                marginTop: 6,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                border: '1.5px solid rgba(245,230,210,0.35)',
                fontFamily: 'inherit',
                fontSize: 15,
                color: 'var(--cream)',
                background: 'rgba(245,230,210,0.08)',
                resize: 'vertical',
              }}
            />
            {whyError && <div style={{ marginTop: 8, fontSize: 12, color: '#ffd6d1' }}>{whyError}</div>}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn--cream" style={{ width: 'auto', padding: '9px 14px' }} onClick={handleSaveWhy}>Save</button>
              <button className="btn--ghost" style={{ width: 'auto', color: 'var(--faded-cream)' }} onClick={handleCancelWhyEdit}>Cancel</button>
            </div>
          </>
        )}
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
              max={todayKeyInTimeZone(state.timezone)}
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

      {/* Timezone */}
      <div className="quitdate-card" style={{ marginTop: 12 }}>
        {!isEditingTimezone ? (
          <>
            <div>
              <div className="label">Timezone</div>
              <div className="value">{state.timezone || 'UTC'}</div>
              <div style={{ fontSize: 12, color: 'var(--mid-brown)', marginTop: 4 }}>Used for daily boundaries and streak timing.</div>
            </div>
            <button className="quitdate-edit" onClick={handleEditTimezone}>Edit</button>
          </>
        ) : (
          <div style={{ width: '100%' }}>
            <div className="label">Timezone</div>
            <input
              type="text"
              value={timezoneDraft}
              onChange={(e) => setTimezoneDraft(e.target.value)}
              placeholder="e.g. Asia/Manila"
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
            <button className="btn--ghost" style={{ width: 'auto', padding: '8px 0', fontSize: 13, marginTop: 6 }} onClick={handleUseDeviceTimezone}>
              Use device timezone ({detectBrowserTimeZone()})
            </button>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn--dark" style={{ padding: '9px 12px', fontSize: 14 }} onClick={handleSaveTimezone}>Save</button>
              <button className="btn--ghost" style={{ width: 'auto', padding: '9px 4px', fontSize: 14 }} onClick={handleCancelTimezoneEdit}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="quitdate-card" style={{ marginTop: 12 }}>
        <div style={{ width: '100%' }}>
          <div className="label">Reminders</div>
          <div className="value" style={{ marginBottom: 6 }}>
            {remindersEnabled ? 'On' : 'Off'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--mid-brown)' }}>
            Daily nudge, streak protection, and milestone updates.
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {!remindersEnabled ? (
              <button className="btn btn--dark" style={{ padding: '9px 12px', fontSize: 14 }} onClick={handleEnableReminders} disabled={isSavingReminders}>
                {isSavingReminders ? 'Enabling...' : 'Enable reminders'}
              </button>
            ) : (
              <button className="btn btn--cream" style={{ padding: '9px 12px', fontSize: 14 }} onClick={handleDisableReminders} disabled={isSavingReminders}>
                {isSavingReminders ? 'Saving...' : 'Turn off reminders'}
              </button>
            )}
          </div>

          {notificationSettings?.promptDismissed && !remindersEnabled && (
            <button
              className="btn--ghost"
              style={{ width: 'auto', padding: '8px 0', fontSize: 13, marginTop: 6 }}
              onClick={handleShowReminderCardAgain}
            >
              Show home reminder card again
            </button>
          )}

          {remindersEnabled && (
            <>
              <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
                <label>Daily reminder time</label>
                <input
                  type="time"
                  value={notificationSettings?.reminderTime || '20:00'}
                  onChange={(e) => handleChangeReminderTime(e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Quiet start</label>
                  <input
                    type="time"
                    value={notificationSettings?.quietHoursStart || '22:00'}
                    onChange={(e) => handleChangeQuietStart(e.target.value)}
                  />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Quiet end</label>
                  <input
                    type="time"
                    value={notificationSettings?.quietHoursEnd || '07:00'}
                    onChange={(e) => handleChangeQuietEnd(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
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
        <button className="logout-link-subtle" onClick={handleLogout}>
          Log out
        </button>
      </div>

    </div>
  )
}
