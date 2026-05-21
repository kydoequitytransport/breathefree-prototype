import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'coral' | 'dark' | 'cream' | 'ghost' | 'slip'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  coral: 'btn btn--coral',
  dark: 'btn btn--dark',
  cream: 'btn btn--cream',
  ghost: 'btn--ghost',
  slip: 'slip-link',
}

export function Button({ variant = 'dark', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
