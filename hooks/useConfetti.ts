'use client'

import { useCallback } from 'react'

export function useConfetti() {
  const fireConfetti = useCallback(() => {
    const container = document.getElementById('confetti')
    if (!container) return
    container.innerHTML = ''
    container.classList.add('active')
    const colors = ['#D4A574', '#5C8A3A', '#D85A30', '#5A4332', '#F5E4CC']
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('div')
      piece.className = 'confetti-piece'
      piece.style.left = Math.random() * 100 + '%'
      piece.style.background = colors[Math.floor(Math.random() * colors.length)]
      piece.style.animationDelay = Math.random() * 0.3 + 's'
      piece.style.animationDuration = 2 + Math.random() * 1 + 's'
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
      container.appendChild(piece)
    }
    setTimeout(() => {
      container.classList.remove('active')
    }, 3500)
  }, [])

  return { fireConfetti }
}
