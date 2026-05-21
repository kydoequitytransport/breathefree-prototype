'use client'

import { Modal } from '@/components/ui/Modal'
import type { Milestone } from '@/types'

interface MilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  milestone: Milestone | null
  renderedTitle: string
  renderedFact: string
}

export function MilestoneModal({ isOpen, onClose, milestone, renderedTitle, renderedFact }: MilestoneModalProps) {
  if (!milestone) return null

  const handleShare = () => {
    window.open('https://web.facebook.com/groups/breathefreecircle', '_blank')
    onClose()
  }

  return (
    <Modal id="unlock-modal" isOpen={isOpen} onClose={onClose} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 6 }} id="unlock-emoji">{milestone.emoji}</div>
      <div style={{ fontSize: 12, color: 'var(--leaf)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }} id="unlock-time">
        {milestone.key}
      </div>
      <h2 style={{ marginTop: 6 }} id="unlock-title">{renderedTitle}</h2>
      <p style={{ marginTop: 10 }} id="unlock-fact">{renderedFact}</p>
      <div style={{ marginTop: 20, background: 'var(--lighter-cream)', padding: 14, borderRadius: 'var(--radius-callout)', fontSize: 14, color: 'var(--brown-text)' }}>
        That&apos;s real proof your body is healing — not a number on a streak.
      </div>
      <div className="modal-actions">
        {milestone.celebrate && (
          <button className="btn btn--dark" id="unlock-share-btn" onClick={handleShare}>
            📸 Share this win to the Circle
          </button>
        )}
        <button className="btn--ghost" id="unlock-close-btn" onClick={onClose}>
          {milestone.celebrate ? 'Keep it to myself' : 'Got it'}
        </button>
      </div>
    </Modal>
  )
}
