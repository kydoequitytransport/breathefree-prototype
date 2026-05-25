import { Topbar } from '@/components/layout/Topbar'
import type { ViewId } from '@/types'

interface TribeViewProps {
  onNavigate: (view: ViewId) => void
}

export function TribeView({ onNavigate }: TribeViewProps) {
  return (
    <div className="view active" id="tribe" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="page-header">
        <h1 className="page-title">The Circle</h1>
        <p className="page-intro">
          A private support group where you stay accountable, share milestones, get real advice, and read stories from people who&apos;ve been there.
        </p>
      </div>

      <div className="tribe-hero" style={{ marginTop: 22 }}>
        <div className="icon-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
            <path d="M14 20c0-2.5 2-4 4-4s4 1.5 4 4" />
          </svg>
          <div className="title">Quit + Recovery Circle</div>
        </div>
        <div className="sub">Private Facebook group · Members only</div>
        <button
          className="btn btn--cream"
          onClick={() => window.open('https://web.facebook.com/groups/breathefreecircle', '_blank')}
        >
          Open the group →
        </button>
      </div>

      <div className="section-row">
        <div className="section-label">How we show up here</div>
      </div>
      <div className="callout checklist-callout">
        {[
          'Post your wins and milestones.',
          'Post your slips. You\'ll find support, not judgment.',
          'Pass on what\'s working: Your day 30 helps someone else\'s day 1.',
          'Respond with care and encourage each other.',
          'No judging anyone\'s pace.',
        ].map((item) => (
          <p key={item}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {item}
          </p>
        ))}
      </div>

      <div className="section-row">
        <div className="section-label">Ready to share?</div>
      </div>
      <div className="callout" style={{ marginBottom: 12 }}>
        <p>Post your story, celebrate a milestone, ask for advice, talk about a slip, or just check in. The Circle is here for it.</p>
      </div>
      <button
        className="btn btn--dark"
        onClick={() => window.open('https://web.facebook.com/groups/breathefreecircle', '_blank')}
      >
        Post in the Circle →
      </button>
    </div>
  )
}
