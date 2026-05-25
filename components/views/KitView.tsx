'use client'

import { Topbar } from '@/components/layout/Topbar'
import { useApp } from '@/hooks/useApp'
import { PRODUCTS, FLAVORS } from '@/constants'
import type { ViewId } from '@/types'

interface KitViewProps {
  onNavigate: (view: ViewId) => void
}

export function KitView({ onNavigate }: KitViewProps) {
  const { state } = useApp()

  if (!state) return null

  const extraProducts = PRODUCTS.filter((p) => p.id !== 'necklace' && p.id !== 'refills')
  const baseUrl = 'https://breathefree.shop/products/flavor-refills-copy'

  return (
    <div className="view active" id="kit" style={{ padding: '0 22px 24px' }}>
      <Topbar onProfileClick={() => onNavigate('profile')} />

      <div className="page-header">
        <h1 className="page-title">Add to your kit</h1>
        <div style={{ fontSize: 40, fontWeight: 500, color: 'var(--brown-text)', marginTop: 8, lineHeight: 1.2 }}>
          Looking for more support?
        </div>
      </div>

      <div className="section-row">
        <div className="section-label">Pick your flavors</div>
        <div className="section-label" style={{ color: 'var(--mid-brown)' }}>Try something new</div>
      </div>

      <div className="flavor-grid" id="flavor-grid">
        {FLAVORS.map((f) => {
          const productUrl = `${baseUrl}?variant=${f.variantId}`
          return (
            <a
              key={f.name}
              className="flavor-card"
              href={productUrl}
              target="_blank"
              rel="noopener"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="flavor-icon" style={{ background: f.bg, overflow: 'hidden', padding: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.img} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
              </div>
              <div>
                <div className="flavor-name">{f.name}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--leaf)', textDecoration: 'underline', flexShrink: 0 }}>Buy</div>
            </a>
          )
        })}
      </div>

      <div className="section-row">
        <div className="section-label">More options</div>
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
              View product &gt;
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
