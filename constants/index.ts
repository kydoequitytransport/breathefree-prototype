import type { Milestone, Product, Flavor } from '@/types'

export const MILESTONES: Milestone[] = [
  { day: 1, key: '1d', celebrate: true, title: 'Day one.', emoji: '🌅', fact: "One full day of choosing yourself. That's where every long run starts." },
  { day: 7, key: '1wk', celebrate: true, title: 'Still showing up.', emoji: '🌱', fact: "Most people give up trying. You're still here. That's something to be proud of. The first few weeks are the hardest, but you'll get through them." },
  { day: 14, key: '2wk', celebrate: true, title: 'Two weeks in.', emoji: '🪷', fact: 'Anyone can try for a day. Two weeks is a different person.' },
  { day: 30, key: '1mo', celebrate: true, title: 'You stayed.', emoji: '🌿', fact: "You're a month into something most people never finish." },
  { day: 60, key: '2mo', celebrate: true, title: 'You kept going.', emoji: '🕊️', fact: "Two months ago you made a decision. You're still living it." },
  { day: 90, key: '3mo', celebrate: true, title: 'You crossed the line.', emoji: '💪', fact: "Most people who make it to month three don't go back." },
  { day: 180, key: '6mo', celebrate: true, title: 'Half a year.', emoji: '🏆', fact: "You've spent six months becoming someone different." },
  { day: 270, key: '9mo', celebrate: true, title: 'Almost a year.', emoji: '🌙', fact: "Three months from now, you'll have done a year of this." },
  { day: 365, key: '1yr', celebrate: true, title: 'You did it.', emoji: '🛟', fact: 'A year ago this felt impossible. Look at you now.' },
]

export const DAY_MILESTONES = [
  { day: 7,   key: 'day7',   label: '1 week' },
  { day: 14,  key: 'day14',  label: '2 weeks' },
  { day: 30,  key: 'day30',  label: '1 month' },
  { day: 60,  key: 'day60',  label: '2 months' },
  { day: 90,  key: 'day90',  label: '3 months' },
  { day: 120, key: 'day120', label: '4 months' },
  { day: 180, key: 'day180', label: '6 months' },
  { day: 270, key: 'day270', label: '9 months' },
  { day: 365, key: 'day365', label: '1 year' },
]

export const DAY_MILESTONE_MAP: Record<string, string | null> = {
  day7: '1wk', day14: '2wk', day30: '1mo',
  day60: '2mo', day90: '3mo', day120: null, day180: '6mo',
  day270: '9mo', day365: '1yr',
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
    script: "Load a refill. Inhale slow. Flavor hits the craving loop - hand-to-mouth handled, no nicotine.",
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
  1: { text: '<strong>Day 1-3 is the hardest.</strong> Cravings peak, mood swings, irritability - all normal. Your brain is re-learning. Expect it, don\'t panic through it.' },
  2: { text: '<strong>Week 1-2:</strong> Physical cravings fade, habit cravings stay strong. If today feels mentally heavy, that\'s the sign you\'re deep in the work.' },
  3: { text: '<strong>Week 3-4:</strong> Physical symptoms mostly gone. Cue cravings are the battle now - the room, the meal, the time of day. Your trigger map is your weapon.' },
  4: { text: '<strong>Month 1-3:</strong> Cravings are occasional but sharp when triggered. You\'re building the identity layer now - every beat reinforces it.' },
  5: { text: "<strong>3+ months:</strong> You're not quitting anymore. You're someone who doesn't use nicotine. That shift is the real finish line." },
}

export const PRODUCTS: Product[] = [
  { id: 'necklace', name: 'BreatheFree necklace', tagline: 'Your primary ritual. Resistance breathing, everywhere you go.', icon: '🫁', url: 'https://breathefree.shop/products/the-smoke-free-necklace', badge: null },
  { id: 'refills', name: 'Pure flavor refills', tagline: "Hand-to-mouth + flavor. For cravings breath alone can't handle.", icon: '🍃', url: 'https://breathefree.shop/products/flavor-refills-copy', badge: 'Most popular' },
  { id: 'mullein', name: 'Mullein Gummies', tagline: 'For clearer breathing and less coughing.', icon: '🌿', url: 'https://breathefree.shop/products/mullein-gummies-for-lung-health', badge: null },
  { id: 'zenflow', name: 'ZenFlow Breathing Stone', tagline: 'Stronger resistance, in a pocket-friendly stone.', icon: '🪨', url: 'https://breathefree.shop/products/tigerzen', badge: null },
  { id: 'spinner', name: 'Irritability Spinner Rings', tagline: 'Spin it to ride out a craving.', icon: '💍', url: 'https://breathefree.shop/products/stress-free-fidget-spinner-rings', badge: null },
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
