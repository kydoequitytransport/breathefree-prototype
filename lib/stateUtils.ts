import { MILESTONES } from "../constants";
import { AppState } from "../types";

const DAY_MS = 86400000

export function detectBrowserTimeZone(): string {
  if (typeof window === 'undefined') return 'UTC'
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function parseStartMs(dateStr: string): number | null {
  const parsed = Date.parse(dateStr);
  return Number.isNaN(parsed) ? null : parsed;
}

function isYMD(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function ymdToDayIndex(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number)
  return Math.floor(Date.UTC(y, m - 1, d) / DAY_MS)
}

function addDaysToYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return toYMD(dt)
}

function normalizeToYMD(input: string, timeZone: string): string | null {
  if (!input) return null
  if (isYMD(input)) return input
  const ms = parseStartMs(input)
  if (!ms) return null
  return ymdInTimeZone(new Date(ms), timeZone)
}

export function ymdInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value || '1970'
  const month = parts.find((p) => p.type === 'month')?.value || '01'
  const day = parts.find((p) => p.type === 'day')?.value || '01'
  return `${year}-${month}-${day}`
}

export function hoursSinceRunStart(state: AppState): number {
  const src = state.runStartDate || state.quitDate || state.startedAt
  if (!src) return 0
  const ms = parseStartMs(src)
  if (!ms) return 0
  return (Date.now() - ms) / (1000 * 60 * 60)
}

export function daysSinceRunStart(state: AppState): number {
  const src = state.runStartDate || state.quitDate || state.startedAt
  if (!src) return 0
  const timeZone = state.timezone || detectBrowserTimeZone()
  const startYMD = normalizeToYMD(src, timeZone)
  if (!startYMD) return 0
  const todayYMD = ymdInTimeZone(new Date(), timeZone)
  return Math.max(0, ymdToDayIndex(todayYMD) - ymdToDayIndex(startYMD))
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
  const timeZone = updated.timezone || detectBrowserTimeZone()
  const todayStr = ymdInTimeZone(new Date(), timeZone)
  const quitDateStr = updated.quitDate ? normalizeToYMD(updated.quitDate, timeZone) : null
  const slipDateStrings = (updated.slipsLog || [])
    .map((s) => normalizeToYMD(s, timeZone))
    .filter((s): s is string => !!s)
    .sort()
  const slipDateSet = new Set(slipDateStrings)
  const hasSlips = slipDateStrings.length > 0
  const lastSlipDateStr = hasSlips ? slipDateStrings[slipDateStrings.length - 1] : null
  let currentRun = 0

  let startStr: string | null
  if (!hasSlips) {
    startStr = quitDateStr
  } else {
    startStr = addDaysToYMD(lastSlipDateStr!, 1)
  }

  if (startStr && startStr <= todayStr) {
    for (let dStr = startStr; dStr <= todayStr; dStr = addDaysToYMD(dStr, 1)) {
      if (!slipDateSet.has(dStr)) currentRun++
    }
  }
  updated.currentRun = currentRun

  let totalCleanDays = 0
  if (quitDateStr && quitDateStr <= todayStr) {
    for (let dStr = quitDateStr; dStr <= todayStr; dStr = addDaysToYMD(dStr, 1)) {
      if (!slipDateSet.has(dStr)) totalCleanDays++
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
  if (!s.timezone || !String(s.timezone).trim()) s.timezone = detectBrowserTimeZone()
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
  return ymdInTimeZone(new Date(), detectBrowserTimeZone())
}

export function todayKeyInTimeZone(timeZone?: string): string {
  return ymdInTimeZone(new Date(), timeZone || detectBrowserTimeZone())
}

export function checkMilestones(state: AppState): string[] {
  const days = daysSinceRunStart(state)
  const unlocked = new Set(state.unlockedMilestones || [])
  const newMilestones: string[] = []

  for (const milestone of MILESTONES) {
    if (days >= milestone.day && !unlocked.has(milestone.key)) {
      unlocked.add(milestone.key)
      if (milestone.celebrate) newMilestones.push(milestone.key)
    }
  }

  state.unlockedMilestones = Array.from(unlocked)
  return newMilestones
}
