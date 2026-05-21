import { Modal } from '@/components/ui/Modal'
import { useApp } from '@/hooks/useApp'
import { freeTerm } from '@/lib/stateUtils'

interface BeatModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BeatModal({ isOpen, onClose }: BeatModalProps) {
  const { state } = useApp()
  const ft = freeTerm(state)

  return (
    <Modal id="beat-modal" isOpen={isOpen} onClose={onClose} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>🎉</div>
      <h2>That&apos;s proof.</h2>
      <p id="beat-sub">
        Every craving you beat is evidence you&apos;re becoming {ft}. Your brain just wrote over an old pathway.
      </p>
      <div style={{ marginTop: 20, background: 'var(--pill-bg)', padding: 16, borderRadius: 'var(--radius-callout)', fontSize: 14, color: 'var(--brown-text)' }}>
        That&apos;s real proof your body is healing — not a number on a streak.
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--mid-brown)' }}>
        Cravings beaten: <strong id="beat-count">{state?.cravingsBeat || 0}</strong>
      </div>
      <div className="modal-actions">
        <button className="btn btn--dark" onClick={onClose}>Back to my day</button>
      </div>
    </Modal>
  )
}
