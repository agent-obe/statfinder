import type { StatResult } from '../types/stat'

interface HeadlineStatDisplayProps {
  result: StatResult
}

export function HeadlineStatDisplay({ result }: HeadlineStatDisplayProps) {
  const { heroAnswer, headlineStat, headlineLabel, headlineQualifier } = result

  // Prioritize heroAnswer (new field), then headlineStat (deprecated), then extract from answer
  const displayAnswer = heroAnswer || headlineStat || extractStatFromAnswer(result.answer)
  
  if (!displayAnswer) {
    // Fallback to regular answer display if we can't extract anything meaningful
    return (
      <div className="text-center">
        <p className="text-lg text-stone-900 leading-relaxed">{result.answer}</p>
      </div>
    )
  }

  // Determine if this looks like a number vs text for styling
  const isNumeric = /^[\d$,%.\s\-+]+[%$]?$/i.test(displayAnswer.trim())
  const textSizeClass = isNumeric 
    ? "text-6xl sm:text-7xl lg:text-8xl" 
    : displayAnswer.length > 20 
      ? "text-3xl sm:text-4xl lg:text-5xl" 
      : "text-4xl sm:text-5xl lg:text-6xl"

  return (
    <div className="text-center space-y-3">
      {/* Main answer - the hero (numeric or textual) */}
      <div className={`${textSizeClass} font-bold text-emerald-900 tracking-tight leading-tight`}>
        {displayAnswer}
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
      
      {/* Full answer as supporting context if different from hero answer */}
      {(heroAnswer || headlineStat || headlineLabel) && (
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
 * Extract meaningful answers from text - both numeric and textual
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
  
  // For textual answers, try to extract key phrases
  // Look for quoted text first
  const quotedMatch = answer.match(/"([^"]+)"/);
  if (quotedMatch) return quotedMatch[1];
  
  // Look for capitalized words that might be proper nouns/names
  const capitalizedMatch = answer.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/);
  if (capitalizedMatch && capitalizedMatch[1].length < 30) {
    return capitalizedMatch[1];
  }
  
  return null;
}