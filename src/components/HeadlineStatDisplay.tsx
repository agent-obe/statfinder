import type { StatResult } from '../types/stat'

interface HeadlineStatDisplayProps {
  result: StatResult
}

export function HeadlineStatDisplay({ result }: HeadlineStatDisplayProps) {
  const { headlineStat, headlineLabel, headlineQualifier } = result

  // If no headline stat is provided, try to extract number from the answer
  const displayStat = headlineStat || extractStatFromAnswer(result.answer)
  
  if (!displayStat) {
    // Fallback to regular answer display if we can't extract a number
    return (
      <div className="text-center">
        <p className="text-lg text-stone-900 leading-relaxed">{result.answer}</p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-3">
      {/* Main statistic - the hero */}
      <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-emerald-900 tracking-tight">
        {displayStat}
      </div>
      
      {/* Label for the statistic */}
      {headlineLabel && (
        <div className="text-lg sm:text-xl text-stone-700 font-medium">
          {headlineLabel}
        </div>
      )}
      
      {/* Qualifier/context */}
      {headlineQualifier && (
        <div className="text-sm sm:text-base text-stone-600">
          {headlineQualifier}
        </div>
      )}
      
      {/* Full answer as supporting context if different from components above */}
      {(headlineStat || headlineLabel) && (
        <div className="mt-6 pt-4 border-t border-stone-200">
          <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-3xl mx-auto">
            {result.answer}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Simple regex to extract numbers/percentages from text as fallback
 */
function extractStatFromAnswer(answer: string): string | null {
  // Look for percentages first
  const percentMatch = answer.match(/(\d+(?:\.\d+)?%)/);
  if (percentMatch) return percentMatch[1];
  
  // Look for dollar amounts
  const dollarMatch = answer.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (dollarMatch) return dollarMatch[0];
  
  // Look for numbers with common suffixes
  const numberMatch = answer.match(/(\d+(?:\.\d+)?\s*(?:million|billion|thousand|M|B|K))/i);
  if (numberMatch) return numberMatch[1];
  
  // Look for standalone numbers
  const simpleNumberMatch = answer.match(/(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (simpleNumberMatch) return simpleNumberMatch[1];
  
  return null;
}