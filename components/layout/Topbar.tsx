import { LeafIcon } from '@/components/ui/LeafIcon'
import type { ViewId } from '@/types'

interface TopbarProps {
  onProfileClick?: () => void
  onBackClick?: () => void
  backTitle?: string
}

export function Topbar({ onProfileClick, onBackClick, backTitle }: TopbarProps) {
  if (onBackClick) {
    return (
      <header className="topbar topbar-back">
        <button className="icon-btn" aria-label="Back" onClick={onBackClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="title">{backTitle}</div>
        <div style={{ width: 36 }} />
      </header>
    )
  }

  return (
    <header className="topbar">
      <div style={{ width: 36 }} />
      <div className="topbar-logo">
        <LeafIcon className="leaf-svg" style={{ color: 'var(--leaf)' }} />
        BreatheFree
      </div>
      <button className="icon-btn" aria-label="Profile" onClick={onProfileClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </svg>
      </button>
    </header>
  )
}
