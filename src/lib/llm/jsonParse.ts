import { RawStatResultSchema } from '../schemas/statResult'
import type { Confidence, StatResult } from '../../types/stat'
import type { RawStatResult } from '../schemas/statResult'

export function stripCodeFences(text: string): string {
  const t = text.trim()
  const m = /^```(?:json)?\s*\r?\n?([\s\S]*?)\r?\n?```$/im.exec(t)
  if (m) return m[1].trim()
  return t
}

export function extractJsonObject(text: string): string | null {
  const s = stripCodeFences(text)
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return s.slice(start, end + 1)
}

export function parseRawStatJson(text: string): RawStatResult {
  const chunk = extractJsonObject(text)
  if (!chunk) {
    throw new Error('Model response did not contain a JSON object.')
  }
  let data: unknown
  try {
    data = JSON.parse(chunk)
  } catch {
    throw new Error('Model JSON could not be parsed.')
  }
  const parsed = RawStatResultSchema.safeParse(data)
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join('; ')
    throw new Error(`JSON failed validation: ${msg}`)
  }
  return parsed.data
}

/** Require https + plausible hostname — v1 verifier only (future: connectors). */

export function isVerifiableHttpsUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.trim()
  if (!trimmed) return false
  try {
    const u = new URL(trimmed)
    if (u.protocol !== 'https:') return false
    const host = u.hostname
    // Future connector layer: delegate to resolver + cache for official redirects.
    if (!host.includes('.')) return false
    if (host.length < 5) return false
    return true
  } catch {
    return false
  }
}

function minConfidence(a: Confidence, b: Confidence): Confidence {
  const rank: Confidence[] = ['high', 'medium', 'low']
  return rank[Math.max(rank.indexOf(a), rank.indexOf(b))]
}

/** Apply source URL policy and confidence downgrades after Zod validates structure. */

export function finalizeStatResult(base: StatResult): StatResult {
  const verified = isVerifiableHttpsUrl(base.sourceUrl)
  const caveats = [...base.caveats]

  let confidence = base.confidence
  if (!verified) {
    confidence = minConfidence(confidence, 'low')
    caveats.push(
      'Source not verified in v1 — no stable https URL validated for this citation.',
    )
  }

  return {
    ...base,
    sourceVerified: verified,
    confidence,
    caveats,
  }
}
