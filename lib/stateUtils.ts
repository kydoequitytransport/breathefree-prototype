import type { AppState } from '@/types'

export function parseStartMs(dateStr: string): number | null {
  if (!dateStr) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (m) {
    const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3])
    return Date.UTC(y, mo, d)
  }
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) return parsed.getTime()
  return null
}

export function hoursSinceRunStart(state: AppState): number {
  const src = state.runStartDate || state.quitDate || state.startedAt
  if (!src) return 0
  const ms = parseStartMs(src)
  if (!ms) return 0
  return (Date.now() - ms) / (1000 * 60 * 60)
}

export function daysSinceDate(dateStr: string): number {
  const ms = parseStartMs(dateStr)
  if (!ms) return 0
  return Math.floor((Date.now() - ms) / 86400000)
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toYMD(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

/** Local calendar date as YYYY-MM-DD (matches index.html). */
export function localYMD(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Recompute current run streak and cumulative clean days.
 * Milestones use currentRun: consecutive clean days since quit date, or since the day after the latest slip.
 */
export function recomputeRunState(state: AppState): AppState {
  const updated = { ...state }
  const today = new Date()
  const quitDate = updated.quitDate ? new Date(updated.quitDate) : null
  const slips = (updated.slipsLog || []).map((s) => new Date(s))

  const slipDateStrings = (updated.slipsLog || []).map((s) => s.slice(0, 10)).sort()
  const hasSlips = slipDateStrings.length > 0
  const lastSlipDateStr = hasSlips ? slipDateStrings[slipDateStrings.length - 1] : null

  const quitDateStr = updated.quitDate ? updated.quitDate.slice(0, 10) : null
  const todayStr = localYMD(today)
  let currentRun = 0

  let startStr: string | null
  if (!hasSlips) {
    startStr = quitDateStr
  } else {
    const afterSlip = new Date(lastSlipDateStr!)
    afterSlip.setUTCDate(afterSlip.getUTCDate() + 1)
    startStr = afterSlip.toISOString().slice(0, 10)
  }

  if (startStr && startStr <= todayStr) {
    for (let d = new Date(startStr); d.toISOString().slice(0, 10) <= todayStr; d.setUTCDate(d.getUTCDate() + 1)) {
      const dStr = d.toISOString().slice(0, 10)
      if (!slipDateStrings.includes(dStr)) currentRun++
    }
  }
  updated.currentRun = currentRun

  let totalCleanDays = 0
  if (quitDate) {
    for (let d = new Date(quitDate); d <= today; d.setDate(d.getDate() + 1)) {
      const isSlip = slips.some((slip) => sameDay(slip, d))
      if (!isSlip) totalCleanDays++
    }
  }
  updated.totalCleanDays = totalCleanDays
  updated.bestRun = Math.max(updated.bestRun || 0, currentRun)

  if (updated.lifetimeCleanDays === undefined) {
    updated.lifetimeCleanDays = updated.totalCleanDays || 0
  }

  return updated
}

export function runMigrations(state: AppState): AppState {
  const s = { ...state }
  s.unlockedMilestones = s.unlockedMilestones
    ? Array.from(new Set(s.unlockedMilestones))
    : []
  s.checkinsLogged = s.checkinsLogged || []
  s.riskyDayPlans = s.riskyDayPlans || []
  s.customRituals = s.customRituals || []
  if ((s.ritual as string) === 'breathlace') s.ritual = 'necklace'
  if ((s.ritual as string) === 'mullein') s.ritual = 'refills'
  if (s.slipsLog && s.slipsLog.length > 0) {
    s.runStartDate = s.slipsLog[s.slipsLog.length - 1]
  } else {
    s.runStartDate = s.quitDate
  }
  if (s.slipCount === undefined) s.slipCount = 0
  if (!s.waves) s.waves = []
  if (s.hasRefills === undefined) s.hasRefills = s.ritual === 'refills'
  if (s.lifetimeCleanDays === undefined) s.lifetimeCleanDays = s.totalCleanDays || 0
  return s
}

export function freeTerm(state?: AppState | null): string {
  if (!state) return 'nicotine-free'
  if (state.substance === 'vape') return 'vape-free'
  if (state.substance === 'smoke') return 'smoke-free'
  return 'nicotine-free'
}

export function nonUserTerm(state?: AppState | null): string {
  if (!state) return 'nicotine-free'
  if (state.substance === 'vape') return 'a non-vaper'
  if (state.substance === 'smoke') return 'a non-smoker'
  return 'nicotine-free for good'
}

export function negVerbTerm(state?: AppState | null): string {
  if (!state) return "doesn't use nicotine"
  if (state.substance === 'vape') return "doesn't vape"
  if (state.substance === 'smoke') return "doesn't smoke"
  return "doesn't use nicotine"
}

export function interpolate(str: string, state?: AppState | null): string {
  return String(str)
    .replace(/\{free\}/g, freeTerm(state))
    .replace(/\{nonUser\}/g, nonUserTerm(state))
    .replace(/\{negVerb\}/g, negVerbTerm(state))
}

export function getStageLabel(totalCleanDays: number): string {
  if (totalCleanDays < 30) return ''
  if (totalCleanDays < 60) return 'The Relief'
  if (totalCleanDays < 90) return 'The Proof'
  return 'The Other Side'
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
