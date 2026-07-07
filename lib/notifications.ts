import type { PushSubscriptionSnapshot } from '@/types'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
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
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
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
