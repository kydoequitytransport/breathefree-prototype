'use client'

import { type ReactNode } from 'react'

interface ModalProps {
  id: string
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  style?: React.CSSProperties
}

export function Modal({ id, isOpen, onClose, children, style }: ModalProps) {
  return (
    <div
      id={id}
      className={`modal-backdrop${isOpen ? ' active' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" style={style}>
        <div className="modal-handle" />
        {children}
      </div>
    </div>
  )
}
