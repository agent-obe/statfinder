import type { LlmVendor } from '../../types/stat'
import {
  API_KEY_LOCAL,
  API_KEY_SESSION,
  SETTINGS_KEY,
} from './keys'

/** Default models remain editable by the user in Settings. */
export const DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini'
export const DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-latest'

export type KeyPersistence = 'local' | 'session'

export interface PersistedSettings {
  vendor: LlmVendor
  model: string
  keyPersistence: KeyPersistence
  /** True once the user completes first-time Settings save. */
  onboardingComplete: boolean
}

export const defaultSettings = (): PersistedSettings => ({
  vendor: 'openai',
  model: DEFAULT_OPENAI_MODEL,
  keyPersistence: 'local',
  onboardingComplete: false,
})

export function readSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return defaultSettings()
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>
    return {
      ...defaultSettings(),
      ...parsed,
      vendor: parsed.vendor === 'anthropic' ? 'anthropic' : 'openai',
      onboardingComplete: Boolean(parsed.onboardingComplete),
      model:
        typeof parsed.model === 'string' && parsed.model.trim().length > 0
          ? parsed.model.trim()
          : parsed.vendor === 'anthropic'
            ? DEFAULT_ANTHROPIC_MODEL
            : DEFAULT_OPENAI_MODEL,
      keyPersistence:
        parsed.keyPersistence === 'session' ? 'session' : 'local',
    }
  } catch {
    return defaultSettings()
  }
}

export function writeSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    /* quota / privacy mode */
  }
}

export function persistApiKey(
  persistence: KeyPersistence,
  apiKey: string,
): void {
  const trimmed = apiKey.trim()
  if (persistence === 'session') {
    sessionStorage.setItem(API_KEY_SESSION, trimmed)
    localStorage.removeItem(API_KEY_LOCAL)
  } else {
    localStorage.setItem(API_KEY_LOCAL, trimmed)
    sessionStorage.removeItem(API_KEY_SESSION)
  }
}

export function readMaskedKeyHint(): { hasKey: boolean; suffix: string } {
  const k = loadApiKey()
  if (!k) return { hasKey: false, suffix: '' }
  const suffix = k.length <= 4 ? '••••' : k.slice(-4)
  return { hasKey: true, suffix }
}

export function loadApiKey(): string | null {
  try {
    const fromLocal = localStorage.getItem(API_KEY_LOCAL)
    if (fromLocal && fromLocal.trim().length > 0) return fromLocal.trim()
    const fromSession = sessionStorage.getItem(API_KEY_SESSION)
    if (fromSession && fromSession.trim().length > 0) return fromSession.trim()
  } catch {
    /* quota / privacy mode — treat as missing */
  }
  return null
}

export function clearApiKeysEverywhere(): void {
  localStorage.removeItem(API_KEY_LOCAL)
  sessionStorage.removeItem(API_KEY_SESSION)
}
