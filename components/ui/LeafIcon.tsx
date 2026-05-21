interface LeafIconProps {
  className?: string
  style?: React.CSSProperties
}

export function LeafIcon({ className, style }: LeafIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M21 4c-9 0-16 7-16 16 0 0.5 0 1 0.1 1.5C13 21 19 15 21 4z" />
    </svg>
  )
}
