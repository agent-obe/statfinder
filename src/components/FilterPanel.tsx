import type { StatFilters } from '../types/stat'
import { Card } from './Card'
import { cn } from '../lib/cn'

const FIELDS: { key: keyof StatFilters; label: string; placeholder: string }[] =
  [
    { key: 'country', label: 'Country / region', placeholder: 'e.g., United States' },
    { key: 'state', label: 'State / province', placeholder: 'Optional' },
    { key: 'city', label: 'City', placeholder: 'Optional' },
    { key: 'age', label: 'Age band', placeholder: 'e.g., 25–64' },
    { key: 'sex', label: 'Sex', placeholder: 'Optional' },
    { key: 'race', label: 'Race / ethnicity', placeholder: 'Optional' },
    { key: 'income', label: 'Income band', placeholder: 'Optional' },
    { key: 'education', label: 'Education', placeholder: 'e.g., bachelor’s +' },
    { key: 'year', label: 'Year / period', placeholder: 'e.g., 2022' },
    {
      key: 'denominator',
      label: 'Denominator / universe',
      placeholder: 'e.g., adults 25+',
    },
  ]

interface FilterPanelProps {
  filters: StatFilters
  onChange: (next: StatFilters) => void
  defaultOpen?: boolean
}

export function FilterPanel({
  filters,
  onChange,
  defaultOpen = false,
}: FilterPanelProps) {
  return (
    <details
      className="group rounded-xl border border-stone-200 bg-white/80"
      open={defaultOpen}
    >
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-stone-900 sm:px-5">
        <span className="flex items-center justify-between gap-3">
          Structured filters
          <span className="rounded-md bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600 group-open:hidden">
            Optional
          </span>
          <span className="hidden rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900 group-open:inline">
            Editing
          </span>
        </span>
      </summary>
      <div className="border-t border-stone-200 px-4 pb-4 pt-2 sm:px-5">
        <p className="mb-4 text-sm text-stone-600">
          These fields are passed verbatim to the model as structured hints. Future
          connectors can validate them against registry-backed dimensions.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {FIELDS.map(({ key, label, placeholder }) => (
            <Card key={key} className="border-stone-200/80 bg-white p-3 sm:p-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-stone-500">
                {label}
              </label>
              <input
                className={cn(
                  'mt-1.5 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900',
                  'placeholder:text-stone-400 focus:border-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-900/20',
                )}
                value={filters[key]}
                placeholder={placeholder}
                onChange={(e) =>
                  onChange({ ...filters, [key]: e.target.value })
                }
              />
            </Card>
          ))}
        </div>
      </div>
    </details>
  )
}
