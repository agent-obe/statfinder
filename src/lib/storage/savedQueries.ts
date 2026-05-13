import type { Confidence, LlmVendor, StatResult } from '../../types/stat'
import { SAVED_QUERIES_KEY } from './keys'

export interface SavedQueryEntry {
  id: string
  query: string
  resultSummary: string
  createdAt: string
  provider: LlmVendor
  source: string
  confidence: Confidence
}

function uid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `sf-${Math.random().toString(36).slice(2)}`
}

const MAX_ENTRIES = 50

export function readSavedQueries(): SavedQueryEntry[] {
  try {
    const raw = localStorage.getItem(SAVED_QUERIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedQueryEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function prependSaved(entry: Omit<SavedQueryEntry, 'id'>): SavedQueryEntry {
  const list = readSavedQueries()
  const next: SavedQueryEntry = { ...entry, id: uid() }
  const trimmed = [next, ...list].slice(0, MAX_ENTRIES)
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(trimmed))
  return next
}

export function deleteSaved(id: string): void {
  const list = readSavedQueries().filter((q) => q.id !== id)
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(list))
}

export function buildSummary(result: StatResult): string {
  const lead = result.answer.replace(/\s+/g, ' ').trim().slice(0, 220)
  return lead.endsWith('.') ? lead : `${lead}${lead.length >= 220 ? '…' : ''}`
}
