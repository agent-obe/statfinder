import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({
  className,
  variant = 'primary',
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  const base =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? 'bg-[var(--color-green-ink)] text-white hover:bg-[var(--color-green-soft)] focus-visible:outline-[var(--color-green-ink)]'
      : variant === 'secondary'
        ? 'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50 focus-visible:outline-stone-400'
        : 'bg-transparent text-[var(--color-green-ink)] hover:bg-stone-100 focus-visible:outline-stone-400'
  return (
    <button type="button" className={cn(base, styles, className)} {...rest}>
      {children}
    </button>
  )
}
