import type { StatQueryInput, StatResult } from '../../types/stat'

/** Common contract for connector-style LLM adapters; future source backends can mirror this boundary. */
export interface LLMProvider {
  generateStatAnswer(input: StatQueryInput): Promise<StatResult>
  /** Lightweight probe with current key + model configuration. */
  testConnection(): Promise<boolean>
}
