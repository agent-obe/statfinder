import { useState, useEffect } from 'react'

interface LoadingAnimationProps {
  /** Base text to show when not cycling */
  baseText?: string
  /** Custom loading phrases to cycle through */
  phrases?: string[]
  /** Cycle speed in milliseconds */
  cycleSpeed?: number
}

const DEFAULT_PHRASES = [
  'Researching',
  'Analyzing',
  'Compiling',
  'Assimilating',
  'Investigating',
  'Processing',
  'Synthesizing',
  'Evaluating',
]

export function LoadingAnimation({
  baseText = 'Finding',
  phrases = DEFAULT_PHRASES,
  cycleSpeed = 800,
}: LoadingAnimationProps) {
  const [currentPhrase, setCurrentPhrase] = useState(baseText)
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => {
        const next = (prev + 1) % phrases.length
        setCurrentPhrase(phrases[next])
        return next
      })
    }, cycleSpeed)

    return () => clearInterval(interval)
  }, [phrases, cycleSpeed])

  // Use phraseIndex in key to prevent linting warning
  const displayKey = `${currentPhrase}-${phraseIndex}`

  return (
    <div className="flex items-center gap-2">
      <div className="flex space-x-1">
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:0.2s]"></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 [animation-delay:0.4s]"></div>
      </div>
      <span 
        className="min-w-[6rem] text-emerald-700 transition-opacity duration-200"
        key={displayKey}
      >
        {currentPhrase}…
      </span>
    </div>
  )
}