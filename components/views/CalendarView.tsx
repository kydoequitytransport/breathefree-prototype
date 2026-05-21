'use client'

import { useState } from 'react'
import { Topbar } from '@/components/layout/Topbar'
import { LeafIcon } from '@/components/ui/LeafIcon'
import { useApp } from '@/hooks/useApp'
import { recomputeRunState, sameDay } from '@/lib/stateUtils'
import { MILESTONES, DAY_MILESTONES, DAY_MILESTONE_MAP } from '@/constants'
import { MilestoneModal } from '@/components/modals/MilestoneModal'
import { interpolate } from '@/lib/stateUtils'
import type { Milestone, ViewId } from '@/types'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOWS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface CalendarViewProps {
  onNavigate: (view: ViewId) => void
}

export function CalendarView({ onNavigate }: CalendarViewProps) {
  const { state } = useApp()
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

  if (!state) return null

  const computed = recomputeRunState(state)
  const today = new Date()
  const baselineQuitDate = new Date(state.quitDate || state.runStartDate)
  const slips = (state.slipsLog || []).map((s) => new Date(s))
  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const cumDays = computed.currentRun || 0

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const openDayMilestone = (key: string) => {
    const bodyKey = DAY_MILESTONE_MAP[key]
    const m = bodyKey ? MILESTONES.find((x) => x.key === bodyKey) : null
    if (m) { setSelectedMilestone(m); return }
    const dm = DAY_MILESTONES.find((d) => d.key === key)
    if (!dm) return
    setSelectedMilestone({
      key: dm.key,
      title: dm.label.split(' · ')[1],
      fact: "You're building the new you, one clean day at a time.",
      emoji: '🌿',
      celebrate: true,
      hours: 0,
    })
  }

  const firstLockedIdx = DAY_MILESTONES.findIndex((m) => m.day > cumDays)

  return (
    <div className="view active" id="calendar" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="cal-summary">
        <div className="label">Cumulative clean days</div>
        <div className="row">
          <LeafIcon className="leaf-svg" style={{ width: 26, height: 26, color: 'var(--leaf)' }} />
          <div className="num" id="cal-clean-days">{computed.totalCleanDays}</div>
        </div>
      </div>

      {/* Month switcher */}
      <div className="month-switcher">
        <button onClick={prevMonth} aria-label="Previous month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="month-label" id="cal-month-label">{MONTHS[calMonth]} {calYear}</div>
        <button onClick={nextMonth} aria-label="Next month">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="calgrid" id="calgrid">
        {DOWS.map((d, i) => (
          <div key={i} className="caldow">{d}</div>
        ))}
        {Array.from({ length: firstDow }).map((_, i) => (
          <div key={`empty-${i}`} className="calcell calcell--empty" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1
          const d = new Date(calYear, calMonth, day)
          const isToday = sameDay(d, today)
          const isFuture = d > today
          const isSlip = slips.some((s) => sameDay(s, d))
          const isClean = !isFuture && !isSlip && d >= baselineQuitDate
          let cls = 'calcell'
          if (isToday) cls += ' calcell--today'
          if (isFuture) cls += ' calcell--future'
          if (isSlip) cls += ' calcell--slip'
          return (
            <div key={day} className={cls}>
              {isSlip ? (
                <>
                  <span className="date">{day}</span>
                  <span className="slip-label">slip</span>
                </>
              ) : (
                <>
                  {isClean && <LeafIcon className="leaf-svg" />}
                  <span className="date">{day}</span>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Milestones */}
      <div className="milestones-section">
        <div className="ms-section-label">Your milestones</div>
        <div className="ms-list">
          {DAY_MILESTONES.map((m, i) => {
            const earned = m.day <= cumDays
            const isNext = !earned && i === firstLockedIdx
            if (isNext) {
              const daysAway = m.day - cumDays
              return (
                <div key={m.key} className="ms-next-card" onClick={() => openDayMilestone(m.key)}>
                  <div className="ms-next-left">
                    <LeafIcon className="ms-next-leaf" />
                    <span className="ms-next-text">{m.label}</span>
                  </div>
                  <span className="ms-next-badge">{daysAway} day{daysAway === 1 ? '' : 's'}</span>
                </div>
              )
            }
            if (earned) {
              return (
                <div key={m.key} className="ms-row ms-row--earned" onClick={() => openDayMilestone(m.key)}>
                  <div className="ms-row-left">
                    <svg className="ms-icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="ms-row-text">{m.label}</span>
                  </div>
                  <span className="ms-row-right">Earned</span>
                </div>
              )
            }
            return (
              <div key={m.key} className="ms-row ms-row--locked">
                <div className="ms-row-left">
                  <div className="ms-icon-circle" />
                  <span className="ms-row-text">{m.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <MilestoneModal
        isOpen={!!selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        milestone={selectedMilestone}
        renderedTitle={selectedMilestone ? interpolate(selectedMilestone.title, state) : ''}
        renderedFact={selectedMilestone ? interpolate(selectedMilestone.fact, state) : ''}
      />
    </div>
  )
}
