import { useCallback, useRef } from 'react'
import { animate, stagger } from 'animejs'

// ============================================================================
// Types
// ============================================================================

interface TranscriptTyperProps {
  /** The transcript text to display */
  transcript: string
  /** Speed in ms per word (default: 80) */
  speed?: number
  /** Estimated duration in seconds — overrides speed if provided */
  estimatedDuration?: number
  /** Called when each word is revealed */
  onWordRevealed?: (wordIndex: number) => void
  /** Called when the entire transcript is complete */
  onComplete?: () => void
  /** Additional pause in ms for paragraph breaks (default: 500) */
  paragraphPause?: number
}

// ============================================================================
// Component
// ============================================================================

export function TranscriptTyper({
  transcript,
  speed: speedProp = 80,
  estimatedDuration,
  onWordRevealed,
  onComplete,
  paragraphPause = 500,
}: TranscriptTyperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<ReturnType<typeof animate> | null>(null)
  const hasCompletedRef = useRef(false)
  const previousWordRef = useRef(-1)

  // Parse transcript into words with paragraph tracking
  const segments = transcript.split('\n\n').map((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    return words
  })

  // Count total words to derive speed from estimatedDuration
  const totalWordCount = segments.reduce((sum, words) => sum + words.length, 0)
  const speed = estimatedDuration && totalWordCount > 0
    ? (estimatedDuration * 1000) / totalWordCount
    : speedProp

  // Calculate cumulative delays for each word
  let wordIndex = 0
  const wordDelays: number[] = []

  segments.forEach((words, segmentIndex) => {
    words.forEach((_, i) => {
      let delay = wordIndex * speed
      if (segmentIndex > 0 && i === 0) {
        delay += segmentIndex * paragraphPause
      }
      wordDelays.push(delay)
      wordIndex++
    })
  })

  const totalWords = wordDelays.length

  const handleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) {
        animationRef.current?.pause()
        animationRef.current = null
        hasCompletedRef.current = false
        previousWordRef.current = -1
        return
      }

      containerRef.current = node

      // Get all word elements
      const wordElements = node.querySelectorAll('.word')
      if (wordElements.length === 0) return

      // Pre-compute a random duration per word for natural variance
      // Some words snap in fast (80ms), others ease in slower (220ms)
      const durations: number[] = []
      for (let j = 0; j < wordElements.length; j++) {
        durations.push(80 + Math.random() * 140)
      }

      const anim = animate(wordElements, {
        opacity: [0, 1],
        translateY: [4, 0],
        delay: stagger(speed),
        duration: (_el: unknown, i: number) => durations[i],
        ease: 'outQuad',
        onUpdate: (self) => {
          // Calculate which word is currently being revealed
          const progress = self.progress / 100
          const currentWord = Math.min(Math.floor(progress * totalWords), totalWords - 1)

          // Fire callback only when a new word is revealed
          if (onWordRevealed && currentWord !== previousWordRef.current && currentWord >= 0) {
            previousWordRef.current = currentWord
            onWordRevealed(currentWord)
          }
        },
        onComplete: () => {
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true
            onComplete?.()
          }
        },
      })

      animationRef.current = anim

      // React 19 cleanup function
      return () => {
        anim.pause()
        animationRef.current = null
      }
    },
    [speed, onWordRevealed, onComplete, totalWords]
  )

  // Reset completion flag when transcript changes
  hasCompletedRef.current = false
  previousWordRef.current = -1

  return (
    <div
      ref={handleRef}
      className="prose prose-lg max-w-none text-foreground"
    >
      {segments.map((words, segmentIndex) => (
        <p key={segmentIndex} className="mb-4 leading-relaxed">
          {words.map((word, wordIdx) => {
            return (
              <span
                key={`${segmentIndex}-${wordIdx}`}
                className="word inline-block opacity-0"
                style={{ marginRight: '0.25em' }}
              >
                {word}
              </span>
            )
          })}
        </p>
      ))}
    </div>
  )
}
