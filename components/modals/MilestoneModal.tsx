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
    canvas.width = 840
    canvas.height = 840
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')

    const cardWidth = canvas.width
    const cardHeight = canvas.height
    const cardX = 0
    const cardY = 0

    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36, '#F0E6D2')

    ctx.fillStyle = '#3A2A1B'
    ctx.font = '500 44px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('BreatheFree Milestone', canvas.width / 2, cardY + 96)

    const badgeY = cardY + 196
    ctx.beginPath()
    ctx.arc(canvas.width / 2, badgeY, 68, 0, Math.PI * 2)
    ctx.fillStyle = '#E5D6BC'
    ctx.fill()

    ctx.fillStyle = '#3A2A1B'
    ctx.font = '72px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'
    ctx.fillText(milestone.emoji, canvas.width / 2, badgeY + 24)

    ctx.fillStyle = '#9dd07e'
    ctx.font = '700 32px Georgia, serif'
    ctx.fillText(formatMilestoneLabel(milestone.key), canvas.width / 2, cardY + 312)

    ctx.fillStyle = '#2B1F14'
    ctx.font = '600 74px Georgia, serif'
    wrapCenteredText(ctx, renderedTitle, canvas.width / 2, cardY + 420, 680, 84)

    ctx.fillStyle = '#6B5C4A'
    ctx.font = 'italic 400 40px Georgia, serif'
    wrapCenteredText(ctx, renderedFact, canvas.width / 2, cardY + 558, 720, 56)

    const dividerY = cardY + cardHeight - 96
    ctx.strokeStyle = 'rgba(94, 139, 47, 0.45)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 52, dividerY)
    ctx.lineTo(canvas.width / 2 + 52, dividerY)
    ctx.stroke()

    ctx.fillStyle = '#5E8B2F'
    ctx.font = '600 34px Georgia, serif'
    ctx.fillText('Progress over streaks.', canvas.width / 2, dividerY + 56)

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
    <Modal id="unlock-modal" isOpen={isOpen} onClose={onClose} style={{ textAlign: 'center', position: 'relative' }}>
      <button
        type="button"
        aria-label="Close milestone"
        onClick={onClose}
        style={{
          position: 'absolute',
          right: 16,
          top: 12,
          border: 'none',
          background: 'transparent',
          color: 'var(--mid-brown)',
          fontSize: 28,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 4,
        }}
      >
        ×
      </button>
      <div style={{ fontSize: 44, marginBottom: 6 }} id="unlock-emoji">{milestone.emoji}</div>
      <div style={{ fontSize: 12, color: 'var(--leaf)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }} id="unlock-time">
        {formatMilestoneLabel(milestone.key)}
      </div>
      <h2 style={{ marginTop: 6 }} id="unlock-title">{renderedTitle}</h2>
      <p style={{ marginTop: 10 }} id="unlock-fact">{renderedFact}</p>
      <div className="modal-actions">
        {milestone.celebrate && (
          <>
            <button className="btn btn--dark" id="unlock-copy-btn" onClick={handleCopyImage}>
              {copying ? 'Preparing image...' : 'Copy as image'}
            </button>
            <button className="btn--ghost" id="unlock-share-btn" onClick={handleShare}>
              Share my progress
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

function formatMilestoneLabel(key: string): string {
  const match = key.match(/^(\d+)(d|wk|mo|yr)$/i)
  if (!match) return key.toUpperCase()

  const value = match[1]
  const unit = match[2].toLowerCase()

  if (unit === 'd') return `DAY ${value}`
  if (unit === 'wk') return `WEEK ${value}`
  if (unit === 'mo') return `MONTH ${value}`
  if (unit === 'yr') return `YEAR ${value}`
  return key.toUpperCase()
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
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
