import type { ViewId } from '@/types'

interface BottomNavProps {
  activeView: ViewId
  onNavigate: (view: ViewId) => void
}

// Match original index.html order: Home, Calendar, Triggers, Tribe, Kit
const NAV_ITEMS: { id: ViewId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
    ),
  },
  {
    id: 'triggers',
    label: 'Triggers',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="6" y1="20" x2="6" y2="12" />
        <line x1="12" y1="20" x2="12" y2="6" />
        <line x1="18" y1="20" x2="18" y2="14" />
      </svg>
    ),
  },
  {
    id: 'tribe',
    label: 'Tribe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
        <path d="M14 20c0-2.5 2-4 4-4s4 1.5 4 4" />
      </svg>
    ),
  },
  {
    id: 'kit',
    label: 'Kit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M5 8h14l-1 12H6L5 8z" />
        <path d="M9 8V5a3 3 0 016 0v3" />
      </svg>
    ),
  },
]

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottomnav">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`navbtn${activeView === item.id ? ' active' : ''}`}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  )
}
