import type { Confidence, StatResult } from '../types/stat'
import { Card } from '../components/Card'
import { CopyButton } from '../components/CopyButton'
import { SourceTransparencyPanel } from '../components/SourceTransparencyPanel'
import { Button } from '../components/Button'
import { HeadlineStatDisplay } from '../components/HeadlineStatDisplay'

function confidenceTone(c: Confidence): string {
  if (c === 'high') return 'bg-emerald-50 text-emerald-950 ring-emerald-200'
  if (c === 'medium') return 'bg-amber-50 text-amber-950 ring-amber-200'
  return 'bg-rose-50 text-rose-950 ring-rose-200'
}

interface ResultsPageProps {
  query: string
  result: StatResult
  /** Back to tweak query without wiping result until replaced. */
  onBackToQuery: () => void
  onClear: () => void
}

export function ResultsPage({
  query,
  result,
  onBackToQuery,
  onClear,
}: ResultsPageProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:space-y-6 sm:px-6 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
            Your statistic
          </h1>
          <p className="mt-2 max-w-prose text-sm text-stone-600">
            StatFinder result with full transparency details and source verification.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => onBackToQuery()}>
            Edit query
          </Button>
          <CopyButton text={result.argumentReadyCopy} label="Copy argument-ready" />
        </div>
      </div>

      {/* Hero statistic display */}
      <Card className="border-stone-200/90 py-8 sm:py-12">
        <HeadlineStatDisplay result={result} />
      </Card>

      <Card className="space-y-4 border-stone-200/90">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Query
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-900 sm:text-base">
            {query}
          </p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Parsed filters
            </h2>
            {Object.keys(result.parsedFilters).length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">None echoed by model.</p>
            ) : (
              <dl className="mt-2 space-y-1 text-sm text-stone-800">
                {Object.entries(result.parsedFilters).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <dt className="font-medium text-stone-600">{k}</dt>
                    <dd className="text-stone-900">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Confidence / type / method
            </h2>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${confidenceTone(result.confidence)}`}
              >
                {result.confidence}
              </span>
              <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-900 ring-1 ring-stone-200 ring-inset">
                {result.resultType}
              </span>
              <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-900 ring-1 ring-stone-200 ring-inset">
                {result.sourceType}
              </span>
            </div>
            <p className="text-sm text-stone-700">{result.method}</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Source
            </h2>
            <p className="mt-2 text-sm text-stone-800">{result.source}</p>
            {result.sourceUrl ? (
              <a
                className="mt-2 inline-block break-all text-sm font-medium text-[var(--color-green-ink)] underline decoration-emerald-900/25 underline-offset-2"
                href={result.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                {result.sourceUrl}
              </a>
            ) : (
              <p className="mt-2 text-sm text-stone-600">No URL provided.</p>
            )}
            {!result.sourceVerified ? (
              <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950">
                Source not verified in v1
              </p>
            ) : null}
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Caveats
            </h2>
            {result.caveats.length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">None listed.</p>
            ) : (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-800">
                {result.caveats.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Argument-ready copy
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-900">
            {result.argumentReadyCopy}
          </p>
          <div className="mt-3">
            <CopyButton text={result.argumentReadyCopy} />
          </div>
        </section>
      </Card>

      <SourceTransparencyPanel result={result} />

      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => onClear()}>
          Clear latest result
        </Button>
      </div>

      {/* Connector seam — replace model path with fetched official rows + citations. */}
    </div>
  )
}
