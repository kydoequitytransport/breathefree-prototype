'use client'

import { useState } from 'react'
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
  const [copying, setCopying] = useState(false)

  if (!milestone) return null

  const handleShare = () => {
    window.open('https://web.facebook.com/groups/breathefreecircle', '_blank')
    onClose()
  }

  const createMilestoneImageBlob = async (): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#2d1f12')
    gradient.addColorStop(1, '#3b2a18')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#f5e6d2'
    ctx.font = '700 42px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('BreatheFree Milestone', canvas.width / 2, 130)

    ctx.font = '88px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    ctx.fillText(milestone.emoji, canvas.width / 2, 300)

    ctx.fillStyle = '#9dd07e'
    ctx.font = '700 34px Georgia, serif'
    ctx.fillText(milestone.key.toUpperCase(), canvas.width / 2, 380)

    ctx.fillStyle = '#f5e6d2'
    ctx.font = '700 64px Georgia, serif'
    wrapCenteredText(ctx, renderedTitle, canvas.width / 2, 500, 860, 74)

    ctx.fillStyle = '#ddc4a1'
    ctx.font = '400 38px Georgia, serif'
    wrapCenteredText(ctx, renderedFact, canvas.width / 2, 700, 860, 52)

    ctx.fillStyle = '#9dd07e'
    ctx.font = '600 36px Georgia, serif'
    ctx.fillText('Proof over streaks.', canvas.width / 2, 1180)

    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create image'))
      }, 'image/png')
    })
  }

  const handleCopyImage = async () => {
    if (copying) return
    setCopying(true)
    try {
      const blob = await createMilestoneImageBlob()
      if ('ClipboardItem' in window && navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        alert('Milestone image copied. Paste it in your Circle post.')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `breathefree-${milestone.key}.png`
        a.click()
        URL.revokeObjectURL(url)
        alert('Downloaded your milestone image. Upload it in your Circle post.')
      }
    } catch (e) {
      alert('Could not copy image right now. You can still open the group and share manually.')
    } finally {
      setCopying(false)
    }
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
          <>
            <button className="btn btn--dark" id="unlock-copy-btn" onClick={handleCopyImage}>
              {copying ? 'Preparing image...' : '📸 Copy as image'}
            </button>
            <button className="btn--ghost" id="unlock-share-btn" onClick={handleShare}>
              Open Circle group →
            </button>
          </>
        )}
        <button className="btn--ghost" id="unlock-close-btn" onClick={onClose}>
          {milestone.celebrate ? 'Keep it to myself' : 'Got it'}
        </button>
      </div>
    </Modal>
  )
}

function wrapCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const trial = current ? `${current} ${word}` : word
    if (ctx.measureText(trial).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = trial
    }
  }
  if (current) lines.push(current)

  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight)
  })
}
