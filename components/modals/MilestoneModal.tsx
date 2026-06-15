'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { LeafIcon } from '@/components/ui/LeafIcon'
import type { Milestone } from '@/types'

interface MilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  milestone: Milestone | null
  renderedTitle: string
  renderedFact: string
}

// Keep this switch for quick rollback if product wants the slogan back later.
const SHOW_COPY_SLOGAN = false
const COPY_SLOGAN_TEXT = 'Progress over streaks.'

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

    const frameWidth = canvas.width
    const frameHeight = canvas.height
    const frameX = 0
    const frameY = 0
    drawRoundedRect(ctx, frameX, frameY, frameWidth, frameHeight, 34, '#F2F1EE')

    const cardWidth = canvas.width - 48
    const cardHeight = canvas.height - 48
    const cardX = 24
    const cardY = 24
    drawRoundedRect(ctx, cardX, cardY, cardWidth, cardHeight, 36, '#E9DFC9')

    ctx.fillStyle = '#3A2A1B'
    ctx.font = '500 44px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('BreatheFree Milestone', canvas.width / 2, cardY + 108)

    const badgeY = cardY + 230
    ctx.beginPath()
    ctx.arc(canvas.width / 2, badgeY, 68, 0, Math.PI * 2)
    ctx.fillStyle = '#DECFB4'
    ctx.fill()

    drawLeafGlyph(ctx, canvas.width / 2, badgeY, 84, '#5E963E')

    ctx.fillStyle = '#5E963E'
    ctx.font = '700 32px Georgia, serif'
    ctx.fillText(formatMilestoneLabel(milestone.key), canvas.width / 2, cardY + 374)

    const sloganBaselineY = cardY + cardHeight - 56
    const dividerY = sloganBaselineY - 76
    const contentTop = cardY + 444
    const contentBottom = SHOW_COPY_SLOGAN ? dividerY - 34 : cardY + cardHeight - 44
    const textWidth = 680
    const layout = fitMilestoneTextLayout(ctx, renderedTitle, renderedFact, textWidth, contentTop, contentBottom)

    ctx.fillStyle = '#2B1F14'
    ctx.font = `700 ${layout.titleFontSize}px Georgia, serif`
    drawCenteredLines(ctx, layout.titleLines, canvas.width / 2, contentTop, layout.titleLineHeight)

    const factStartY = contentTop + layout.titleLines.length * layout.titleLineHeight + layout.gap
    ctx.fillStyle = '#6B5C4A'
    ctx.font = `italic 400 ${layout.factFontSize}px Georgia, serif`
    drawCenteredLines(ctx, layout.factLines, canvas.width / 2, factStartY, layout.factLineHeight)

    if (SHOW_COPY_SLOGAN) {
      ctx.strokeStyle = 'rgba(94, 139, 47, 0.35)'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 52, dividerY)
      ctx.lineTo(canvas.width / 2 + 52, dividerY)
      ctx.stroke()

      ctx.fillStyle = '#5E963E'
      ctx.font = '700 52px Georgia, serif'
      ctx.fillText(COPY_SLOGAN_TEXT, canvas.width / 2, dividerY + 76)
    }

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
      <div
        id="unlock-emoji"
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: '#DECFB4',
          margin: '0 auto 8px',
          display: 'grid',
          placeItems: 'center',
        }}
      >
          <LeafIcon style={{ width: 32, height: 32, color: '#5E963E' }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--leaf)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }} id="unlock-time">
        {formatMilestoneLabel(milestone.key)}
      </div>
      <h2 style={{ marginTop: 6 }} id="unlock-title">{renderedTitle}</h2>
      <p style={{ marginTop: 10 }} id="unlock-fact">{renderedFact}</p>
      <div className="modal-actions">
        {milestone.celebrate && (
          <>
            <button className="btn btn--dark" id="unlock-copy-btn" onClick={handleCopyImage}>
              {copying ? 'Preparing screenshot...' : 'Copy screenshot'}
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

function getWrappedLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
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

  return lines
}

function drawCenteredLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  startY: number,
  lineHeight: number
) {
  lines.forEach((line, i) => {
    ctx.fillText(line, centerX, startY + i * lineHeight)
  })
}

function drawLeafGlyph(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  size: number,
  color: string
) {
  const path = new Path2D('M21 4c-9 0-16 7-16 16 0 0.5 0 1 0.1 1.5C13 21 19 15 21 4z')
  ctx.save()
  ctx.translate(centerX - size / 2, centerY - size / 2)
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.fill(path)
  ctx.restore()
}

function fitMilestoneTextLayout(
  ctx: CanvasRenderingContext2D,
  title: string,
  fact: string,
  width: number,
  topY: number,
  bottomY: number
) {
  const availableHeight = Math.max(0, bottomY - topY)

  for (let titleSize = 74; titleSize >= 42; titleSize -= 2) {
    const titleLineHeight = Math.round(titleSize * 1.1)
    ctx.font = `700 ${titleSize}px Georgia, serif`
    const titleLines = getWrappedLines(ctx, title, width)
    if (titleLines.length > 4) continue

    const titleHeight = titleLines.length * titleLineHeight
    const remaining = availableHeight - titleHeight
    if (remaining < 70) continue

    for (let factSize = 46; factSize >= 24; factSize -= 2) {
      const factLineHeight = Math.round(factSize * 1.22)
      ctx.font = `italic 400 ${factSize}px Georgia, serif`
      const factLines = getWrappedLines(ctx, fact, width)
      const factHeight = factLines.length * factLineHeight
      const gap = Math.max(20, Math.min(56, Math.round((remaining - factHeight) / 2)))
      const total = titleHeight + gap + factHeight

      if (total <= availableHeight) {
        return { titleFontSize: titleSize, titleLineHeight, titleLines, factFontSize: factSize, factLineHeight, factLines, gap }
      }
    }
  }

  const fallbackTitleSize = 42
  const fallbackFactSize = 24
  const fallbackTitleLineHeight = Math.round(fallbackTitleSize * 1.1)
  const fallbackFactLineHeight = Math.round(fallbackFactSize * 1.22)

  ctx.font = `700 ${fallbackTitleSize}px Georgia, serif`
  const fallbackTitleLines = getWrappedLines(ctx, title, width).slice(0, 4)
  const titleHeight = fallbackTitleLines.length * fallbackTitleLineHeight
  const gap = 20
  const maxFactLines = Math.max(1, Math.floor((availableHeight - titleHeight - gap) / fallbackFactLineHeight))

  ctx.font = `italic 400 ${fallbackFactSize}px Georgia, serif`
  const fallbackFactLines = getWrappedLinesWithMaxLines(ctx, fact, width, maxFactLines)

  return {
    titleFontSize: fallbackTitleSize,
    titleLineHeight: fallbackTitleLineHeight,
    titleLines: fallbackTitleLines,
    factFontSize: fallbackFactSize,
    factLineHeight: fallbackFactLineHeight,
    factLines: fallbackFactLines,
    gap,
  }
}

function getWrappedLinesWithMaxLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const lines = getWrappedLines(ctx, text, maxWidth)
  if (lines.length <= maxLines) return lines

  const clipped = lines.slice(0, Math.max(1, maxLines))
  let last = clipped[clipped.length - 1]
  while (last.length > 0 && ctx.measureText(`${last}...`).width > maxWidth) {
    last = last.slice(0, -1)
  }
  clipped[clipped.length - 1] = `${last.trimEnd()}...`
  return clipped
}
