import type { StatResult } from '../types/stat'
import { Card } from './Card'

interface SourceTransparencyProps {
  result: StatResult
}

export function SourceTransparencyPanel({ result }: SourceTransparencyProps) {
  return (
    <Card className="space-y-5">
      <header>
        <h2 className="text-base font-semibold text-stone-900">
          Source transparency
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          How this answer was positioned in an evidence hierarchy — not a claim of
          live retrieval in v1.
        </p>
      </header>

      <section>
        <h3 className="text-sm font-semibold text-stone-800">Source hierarchy</h3>
        <ol className="mt-2 space-y-2">
          {result.sourceHierarchy.length === 0 ? (
            <li className="text-sm text-stone-500">No tiers provided by model.</li>
          ) : (
            result.sourceHierarchy.map((h, i) => (
              <li
                key={`${h.label}-${i}`}
                className="rounded-lg border border-stone-200 bg-stone-50/80 p-3"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-sm font-medium text-stone-900">
                    {h.label}
                  </span>
                  <span className="rounded bg-white px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-100">
                    {h.tier}
                  </span>
                </div>
                {h.notes ? (
                  <p className="mt-2 text-sm text-stone-600">{h.notes}</p>
                ) : null}
              </li>
            ))
          )}
        </ol>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-stone-800">Why this source</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
            {result.whySourcePicked || '—'}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-stone-800">
            Unsupported filters
          </h3>
          {result.unsupportedFilters.length === 0 ? (
            <p className="mt-2 text-sm text-stone-600">None reported.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700">
              {result.unsupportedFilters.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-stone-800">
          What a stronger answer would need
        </h3>
        <p className="mt-2 whitespace-pre-wrap text-sm text-stone-700">
          {result.whatStrongerAnswerNeeds || '—'}
        </p>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">
          Connector hook — future adapters can ingest official table IDs here after
          server-side verification.
        </p>
      </section>
    </Card>
  )
}
