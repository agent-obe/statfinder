import type { StatFilters } from '../types/stat'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { FilterPanel } from '../components/FilterPanel'
import { EXAMPLE_QUERY } from '../lib/mockData/sampleStatResult'

interface QueryPageProps {
  queryText: string
  onQueryChange: (q: string) => void
  filters: StatFilters
  onFiltersChange: (f: StatFilters) => void
  onSubmit: () => void
  onLoadDemo: () => void
  loading: boolean
  error: string | null
  canQuery: boolean
  /** When keys missing, clicking primary can route to settings instead. */
  onNeedSettings: () => void
}

export function QueryPage({
  queryText,
  onQueryChange,
  filters,
  onFiltersChange,
  onSubmit,
  onLoadDemo,
  loading,
  error,
  canQuery,
  onNeedSettings,
}: QueryPageProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
          Ask for a statistic — with explicit limits
        </h1>
        <p className="max-w-prose text-sm text-stone-600 sm:text-base">
          StatFinder does not query private databases. The model must return
          structured JSON and avoid pretending it has live governmental access.
          Add optional filters to steer geography and universe.
        </p>
      </div>

      <Card className="space-y-4 border-stone-200/90">
        <label className="block text-sm font-semibold text-stone-800">
          Research question
          <textarea
            className="mt-2 max-h-64 min-h-40 w-full resize-y rounded-xl border border-stone-200 bg-white px-3 py-3 text-base text-stone-900 shadow-inner placeholder:text-stone-400 focus:border-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
            placeholder="Be specific about population, year, and measure."
            value={queryText}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-sm text-stone-600">
          <span className="font-medium text-stone-800">Example:</span>
          <button
            type="button"
            className="text-left text-[var(--color-green-ink)] underline decoration-emerald-900/30 underline-offset-2 hover:decoration-emerald-900"
            onClick={() => onQueryChange(EXAMPLE_QUERY)}
          >
            Insert example prompt
          </button>
          <span aria-hidden className="hidden sm:inline">
            ·
          </span>
          <button
            type="button"
            className="text-left text-[var(--color-green-ink)] underline decoration-emerald-900/30 underline-offset-2 hover:decoration-emerald-900"
            onClick={() => onLoadDemo()}
          >
            Load sample result (offline)
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-stone-500">
            Filters collapse on small screens — expand when you need structure.
          </p>
          <Button
            className="min-h-12 w-full text-base sm:w-auto sm:min-w-[12rem]"
            disabled={loading}
            onClick={() => (canQuery ? onSubmit() : onNeedSettings())}
          >
            {loading ? 'Finding…' : canQuery ? 'Find stat' : 'Open Settings'}
          </Button>
        </div>

        {!canQuery ? (
          <p className="text-sm text-amber-900">
            API key missing — Settings is required before the first lookup.
          </p>
        ) : null}

        {error ? (
          <Card className="border border-red-200 bg-red-50/70 p-3 text-sm text-red-900">
            {error}
          </Card>
        ) : null}
      </Card>

      <FilterPanel filters={filters} onChange={onFiltersChange} />

      {/* Future: connector chips (Census ACS, BEA, BLS…) mount next to filters here. */}
    </div>
  )
}
