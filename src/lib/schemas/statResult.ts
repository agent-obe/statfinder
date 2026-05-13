import { z } from 'zod'

/** Zod-validated envelope from model JSON output (camelCase keys per system prompt). */
export const RawSourceHierarchySchema = z.object({
  label: z.string(),
  tier: z.string(),
  notes: z.string().optional(),
})

export const RawStatResultSchema = z.object({
  parsedFilters: z.record(z.string()).optional(),
  answer: z.string(),
  heroAnswer: z.string().optional(),
  headlineStat: z.string().optional(),
  headlineLabel: z.string().optional(),
  headlineQualifier: z.string().optional(),
  confidence: z.enum(['high', 'medium', 'low']),
  resultType: z.string(),
  source: z.string(),
  sourceUrl: z.string().optional(),
  sourceType: z.string(),
  method: z.string(),
  caveats: z.array(z.string()).default([]),
  unsupportedFilters: z.array(z.string()).default([]),
  argumentReadyCopy: z.string(),
  sourceTransparency: z
    .object({
      hierarchy: z.array(RawSourceHierarchySchema).default([]),
      whySourcePicked: z.string().default(''),
      whatStrongerAnswerNeeds: z.string().default(''),
    })
    .optional(),
})

export type RawStatResult = z.infer<typeof RawStatResultSchema>
