export interface AppState {
  name: string
  email?: string
  timezone: string
  substance: 'vape' | 'smoke' | 'both'
  why: string
  quitDate: string
  dailySpend: number
  hasRefills: boolean
  trigger: string
  ritual: 'necklace' | 'refills' | 'breath'
  activeFlavor: string
  runStartDate: string
  startedAt?: string
  updatedAt?: string
  currentRun: number
  totalCleanDays: number
  lifetimeCleanDays: number
  bestRun: number
  slipCount: number
  slipsLog: string[]
  cravingsBeat: number
  unlockedMilestones: string[]
  checkinsLogged: CheckIn[]
  riskyDayPlans: RiskyDayPlan[]
  customRituals: CustomRitual[]
  customTriggers: string[]
  waves: string[]
  signedCommitment?: { name: string; body: string; signedAt: string }
}

export interface CheckIn {
  date: string
  mood: string
  day: string
  symptoms: string[]
}

export interface RiskyDayPlan {
  event: string
  date: string
  plan: string
}

export interface CustomRitual {
  name: string
  when: string
  createdAt: string
}

export interface EventLogEntry {
  event: string
  trigger?: string
  run_length_at_slip?: number
  properties?: Record<string, unknown>
}

export interface Milestone {
  day: number; // Added to align with milestone logic
  key: string
  celebrate: boolean
  title: string
  emoji: string
  fact: string
}

export interface Product {
  id: string
  name: string
  tagline: string
  icon: string
  url: string
  badge: string | null
}

export interface Flavor {
  name: string
  emoji: string
  bg: string
  img: string
  variantId: number
}

export type ViewId = 'onboarding' | 'home' | 'calendar' | 'tribe' | 'kit' | 'profile' | 'triggers'
