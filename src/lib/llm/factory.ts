import type { LlmVendor } from '../../types/stat'
import { AnthropicProvider } from './anthropicProvider'
import { OpenAIProvider } from './openaiProvider'
import type { LLMProvider } from './types'

export function createLlmProvider(
  vendor: LlmVendor,
  apiKey: string,
  model: string,
): LLMProvider {
  const key = apiKey.trim()
  if (vendor === 'anthropic') {
    return new AnthropicProvider(key, model.trim())
  }
  return new OpenAIProvider(key, model.trim())
}
