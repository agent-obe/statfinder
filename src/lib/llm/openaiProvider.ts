import type { StatQueryInput, StatResult } from '../../types/stat'
import { finalizeStatResult, parseRawStatJson } from './jsonParse'
import type { LLMProvider } from './types'
import { buildUserPayload, MODEL_SYSTEM_PROMPT, rawToStatResult } from './prompt'

/** OpenAI Chat Completions adapter — isolate fetch + headers here for future versioning. */

export interface OpenAIModel {
  id: string
  object: string
  created: number
  owned_by: string
}

export interface ModelOption {
  value: string
  label: string
}

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

/**
 * Fetch available models from OpenAI API and filter for chat completion compatible ones
 */
export async function fetchOpenAIModels(apiKey: string): Promise<ModelOption[]> {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch OpenAI models: ${res.status}`)
  }
  
  const body = await res.json() as { data?: OpenAIModel[] }
  const models = body.data || []
  
  // Filter for chat completion models that are relevant for StatFinder
  const compatibleModels = models
    .filter(model => {
      const id = model.id.toLowerCase()
      // Include GPT-4, GPT-4o, o3, o1 series and newer models
      return (
        id.includes('gpt-4') ||
        id.includes('gpt-4o') ||
        id.includes('o3') ||
        id.includes('o1') ||
        (id.includes('gpt') && !id.includes('instruct') && !id.includes('base'))
      )
    })
    .sort((a, b) => {
      // Sort by preference: o3 > gpt-4.1 > gpt-4o > gpt-4 > others
      const priority = (id: string) => {
        if (id.includes('o3')) return 5
        if (id.includes('gpt-4.1')) return 4
        if (id.includes('gpt-4o')) return 3
        if (id.includes('gpt-4')) return 2
        return 1
      }
      return priority(b.id) - priority(a.id) || a.id.localeCompare(b.id)
    })
    .map(model => ({
      value: model.id,
      label: formatModelName(model.id)
    }))
  
  return compatibleModels
}

function formatModelName(modelId: string): string {
  // Create human-readable labels for common models
  const formatted = modelId
    .replace('gpt-4.1-mini', 'GPT-4.1 Mini (Fast, Affordable)')
    .replace('gpt-4.1', 'GPT-4.1 (Most Capable)')
    .replace('gpt-4o-mini', 'GPT-4o Mini (Fast)')
    .replace('gpt-4o', 'GPT-4o (Multimodal)')
    .replace('o3-mini', 'o3 Mini (Reasoning)')
    .replace('o3', 'o3 (Advanced Reasoning)')
    .replace('o1-preview', 'o1 Preview (Reasoning)')
    .replace('o1-mini', 'o1 Mini (Reasoning)')
  
  // If no specific formatting matched, create a generic label
  if (formatted === modelId) {
    return modelId.toUpperCase().replace(/-/g, ' ')
  }
  
  return formatted
}
