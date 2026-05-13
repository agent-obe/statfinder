import type { StatQueryInput, StatResult } from '../../types/stat'
import { finalizeStatResult, parseRawStatJson } from './jsonParse'
import type { LLMProvider } from './types'
import { buildUserPayload, MODEL_SYSTEM_PROMPT, rawToStatResult } from './prompt'

/** Anthropic Messages adapter — browser flow requires explicit opt-in header. */

export class AnthropicProvider implements LLMProvider {
  private readonly apiKey: string
  private readonly model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 64,
          system: MODEL_SYSTEM_PROMPT,
          messages: [{ role: 'user', content: 'Reply with literally: OK' }],
        }),
      })
      if (!res.ok) return false
      const body = (await res.json()) as unknown
      return (
        typeof body === 'object' &&
        body !== null &&
        'content' in body &&
        Array.isArray((body as { content?: unknown }).content)
      )
    } catch {
      return false
    }
  }

  async generateStatAnswer(input: StatQueryInput): Promise<StatResult> {
    const user = buildUserPayload(input)
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        temperature: 0.2,
        system: MODEL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: user }],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(
        `Anthropic request failed (${res.status}). ${errText.slice(0, 280)}`,
      )
    }
    const body = (await res.json()) as {
      content?: { type?: string; text?: string }[]
    }
    const texts = body.content
      ?.filter((c) => c?.type === 'text' && typeof c.text === 'string')
      .map((c) => c.text as string)
    const rawText = texts?.join('\n')
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Anthropic response missing text content.')
    }
    const raw = parseRawStatJson(rawText)
    const base = rawToStatResult(raw)
    return finalizeStatResult(base)
  }
}
