import type { PropsWithChildren } from 'react'
import { cn } from '../lib/cn'

interface CardProps extends PropsWithChildren {
  className?: string
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-stone-200/80 bg-[var(--color-card)] p-4 shadow-sm sm:p-5',
        className,
      )}
    >
      {children}
    </div>
  )
}
