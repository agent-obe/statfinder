import type { StatQueryInput, StatResult } from '../../types/stat'
import type { RawStatResult } from '../schemas/statResult'

/** Shared system line for adapters (OpenAI/Anthropic). Keep constraints here for one place edits. */

export const MODEL_SYSTEM_PROMPT =
  'You are StatFinder: a meticulous public-statistics research assistant without live browsing or privileged database access. Return exactly one JSON object with camelCase keys — no preamble, ideally no Markdown fences.'

export function buildUserPayload(input: StatQueryInput): string {
  return JSON.stringify({
    disclaimer:
      'You do not have live database/API access — answer from reputable public knowledge within training limits.',
    userQuery: input.query,
    filters: input.filters,
    outputContract: {
      format: 'json',
      camelCaseKeys: true,
      shape: {
        parsedFilters: 'Record<string,string> — echo only filters you relied on.',
        answer: 'Short direct answer grounded in plausible public stats context.',
        headlineStat:
          'The core number to highlight visually (e.g., "37%", "$54,200", "3.2 million") — extract from answer.',
        headlineLabel:
          'Brief label for the statistic (e.g., "unemployment rate", "median household income") — omit if obvious from context.',
        headlineQualifier:
          'Important context/qualifier (e.g., "as of 2023", "among college graduates", "nationwide") — omit if unnecessary.',
        confidence: 'high | medium | low — must be conservative if unsure.',
        resultType:
          'e.g., point_estimate, range, directional, unavailable_in_training_window',
        source: 'Citation label only (agency, survey, publication, year).',
        sourceUrl:
          'https URL to an official statistic page/table if confidently known and stable; omit or empty otherwise.',
        sourceType:
          'e.g., federal_microdata_summary, publisher_table, aggregated_report',
        method: 'How derived (survey definition, numerator/denominator, etc.).',
        caveats: 'string[]',
        unsupportedFilters:
          'string[] — filters you could not apply with available granularity.',
        argumentReadyCopy:
          'One tight paragraph citing source type + caveat suitable for quoting.',
        sourceTransparency: {
          hierarchy:
            '[{label,tier,notes}] tiers like official_estimate > replicated_secondary > tertiary_discussion.',
          whySourcePicked: 'Brief rationale among hierarchy.',
          whatStrongerAnswerNeeds:
            'Data/method needed for higher confidence & precision.',
        },
      },
      rules: [
        'Never claim private database/live browsing access.',
        'If geography/demographics not disaggregatable, say so in unsupportedFilters.',
        'Prefer official sources in source label; omit sourceUrl unless very confident URL is canonical.',
      ],
    },
  })
}

export function rawToStatResult(raw: RawStatResult): StatResult {
  const t = raw.sourceTransparency
  return {
    parsedFilters: raw.parsedFilters ?? {},
    answer: raw.answer,
    headlineStat: raw.headlineStat?.trim() || undefined,
    headlineLabel: raw.headlineLabel?.trim() || undefined,
    headlineQualifier: raw.headlineQualifier?.trim() || undefined,
    confidence: raw.confidence,
    resultType: raw.resultType,
    source: raw.source,
    sourceUrl: raw.sourceUrl?.trim() || undefined,
    sourceType: raw.sourceType,
    method: raw.method,
    caveats: raw.caveats,
    unsupportedFilters: raw.unsupportedFilters,
    argumentReadyCopy: raw.argumentReadyCopy,
    sourceHierarchy: t?.hierarchy ?? [],
    whySourcePicked: t?.whySourcePicked ?? '',
    whatStrongerAnswerNeeds: t?.whatStrongerAnswerNeeds ?? '',
    sourceVerified: false,
  }
}
