'use client'

import { type CSSProperties } from 'react'

interface ChipOption {
  value: string
  label: string
}

interface ChipGroupProps {
  options: ChipOption[]
  selected: string | string[]
  multi?: boolean
  onSelect: (value: string) => void
  id?: string
  style?: CSSProperties
}

export function ChipGroup({ options, selected, multi = false, onSelect, id, style }: ChipGroupProps) {
  const isSelected = (value: string) =>
    multi
      ? Array.isArray(selected) && selected.includes(value)
      : selected === value

  return (
    <div className="chips" id={id} style={style}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`chip${isSelected(opt.value) ? ' selected' : ''}`}
          data-value={opt.value}
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
