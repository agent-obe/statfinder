import type { StatQueryInput, StatResult } from '../../types/stat'
import { finalizeStatResult, parseRawStatJson } from './jsonParse'
import type { LLMProvider } from './types'
import { buildUserPayload, MODEL_SYSTEM_PROMPT, rawToStatResult } from './prompt'

/** OpenAI Chat Completions adapter — isolate fetch + headers here for future versioning. */

export class OpenAIProvider implements LLMProvider {
  private readonly apiKey: string
  private readonly model: string

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey
    this.model = model
  }

  async testConnection(): Promise<boolean> {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Reply with OK.' }],
          max_completion_tokens: 16,
          temperature: 0,
        }),
      })
      if (!res.ok) {
        // Better error handling for debugging
        const errText = await res.text().catch(() => '')
        console.error(`OpenAI test connection failed (${res.status}):`, errText.slice(0, 200))
        return false
      }
      const body = (await res.json()) as unknown
      // Minimal shape guard so we don't treat HTML error pages as success.
      return (
        typeof body === 'object' &&
        body !== null &&
        'choices' in body &&
        Array.isArray((body as { choices?: unknown }).choices)
      )
    } catch (error) {
      console.error('OpenAI test connection error:', error)
      return false
    }
  }

  async generateStatAnswer(input: StatQueryInput): Promise<StatResult> {
    const user = buildUserPayload(input)
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        max_completion_tokens: 4096,
        messages: [
          { role: 'system', content: MODEL_SYSTEM_PROMPT },
          { role: 'user', content: user },
        ],
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(
        `OpenAI request failed (${res.status}). ${errText.slice(0, 280)}`,
      )
    }
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const rawText = body.choices?.[0]?.message?.content
    if (!rawText || typeof rawText !== 'string') {
      throw new Error('OpenAI response missing message content.')
    }
    const raw = parseRawStatJson(rawText)
    const base = rawToStatResult(raw)
    return finalizeStatResult(base)
  }
}
