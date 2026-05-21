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
          A private Facebook group for people walking this journey together. Share wins, screenshot your milestones, read stories from people ahead of you.
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
        <div className="section-label">How the Circle works</div>
      </div>
      <div className="callout checklist-callout">
        {[
          'Hit a milestone → screenshot it, post to the group.',
          'Slip? Post it. The Circle will hold space.',
          'First names only. No judgment. No rankings.',
          'Staff and long-term quitters moderate gently.',
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
        <div className="section-label">Ready to share your own?</div>
      </div>
      <div className="callout" style={{ marginBottom: 12 }}>
        <p>Every milestone you hit is proof that this works. Your post today is someone&apos;s reason to keep going tomorrow.</p>
      </div>
      <button
        className="btn btn--dark"
        onClick={() => window.open('https://web.facebook.com/groups/breathefreecircle', '_blank')}
      >
        Post your progress →
      </button>
    </div>
  )
}
