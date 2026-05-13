import type { StatFilters, StatResult } from '../../types/stat'

/** Offline / demo payload — mirrors live Zod output for UI walkthroughs. */

export const MOCK_STAT_RESULT: StatResult = {
  parsedFilters: {
    country: 'United States',
    year: '2022',
    education: 'bachelor\'s degree or higher',
    denominator: 'adults 25+',
  },
  answer:
    'Approximately 37.9% of U.S. adults ages 25+ held a bachelor\'s degree or higher in 2022 (ACS 1-year estimates, illustrative figure for demo).',
  headlineStat: '37.9%',
  headlineLabel: 'adults with bachelor\'s degree or higher',
  headlineQualifier: 'U.S. adults 25+, 2022',
  confidence: 'low',
  resultType: 'point_estimate',
  source: 'U.S. Census Bureau — American Community Survey (ACS) 1-year estimates (public documentation context)',
  sourceUrl: 'https://www.census.gov/programs-surveys/acs',
  sourceType: 'federal_survey_publication',
  method:
    'Educational attainment table (percent of population 25+ with bachelor\'s or higher), national level, published survey cycle.',
  caveats: [
    'Mock/demo path — not refreshed from a live API in v1.',
    'Exact point estimate can vary by table ID, weighting, and survey year release; confirm in official tables before citing.',
  ],
  unsupportedFilters: ['state', 'city', 'race', 'income band — not applied in this demo card'],
  argumentReadyCopy:
    'ACS-style national estimate for bachelor\'s-or-higher among adults 25+ is commonly reported around the high‑30% range for recent years, but readers should cite the precise Census Bureau table/version they pull from official sources.',
  sourceHierarchy: [
    {
      label: 'Federal survey (ACS)',
      tier: 'official_estimate',
      notes: 'Primary U.S. demographic/education attainment source at national/subnational detail.',
    },
    {
      label: 'Secondary summaries',
      tier: 'replicated_secondary',
      notes: 'Newsroom or agency briefs that republish the same estimate.',
    },
  ],
  whySourcePicked:
    'Hierarchy favors official federal survey publications over tertiary commentary for population education statistics.',
  whatStrongerAnswerNeeds:
    'Direct pull from the exact ACS table (geography, year, row/column), plus connector-backed URL verification in a future release.',
  sourceVerified: true,
}

export const EMPTY_FILTERS: StatFilters = {
  country: '',
  state: '',
  city: '',
  age: '',
  sex: '',
  race: '',
  income: '',
  education: '',
  year: '',
  denominator: '',
}

export const EXAMPLE_QUERY =
  'What share of U.S. adults had a bachelor\'s degree or higher in 2022 per ACS-style national estimates?'