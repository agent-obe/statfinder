import { useState } from 'react'
import { Button } from './Button'
import { cn } from '../lib/cn'

export type NavKey = 'query' | 'results' | 'saved' | 'settings'

interface HeaderNavProps {
  active: NavKey
  onNavigate: (k: NavKey) => void
  /** When true, show subtle prompt dot on Settings nav. */
  settingsAttention?: boolean
}

const LINKS: { key: NavKey; label: string }[] =
  [
    { key: 'query', label: 'Query' },
    { key: 'results', label: 'Latest result' },
    { key: 'saved', label: 'Saved' },
    { key: 'settings', label: 'Settings' },
  ]

export function HeaderNav({
  active,
  onNavigate,
  settingsAttention,
}: HeaderNavProps) {
  const [open, setOpen] = useState(false)

  function go(key: NavKey) {
    onNavigate(key)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[var(--color-cream)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-lg font-semibold tracking-tight text-[var(--color-green-ink)]">
              StatFinder
            </span>
            <span className="hidden text-xs font-medium uppercase tracking-wide text-stone-500 sm:inline">
              v1 • client-only
            </span>
          </div>
          <p className="truncate text-xs text-stone-600 sm:text-sm">
            Structured stats helper — sourcing forward, honesty first.
          </p>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => go(key)}
              className={cn(
                'relative rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100',
                active === key && 'bg-stone-900 text-white hover:bg-stone-900',
              )}
            >
              {label}
              {key === 'settings' && settingsAttention ? (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
              ) : null}
            </button>
          ))}
        </nav>

        <div className="md:hidden">
          <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
            Menu
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-stone-200 bg-[var(--color-cream)] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {LINKS.map(({ key, label }) => (
              <Button
                key={key}
                variant={active === key ? 'primary' : 'secondary'}
                className="justify-start"
                onClick={() => go(key)}
              >
                {label}
                {key === 'settings' && settingsAttention ? (
                  <span className="ml-auto text-xs font-normal text-white/90">
                    Action needed
                  </span>
                ) : null}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}
