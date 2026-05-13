import type { SavedQueryEntry } from '../lib/storage/savedQueries'
import { deleteSaved } from '../lib/storage/savedQueries'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

interface SavedQueriesPageProps {
  items: SavedQueryEntry[]
  onRefresh: () => void
}

export function SavedQueriesPage({ items, onRefresh }: SavedQueriesPageProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Saved queries
        </h1>
        <p className="mt-2 max-w-prose text-sm text-stone-600">
          Local-only bookmarks — clearing site storage removes entries. Useful for rerun
          context, not archival compliance.
        </p>
      </header>

      {items.length === 0 ? (
        <Card className="border-dashed border-stone-300 bg-white/70 text-center text-sm text-stone-600">
          Empty history — successful lookups auto-save summaries for quick recall.
        </Card>
      ) : (
        <ul className="space-y-3">
          {items.map((q) => (
            <li key={q.id}>
              <Card className="space-y-3 border-stone-200/90">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{q.query}</p>
                    <p className="mt-2 text-sm text-stone-700">{q.resultSummary}</p>
                  </div>
                  <Button
                    variant="ghost"
                    className="self-start text-rose-800 hover:bg-rose-50"
                    onClick={() => {
                      deleteSaved(q.id)
                      onRefresh()
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <dl className="grid grid-cols-1 gap-2 text-xs text-stone-600 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <dt className="font-semibold text-stone-500">When</dt>
                    <dd className="text-stone-800">
                      {new Date(q.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-stone-500">Provider</dt>
                    <dd className="text-stone-800">{q.provider}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-semibold text-stone-500">Source</dt>
                    <dd className="text-stone-800">{q.source}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-stone-500">Confidence</dt>
                    <dd className="text-stone-800">{q.confidence}</dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
