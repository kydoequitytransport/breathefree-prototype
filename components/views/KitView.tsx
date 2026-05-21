'use client'

import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { PRODUCTS, FLAVORS } from '@/constants'
import type { ViewId } from '@/types'

interface KitViewProps {
  onNavigate: (view: ViewId) => void
}

export function KitView({ onNavigate }: KitViewProps) {
  const { state, saveState } = useApp()

  if (!state) return null

  const activeFlavor = state.activeFlavor || 'Cool Mint'
  const extraProducts = PRODUCTS.filter((p) => p.id !== 'necklace' && p.id !== 'refills')
  const baseUrl = 'https://breathefree.shop/products/flavor-refills-copy'

  const switchFlavor = (name: string) => {
    saveState({ ...state, activeFlavor: name })
  }

  return (
    <div className="view active" id="kit" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="page-header">
        <h1 className="page-title">Your kit</h1>
        <p className="page-intro">
          What you&apos;ve got, plus what&apos;s next. Every product here exists for a specific moment on your quit journey.
        </p>
      </div>

      <div className="section-row">
        <div className="section-label">Pick your flavors</div>
        <div className="section-label" style={{ color: 'var(--mid-brown)' }}>Switch anytime</div>
      </div>

      <div className="flavor-grid" id="flavor-grid">
        {FLAVORS.map((f) => {
          const isActive = f.name === activeFlavor
          const productUrl = `${baseUrl}?variant=${f.variantId}`
          return (
            <div
              key={f.name}
              className={`flavor-card${isActive ? ' flavor-card--active' : ''}`}
              onClick={() => switchFlavor(f.name)}
            >
              <div className="flavor-icon" style={{ background: f.bg, overflow: 'hidden', padding: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              </div>
              <div>
                <div className="flavor-name">{f.name}</div>
                {isActive && <div className="flavor-active-label">Active</div>}
              </div>
              {isActive ? (
                <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener"
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontSize: 11, color: 'var(--leaf)', textDecoration: 'underline', flexShrink: 0 }}
                >
                  Buy
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div className="section-row">
        <div className="section-label">Extra support</div>
      </div>
      <div id="kit-catalogue">
        {extraProducts.map((p) => (
          <div key={p.id} className="support-card">
            <div className="support-card-row">
              <div className="support-icon">{p.icon}</div>
              <div>
                <div className="support-name">{p.name}</div>
                <div className="support-tag">{p.tagline}</div>
              </div>
            </div>
            <a className="support-cta" href={p.url} target="_blank" rel="noopener">
              View product →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
