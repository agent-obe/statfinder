import { useMemo, useState } from 'react'
import { HeaderNav, type NavKey } from './components/HeaderNav'
import { QueryPage } from './pages/QueryPage'
import { ResultsPage } from './pages/ResultsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SavedQueriesPage } from './pages/SavedQueriesPage'
import {
  EMPTY_FILTERS,
  EXAMPLE_QUERY,
  MOCK_STAT_RESULT,
} from './lib/mockData/sampleStatResult'
import type { StatFilters, StatResult } from './types/stat'
import { loadApiKey, readSettings } from './lib/storage/settings'
import { buildSummary, prependSaved, readSavedQueries } from './lib/storage/savedQueries'
import { createLlmProvider } from './lib/llm/factory'

type ActiveView = 'query' | 'results' | 'saved' | 'settings'

function initialView(settingsGate: boolean): ActiveView {
  return settingsGate ? 'query' : 'settings'
}

function gateFromStorage(): boolean {
  const settings = readSettings()
  const hasKey = Boolean(loadApiKey())
  return settings.onboardingComplete && hasKey
}

export default function App() {
  const [settingsEpoch, setSettingsEpoch] = useState(0)
  const [savedEpoch, setSavedEpoch] = useState(0)
  const settings = useMemo(() => {
    void settingsEpoch
    return readSettings()
  }, [settingsEpoch])

  const gate = settings.onboardingComplete && Boolean(loadApiKey())

  const [view, setView] = useState<ActiveView>(() => initialView(gate))

  const [queryText, setQueryText] = useState('')
  const [filters, setFilters] = useState<StatFilters>(EMPTY_FILTERS)
  const [latest, setLatest] = useState<{ query: string; result: StatResult } | null>(
    null,
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const savedQueries = useMemo(() => {
    void savedEpoch
    return readSavedQueries()
  }, [savedEpoch])

  function reloadSettingsSnapshot() {
    setSettingsEpoch((x) => x + 1)
    if (!gateFromStorage()) setView('settings')
  }

  function reloadSaved() {
    setSavedEpoch((x) => x + 1)
  }

  async function handleFindStat() {
    setError(null)
    const trimmed = queryText.trim()
    if (!trimmed) {
      setError('Enter a question first.')
      return
    }

    const key = loadApiKey()
    if (!key) {
      setView('settings')
      setError(null)
      return
    }

    setLoading(true)
    try {
      const provider = createLlmProvider(settings.vendor, key, settings.model)
      const result = await provider.generateStatAnswer({
        query: trimmed,
        filters,
      })
      const payload = {
        query: trimmed,
        result,
      }
      setLatest(payload)
      setView('results')
      prependSaved({
        query: trimmed,
        resultSummary: buildSummary(result),
        createdAt: new Date().toISOString(),
        provider: settings.vendor,
        source: result.source,
        confidence: result.confidence,
      })
      reloadSaved()
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Unknown error during provider call.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  function handleDemo() {
    setError(null)
    setLatest({
      query: queryText.trim() || EXAMPLE_QUERY,
      result: MOCK_STAT_RESULT,
    })
    setView('results')
  }

  function nav(): NavKey {
    if (!gate && view === 'settings') return 'settings'
    if (view === 'settings') return 'settings'
    if (view === 'saved') return 'saved'
    if (view === 'results') return 'results'
    return 'query'
  }

  function handleNavigate(destination: NavKey) {
    setView(destination)
  }

  return (
    <div className="min-h-dvh bg-[var(--color-cream)] text-[color:var(--color-charcoal)]">
      <HeaderNav
        active={nav()}
        settingsAttention={!gate}
        onNavigate={(k) => handleNavigate(k)}
      />

      <main>
        {!gate ? (
          <div className="mx-auto max-w-3xl px-4 pb-2 pt-3 sm:px-6">
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-950">
              Finish Settings first — provider selection, editable model slug, API key capture, and masking policy activate before networked lookups.
            </div>
          </div>
        ) : null}

        {view === 'query' ? (
          <QueryPage
            queryText={queryText}
            onQueryChange={(q) => setQueryText(q)}
            filters={filters}
            onFiltersChange={(f) => setFilters(f)}
            onSubmit={() => void handleFindStat()}
            onLoadDemo={() => handleDemo()}
            loading={loading}
            error={error}
            canQuery={gate}
            onNeedSettings={() => setView('settings')}
          />
        ) : null}

        {view === 'settings' ? (
          <SettingsPage
            key={settingsEpoch}
            settings={settings}
            onSaved={() => {
              reloadSettingsSnapshot()
              if (gateFromStorage()) setView('query')
            }}
          />
        ) : null}

        {view === 'saved' ? (
          <SavedQueriesPage items={savedQueries} onRefresh={() => reloadSaved()} />
        ) : null}

        {view === 'results' ? (
          latest ? (
            <ResultsPage
              query={latest.query}
              result={latest.result}
              onBackToQuery={() => setView('query')}
              onClear={() => setLatest(null)}
            />
          ) : (
            <div className="mx-auto max-w-3xl space-y-3 px-4 py-16 text-center">
              <h1 className="text-xl font-semibold text-stone-900">No saved result yet</h1>
              <p className="text-sm text-stone-600">
                Run a lookup from Query or load the offline sample preview.
              </p>
            </div>
          )
        ) : null}
      </main>
    </div>
  )
}
