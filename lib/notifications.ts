import type { PushSubscriptionSnapshot } from '@/types'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export type LocalNotificationScenario =
  | 'daily'
  | 'streak'
  | 'milestone'
  | 'risky'
  | 'weekly'
  | 'generic'

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return buffer
}

function getSubscriptionSnapshot(sub: PushSubscription): PushSubscriptionSnapshot | null {
  const json = sub.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
  }
}

export async function subscribeForPush(): Promise<PushSubscriptionSnapshot> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker is not supported in this browser.')
  }
  if (!('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.')
  }
  if (!VAPID_PUBLIC_KEY) {
    throw new Error('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY for push setup.')
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) {
    const snapshot = getSubscriptionSnapshot(existing)
    if (!snapshot) throw new Error('Unable to read existing push subscription.')
    return snapshot
  }

  const created = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
  })

  const snapshot = getSubscriptionSnapshot(created)
  if (!snapshot) throw new Error('Unable to read created push subscription.')
  return snapshot
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (!existing) return
  await existing.unsubscribe()
}

export async function fireLocalTestNotification(scenario: LocalNotificationScenario = 'generic'): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service worker is not supported in this browser.')
  }

  const payloadByScenario: Record<LocalNotificationScenario, { title: string; body: string }> = {
    daily: {
      title: 'Daily check-in reminder',
      body: 'Quick check-in lang para protected ang streak mo today.',
    },
    streak: {
      title: 'Streak protection',
      body: 'Hindi pa huli. One small action ngayon para tuloy ang momentum.',
    },
    milestone: {
      title: 'Milestone unlocked',
      body: 'Solid progress. May bagong milestone ka sa calendar mo.',
    },
    risky: {
      title: 'Risky moment ahead',
      body: 'May risky event ka mamaya. Open mo yung If/Then plan mo now.',
    },
    weekly: {
      title: 'Weekly recap',
      body: 'Tingnan mo ang wins mo this week at next milestone target mo.',
    },
    generic: {
      title: 'BreatheFree test notification',
      body: 'Test reminder from dev trigger. Your push setup is working.',
    },
  }

  const payload = payloadByScenario[scenario]
  const registration = await navigator.serviceWorker.ready
  await registration.showNotification(payload.title, {
    body: payload.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: `/?notifTest=${scenario}` },
    tag: `bf-test-${scenario}`,
  })
}
