import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BreatheFree',
    short_name: 'BreatheFree',
    description: 'Your quit starts with identity, not willpower.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#F2E6D0',
    theme_color: '#2D1F12',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
