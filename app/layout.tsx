import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/hooks/useApp'
import './globals.css'

export const metadata: Metadata = {
  title: 'BreatheFree',
  description: 'Your quit starts with identity, not willpower.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}
