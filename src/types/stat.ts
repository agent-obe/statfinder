export type LlmVendor = 'openai' | 'anthropic'

/** Structured filters echoed to the LLM; all optional strings for v1 UX simplicity. */
export interface StatFilters {
  country: string
  state: string
  city: string
  age: string
  sex: string
  race: string
  income: string
  education: string
  year: string
  denominator: string
}

export interface StatQueryInput {
  query: string
  filters: StatFilters
}

export type Confidence = 'high' | 'medium' | 'low'

export interface SourceHierarchyEntry {
  label: string
  tier: string
  notes?: string
}

/** Normalized shape used across the UI after Zod validation + verification passes. */
export interface StatResult {
  parsedFilters: Record<string, string>
  answer: string
  /** The key number/percentage to emphasize visually */
  headlineStat?: string
  /** Label for the headline stat (e.g., "unemployment rate", "median income") */
  headlineLabel?: string
  /** Qualifier for the headline stat (e.g., "as of 2023", "among adults") */
  headlineQualifier?: string
  confidence: Confidence
  resultType: string
  /** Human-readable citation line (agency, dataset, etc.) */
  source: string
  /** Raw URL when the model provides one — may fail verification below. */
  sourceUrl?: string
  sourceType: string
  method: string
  caveats: string[]
  unsupportedFilters: string[]
  argumentReadyCopy: string
  sourceHierarchy: SourceHierarchyEntry[]
  whySourcePicked: string
  whatStrongerAnswerNeeds: string
  /** Set after URL checks; drives “Source not verified in v1” messaging + confidence downgrade. */
  sourceVerified: boolean
}
