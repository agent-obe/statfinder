import { useState, useEffect, useCallback } from 'react'
import type { LlmVendor } from '../types/stat'
import {
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_OPENAI_MODEL,
  OPENAI_MODEL_OPTIONS,
  ANTHROPIC_MODEL_OPTIONS,
  type PersistedSettings,
  writeSettings,
  persistApiKey,
  loadApiKey,
  readMaskedKeyHint,
  clearApiKeysEverywhere,
} from '../lib/storage/settings'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { createLlmProvider } from '../lib/llm/factory'
import { fetchOpenAIModels, type ModelOption } from '../lib/llm/openaiProvider'
import { fetchAnthropicModels } from '../lib/llm/anthropicProvider'

interface SettingsPageProps {
  settings: PersistedSettings
  onSaved: () => void
}

export function SettingsPage({ settings, onSaved }: SettingsPageProps) {
  const [vendor, setVendor] = useState<LlmVendor>(settings.vendor)
  const [model, setModel] = useState(settings.model)
  const [persistence, setPersistence] =
    useState<PersistedSettings['keyPersistence']>(settings.keyPersistence)
  const [apiKeyDraft, setApiKeyDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [showCustomModel, setShowCustomModel] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<ModelOption[]>([])
  const [modelsFetching, setModelsFetching] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [shouldUseFetched, setShouldUseFetched] = useState(false)

  const fetchModelsForCurrentSetup = useCallback(async () => {
    const key = apiKeyDraft.trim() || loadApiKey()
    if (!key) return

    setModelsFetching(true)
    setModelsError(null)
    try {
      const models = vendor === 'openai' 
        ? await fetchOpenAIModels(key)
        : await fetchAnthropicModels(key)
      
      setFetchedModels(models)
      setShouldUseFetched(true)
      setModelsError(null)
    } catch (error) {
      setModelsError(error instanceof Error ? error.message : 'Failed to fetch models')
      setFetchedModels([])
      setShouldUseFetched(false)
    } finally {
      setModelsFetching(false)
    }
  }, [apiKeyDraft, vendor])

  // Auto-fetch models when API key changes (debounced)
  useEffect(() => {
    const key = apiKeyDraft.trim() || loadApiKey()
    if (!key) {
      // Use setTimeout to avoid synchronous state updates in effect
      const clearTimer = setTimeout(() => {
        setShouldUseFetched(false)
        setFetchedModels([])
        setModelsError(null)
      }, 0)
      return () => clearTimeout(clearTimer)
    }

    const timer = setTimeout(() => {
      fetchModelsForCurrentSetup()
    }, 1000) // Debounce API calls

    return () => clearTimeout(timer)
  }, [apiKeyDraft, fetchModelsForCurrentSetup])

  async function handleSave(runProbe: boolean) {
    setMsg(null)

    const nextModel =
      model.trim().length > 0
        ? model.trim()
        : vendor === 'anthropic'
          ? DEFAULT_ANTHROPIC_MODEL
          : DEFAULT_OPENAI_MODEL

    let key = apiKeyDraft.trim()
    if (!key) {
      key = loadApiKey() ?? ''
    }
    if (!key) {
      setMsg('API key required — paste a revocable provider key.')
      return
    }

    const persisted: PersistedSettings = {
      vendor,
      model: nextModel,
      keyPersistence: persistence,
      onboardingComplete: true,
    }

    writeSettings(persisted)
    persistApiKey(persistence, key)

    setApiKeyDraft('')
    setMsg('Saved locally — keys never echoed in logs after save.')

    if (runProbe) {
      setBusy(true)
      try {
        const provider = createLlmProvider(vendor, key, nextModel)
        const ok = await provider.testConnection()
        setMsg(
          ok
            ? 'Saved and connection probe succeeded.'
            : 'Saved, but probe failed — verify model slug and billing/CORS posture.',
        )
      } catch {
        setMsg('Saved, but probe errored — check network constraints.')
      } finally {
        setBusy(false)
      }
    }
    onSaved()
  }

  const hint = readMaskedKeyHint()
  const hasApiKey = hint.hasKey || apiKeyDraft.trim().length > 0
  
  // Get model options - prioritize fetched models if available and valid
  const fallbackOptions = vendor === 'anthropic' ? ANTHROPIC_MODEL_OPTIONS : OPENAI_MODEL_OPTIONS
  const modelOptions = shouldUseFetched && fetchedModels.length > 0 ? fetchedModels : fallbackOptions
  
  // Check if current model is in the available list
  const isModelInList = modelOptions.some(option => option.value === model)
  
  // Show custom input if model isn't in list or user explicitly chose custom
  const shouldShowCustomInput = !isModelInList || showCustomModel

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Settings — bring your own key
        </h1>
        <p className="text-sm text-stone-600 sm:text-base">
          Configure provider defaults. Keys stay in browser storage only; masked hints
          are shown after successful save — never full values.
        </p>
      </header>

      <Card className="space-y-4 border-amber-200/80 bg-amber-50/40">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-950">
          Security note
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-sm text-amber-950/90">
          <li>
            Any script on this origin can theoretically read storage — prefer revocable,
            narrowly scoped keys; rotate routinely.
          </li>
          <li>
            v1 calls vendors directly from your browser; review vendors’ stance on browser
            access (Anthropic requires an explicit dangerous-browser header clientside).
          </li>
          <li>
            Future hardened mode can proxy via GitHub-backed serverless connectors without
            changing the `LLMProvider` surface.
          </li>
        </ul>
      </Card>

      <Card className="space-y-4 border-stone-200/90">
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-stone-800">Provider</legend>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
              <input
                type="radio"
                name="vendor"
                checked={vendor === 'openai'}
                onChange={() => {
                  setVendor('openai')
                  setModel((m) =>
                    m === DEFAULT_ANTHROPIC_MODEL || m.trim().length === 0
                      ? DEFAULT_OPENAI_MODEL
                      : m,
                  )
                  setShowCustomModel(false)
                  setShouldUseFetched(false)
                  setFetchedModels([])
                  setModelsError(null)
                }}
              />
              OpenAI
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
              <input
                type="radio"
                name="vendor"
                checked={vendor === 'anthropic'}
                onChange={() => {
                  setVendor('anthropic')
                  setModel((m) =>
                    m === DEFAULT_OPENAI_MODEL || m.trim().length === 0
                      ? DEFAULT_ANTHROPIC_MODEL
                      : m,
                  )
                  setShowCustomModel(false)
                  setShouldUseFetched(false)
                  setFetchedModels([])
                  setModelsError(null)
                }}
              />
              Anthropic
            </label>
          </div>
        </fieldset>

        {hasApiKey ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-stone-800">
                Model selection
              </label>
              {modelsFetching && (
                <span className="text-xs text-stone-500">Fetching models...</span>
              )}
            </div>
            
            {modelsError ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm text-amber-950">
                  Failed to fetch models: {modelsError}
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  Using fallback model list. You can still enter custom model names.
                </p>
              </div>
            ) : null}
            
            <select
              className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 disabled:bg-stone-50 disabled:text-stone-500"
              value={shouldShowCustomInput ? 'custom' : model}
              disabled={modelsFetching}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setShowCustomModel(true)
                  return
                }
                setShowCustomModel(false)
                setModel(e.target.value)
              }}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="custom">
                {!isModelInList ? `Custom: ${model}` : 'Custom model...'}
              </option>
            </select>
            
            {shouldShowCustomInput && (
              <label className="block text-sm font-semibold text-stone-800">
                Custom model name
                <input
                  className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:border-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  spellCheck={false}
                  placeholder="Enter model name (e.g., gpt-4, claude-3-sonnet)"
                />
              </label>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-stone-800 text-stone-500">
              Model selection
            </label>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-500">
              Enter your API key first to see available models
            </div>
          </div>
        )}
        
        <p className="text-xs text-stone-500">
          {shouldUseFetched && !modelsError
            ? "Models fetched from your API key. Custom models also supported."
            : "Curated models are optimized for StatFinder. Custom models supported but may need fine-tuning."}
        </p>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-stone-800">
            Storage location
          </legend>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="persist"
              checked={persistence === 'local'}
              onChange={() => setPersistence('local')}
            />
            localStorage (persist between sessions)
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="persist"
              checked={persistence === 'session'}
              onChange={() => setPersistence('session')}
            />
            sessionStorage (clears when tab closes)
          </label>
        </fieldset>

        <label className="block text-sm font-semibold text-stone-800">
          API key
          <input
            className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm tracking-widest text-stone-900 focus:border-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-emerald-900/20"
            autoComplete="off"
            spellCheck={false}
            placeholder={
              hint.hasKey
                ? `············${hint.suffix} — paste to replace`
                : 'Paste a limited/revocable key'
            }
            value={apiKeyDraft}
            onChange={(e) => setApiKeyDraft(e.target.value)}
          />
        </label>

        {hint.hasKey && apiKeyDraft.length === 0 ? (
          <p className="text-xs text-stone-500">
            Mask reflects saved credential only — never reconstructed in UI scripts for display.
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            className="min-h-11 flex-1"
            disabled={busy}
            onClick={() => void handleSave(false)}
          >
            Save settings
          </Button>
          <Button
            className="min-h-11 flex-1"
            variant="secondary"
            disabled={busy}
            onClick={() => void handleSave(true)}
          >
            Save + test provider
          </Button>
          <Button
            className="min-h-11 flex-1"
            variant="ghost"
            onClick={() => {
              clearApiKeysEverywhere()
              setMsg('Keys cleared locally for this browser profile.')
              onSaved()
            }}
          >
            Purge stored keys
          </Button>
        </div>

        {msg ? (
          <Card className="border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-emerald-950">
            {msg}
          </Card>
        ) : null}
      </Card>
    </div>
  )
}
