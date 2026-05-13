import type { StatQueryInput, StatResult } from '../../types/stat'
import { finalizeStatResult, parseRawStatJson } from './jsonParse'
import type { LLMProvider } from './types'
import { buildUserPayload, MODEL_SYSTEM_PROMPT, rawToStatResult } from './prompt'
import type { ModelOption } from './openaiProvider'

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

/**
 * Anthropic doesn't provide a public models API endpoint, so we validate the API key
 * and return a curated list of current models. This is more reliable than hardcoded
 * outdated lists and handles API key validation.
 */
export async function fetchAnthropicModels(apiKey: string): Promise<ModelOption[]> {
  // First, validate the API key by making a minimal test request
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }],
      }),
    })
    
    if (!res.ok) {
      const status = res.status
      if (status === 401) {
        throw new Error('Invalid API key')
      } else if (status === 403) {
        throw new Error('API key does not have permission to access Anthropic API')
      } else {
        throw new Error(`API validation failed: ${status}`)
      }
    }
    
    // API key is valid, return current model list (as of 2026)
    return [
      { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet (Latest)' },
      { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku (Fast)' },
      { value: 'claude-3-opus-latest', label: 'Claude 3 Opus (Most Capable)' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet (Feb 2024)' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Mar 2024)' },
    ]
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to validate Anthropic API key', { cause: error })
  }
}
