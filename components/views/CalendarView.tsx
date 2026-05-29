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
const DISPLAY_MILESTONES = [{ day: 1, key: 'day1', label: '1 day' }, ...DAY_MILESTONES]

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
      title: dm.label.split(' · ')[1] || dm.label,
      fact: "You're building the new you, one clean day at a time.",
      emoji: '🌿',
      celebrate: true,
      day: dm.day,
    })
  }

  // 2-column milestone grid, '1 day' at the top
  const allMilestones = DISPLAY_MILESTONES
  // Split evenly for two columns
  const mid = Math.ceil(allMilestones.length / 2)
  const leftMilestones = allMilestones.slice(0, mid)
  const rightMilestones = allMilestones.slice(mid)

  return (
    <div className="view active" id="calendar" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="cal-summary">
        <div className="label">Days since quit date</div>
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
      <div className="milestones-section" id="milestone-map" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 24 }}>
        <div className="ms-section-label" style={{ textAlign: 'center', marginBottom: 10, fontWeight: 500, letterSpacing: 1 }}>Your milestones</div>
        <div className="ms-card" style={{ background: 'var(--soft-cream)', borderRadius: 18, padding: '14px 16px', minWidth: 260, maxWidth: 400, width: '100%' }}>
          <div className="ms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px' }}>
            <div className="ms-col" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {leftMilestones.map((m) => {
                const earned = m.day <= cumDays
                // 1 day milestone does not open popup
                if (m.key === 'day1') {
                  return (
                    <div key={m.key} className={`ms-item${earned ? ' ms-item--earned' : ' ms-item--locked'}`} style={{ cursor: 'default', display: 'flex', alignItems: 'center', padding: '5px 0', background: 'transparent', border: 'none' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {earned ? <LeafIcon className="ms-item-icon" style={{ color: 'var(--leaf)' }} /> : <span className="ms-item-circle" />}
                        <span className="ms-item-text" style={{ fontSize: 17, fontWeight: 500 }}>{m.label}</span>
                      </span>
                    </div>
                  )
                }
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={`ms-item${earned ? ' ms-item--earned' : ' ms-item--locked'}`}
                    style={{ display: 'flex', alignItems: 'center', padding: '5px 0', width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', outline: 'none', cursor: earned ? 'pointer' : 'default' }}
                    onClick={() => earned && openDayMilestone(m.key)}
                    disabled={!earned}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {earned ? <LeafIcon className="ms-item-icon" style={{ color: 'var(--leaf)' }} /> : <span className="ms-item-circle" />}
                      <span className="ms-item-text" style={{ fontSize: 17, fontWeight: 500 }}>{m.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="ms-col" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {rightMilestones.map((m) => {
                const earned = m.day <= cumDays
                return (
                  <button
                    key={m.key}
                    type="button"
                    className={`ms-item${earned ? ' ms-item--earned' : ' ms-item--locked'}`}
                    style={{ display: 'flex', alignItems: 'center', padding: '5px 0', width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none', outline: 'none', cursor: earned ? 'pointer' : 'default' }}
                    onClick={() => earned && openDayMilestone(m.key)}
                    disabled={!earned}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      {earned ? <LeafIcon className="ms-item-icon" style={{ color: 'var(--leaf)' }} /> : <span className="ms-item-circle" />}
                      <span className="ms-item-text" style={{ fontSize: 17, fontWeight: 500 }}>{m.label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
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
