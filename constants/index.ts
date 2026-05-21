import type { Milestone, Product, Flavor } from '@/types'

export const MILESTONES: Milestone[] = [
  { hours: 0.33, key: '20min', celebrate: false, title: 'Heart rate drops', emoji: '❤️', fact: 'Your heart rate and blood pressure just dropped back to normal. This is what the first 20 nicotine-free minutes feel like — and you did it.' },
  { hours: 8, key: '8hr', celebrate: false, title: 'Carbon monoxide halved', emoji: '🫁', fact: 'Half the carbon monoxide you were breathing is already gone. Your blood is carrying oxygen again, not smoke.' },
  { hours: 24, key: '24hr', celebrate: true, title: '24 hours clean', emoji: '🌅', fact: 'A full day. Your heart attack risk already dropped. The hardest part of day one is behind you — the brain is starting to adjust.' },
  { hours: 48, key: '48hr', celebrate: false, title: 'Taste & smell waking up', emoji: '👃', fact: 'Nerve endings in your nose and mouth are regrowing. Food is about to taste like food again.' },
  { hours: 72, key: '72hr', celebrate: true, title: '72 hours — nicotine is fully out', emoji: '💨', fact: 'All nicotine is now gone from your body. Cravings from here are habit loops, not chemistry — and you already have rituals for those.' },
  { hours: 168, key: '1wk', celebrate: true, title: '1 week clean', emoji: '🌱', fact: 'A full week. Your body is adjusting. Sleep is starting to normalize. You got through the hardest week — it only gets lighter from here.' },
  { hours: 336, key: '2wk', celebrate: true, title: '2 weeks — circulation back', emoji: '🩸', fact: 'Your circulation has measurably improved. Walking up stairs is getting easier. Lung function is climbing.' },
  { hours: 720, key: '1mo', celebrate: true, title: '1 month — coughing fades', emoji: '🌿', fact: 'Cilia in your lungs are regrowing. Coughing and shortness of breath are dropping. Your immune system is firing properly again.' },
  { hours: 2160, key: '3mo', celebrate: true, title: '3 months — lungs stronger', emoji: '💪', fact: 'Lung function up 30%. You breathe deeper without thinking about it. This is identity-level change.' },
  { hours: 4320, key: '6mo', celebrate: true, title: "6 months — you're {nonUser}", emoji: '🏆', fact: "Your relapse risk has dropped dramatically. You're not \"quitting\" anymore — you're someone who {negVerb}." },
  { hours: 8760, key: '1yr', celebrate: true, title: '1 year — heart disease risk halved', emoji: '🫀', fact: 'Your risk of coronary heart disease is half what it was a year ago. Half. You did that with breath and rituals.' },
]

export const DAY_MILESTONES = [
  { day: 1,   key: 'day1',   label: 'Day 1 · First clean day' },
  { day: 7,   key: 'day7',   label: 'Day 7 · First week clean' },
  { day: 14,  key: 'day14',  label: 'Day 14 · Two weeks in' },
  { day: 30,  key: 'day30',  label: 'Day 30 · Month one' },
  { day: 60,  key: 'day60',  label: 'Day 60 · The Relief begins' },
  { day: 90,  key: 'day90',  label: 'Day 90 · The Proof' },
  { day: 120, key: 'day120', label: 'Day 120 · The Other Side' },
  { day: 180, key: 'day180', label: 'Day 180 · Half a year' },
  { day: 270, key: 'day270', label: 'Day 270 · Nine months' },
  { day: 365, key: 'day365', label: 'Day 365 · One year clean' },
]

export const DAY_MILESTONE_MAP: Record<string, string | null> = {
  day1: '24hr', day7: '1wk', day14: '2wk', day30: '1mo',
  day60: null, day90: '3mo', day120: null, day180: '6mo',
  day270: null, day365: '1yr',
}

export const RITUAL_DATA = {
  necklace: {
    name: 'BreatheFree necklace',
    icon: '🫁',
    script: "6 slow breaths in through the resistance. 6 slow breaths out. You've got this.",
    tagline: 'Your resistance breath, whenever the urge hits.',
  },
  refills: {
    name: 'Flavor refills',
    icon: '🍃',
    script: "Load a refill. Inhale slow. Flavor hits the craving loop — hand-to-mouth handled, no nicotine.",
    tagline: "Flavor fix when breath alone isn't enough.",
  },
  breath: {
    name: '5 slow breaths',
    icon: '💨',
    script: 'Inhale 4 seconds. Hold 4. Exhale 6. Repeat 5 times. Free, anywhere, any time.',
    tagline: 'Your calm, already built in.',
  },
} as const

export const WHY_IDENTITY: Record<string, string> = {
  parent: "You're becoming someone your kids look up to.",
  athlete: "You're becoming someone who breathes easy again.",
  control: "You're becoming someone in control of your own days.",
  saver: "You're becoming someone who doesn't burn money on this.",
  free: "You're becoming someone who's just free of it.",
}

export const WHY_FIRST_PERSON: Record<string, string> = {
  parent: "I'm becoming someone my kids look up to.",
  athlete: "I'm becoming someone who breathes easy again.",
  control: "I'm becoming someone in control of my own days.",
  saver: "I'm becoming someone who doesn't burn money on this.",
  free: "I'm becoming someone who's just free of it.",
}

export const WITHDRAWAL_STAGES: Record<number, { text: string }> = {
  1: { text: '<strong>Day 1-3 is the hardest.</strong> Cravings peak, mood swings, irritability — all normal. Your brain is re-learning. Expect it, don\'t panic through it.' },
  2: { text: '<strong>Week 1-2:</strong> Physical cravings fade, habit cravings stay strong. If today feels mentally heavy, that\'s the sign you\'re deep in the work.' },
  3: { text: '<strong>Week 3-4:</strong> Physical symptoms mostly gone. Cue cravings are the battle now — the room, the meal, the time of day. Your trigger map is your weapon.' },
  4: { text: '<strong>Month 1-3:</strong> Cravings are occasional but sharp when triggered. You\'re building the identity layer now — every beat reinforces it.' },
  5: { text: "<strong>3+ months:</strong> You're not quitting anymore. You're someone who doesn't use nicotine. That shift is the real finish line." },
}

export const PRODUCTS: Product[] = [
  { id: 'necklace', name: 'BreatheFree necklace', tagline: 'Your primary ritual. Resistance breathing, everywhere you go.', icon: '🫁', url: 'https://breathefree.shop/products/the-smoke-free-necklace', badge: null },
  { id: 'refills', name: 'Pure flavor refills', tagline: "Hand-to-mouth + flavor. For cravings breath alone can't handle.", icon: '🍃', url: 'https://breathefree.shop/products/flavor-refills-copy', badge: 'Most popular' },
  { id: 'mullein', name: 'Mullein gummies', tagline: 'Lung + respiratory support.', icon: '🌿', url: 'https://breathefree.shop/products/mullein-gummies', badge: null },
  { id: 'zenflow', name: 'ZenFlow breathing stone', tagline: 'Tactile calm. Hold it, breathe with it, ground yourself.', icon: '🪨', url: 'https://breathefree.shop/products/zenflow-breathing-stone', badge: null },
  { id: 'spinner', name: 'Irritability spinner ring', tagline: 'Pocket reset. For mid-meeting cravings, queue anxiety.', icon: '💍', url: 'https://breathefree.shop/products/irritability-spinner-rings', badge: null },
]

export const FLAVORS: Flavor[] = [
  { name: 'Cool Mint',         emoji: '🌿', bg: '#CDE5E5', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/mint-pdp.png?v=1776052742',          variantId: 47193101729844 },
  { name: 'Watermelon Splash', emoji: '🍉', bg: '#F5C8C8', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/watermelon---pdp.png?v=1776052742',  variantId: 47193101860916 },
  { name: 'Coffee Rush',       emoji: '☕', bg: '#E5C8A0', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/coffee-pdp.png?v=1776052742',         variantId: 47193101926452 },
  { name: 'Strawberry Twist',  emoji: '🍓', bg: '#F5C8C8', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/strawberry-pdp.png?v=1776052742',    variantId: 47193101762612 },
  { name: 'Raspberry Zing',    emoji: '🫐', bg: '#D9C8E0', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/rasp-pdp.png?v=1776052742',           variantId: 47193101795380 },
  { name: 'Blueberry Ice',     emoji: '🫐', bg: '#C8D5E5', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/blueberry-pdp.png?v=1776052742',      variantId: 47193101828148 },
  { name: 'Lemon Breeze',      emoji: '🍋', bg: '#FCEFB5', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/Lemon-pdp.png?v=1776052742',          variantId: 47193101893684 },
  { name: 'Cinnamon Spice',    emoji: '🌶', bg: '#E5BCA5', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/Cinnamon.png?v=1776052742',           variantId: 47367564296244 },
  { name: 'Mango Burst',       emoji: '🥭', bg: '#FAD2A5', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/IMG_4505.png?v=1776052742',           variantId: 47367564329012 },
  { name: 'Arctic Menthol',    emoji: '❄️', bg: '#D5EEF0', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/IMG_4509.png?v=1776052742',           variantId: 47442016305204 },
  { name: 'Plain',             emoji: '⚪', bg: '#F0EDE8', img: 'https://cdn.shopify.com/s/files/1/0712/2668/7540/files/IMG_4632.jpg?v=1776052742',           variantId: 47381335015476 },
]

export const TRIGGER_LABELS: Record<string, string> = {
  morning: 'First coffee',
  meal: 'After meals',
  break: 'Work break',
  stress: 'Stress',
  night: '10PM',
  social: 'Social',
}
