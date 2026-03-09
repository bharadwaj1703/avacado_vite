import { useCallback, useRef } from 'react'
import { createTimeline } from 'animejs'
import { MascotBlob } from '@/components/mascot/MascotBlob'
import { FireworksBackground } from '@/components/animate-ui/components/backgrounds/fireworks'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import type { AssessmentResult } from '@/types/content'

// ============================================================================
// Types
// ============================================================================

interface LessonCompleteProps {
  assessmentResult: AssessmentResult | null
  passed: boolean
  allowRetry: boolean
  nextLevelTitle?: string
  onRetry: () => void
  onFinish: () => void
}

// ============================================================================
// Component
// ============================================================================

export function LessonComplete({
  assessmentResult,
  passed,
  allowRetry,
  nextLevelTitle,
  onRetry,
  onFinish,
}: LessonCompleteProps) {
  const hasAnimatedRef = useRef(false)

  const scorePercent = assessmentResult
    ? Math.round(assessmentResult.score * 100)
    : 100
  const isGreatScore = scorePercent > 50
  const correct = assessmentResult?.breakdown.correct ?? 0
  const total = assessmentResult
    ? assessmentResult.breakdown.correct + assessmentResult.breakdown.incorrect + assessmentResult.breakdown.partial
    : 0

  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || hasAnimatedRef.current) return
      hasAnimatedRef.current = true

      const tl = createTimeline({
        defaults: { ease: 'outExpo' },
      })

      // 1. Score number
      const scoreNumEl = node.querySelector('.celebrate-score-num')
      if (scoreNumEl) {
        tl.add(scoreNumEl, {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 400,
        }, 300)
      }

      // 3. Score label
      const scoreLabelEl = node.querySelector('.celebrate-score-label')
      if (scoreLabelEl) {
        tl.add(scoreLabelEl, {
          opacity: [0, 1],
          duration: 300,
        }, 500)
      }

      // 4. Score bar fills
      const scoreBar = node.querySelector('.score-bar-fill')
      if (scoreBar) {
        tl.add(scoreBar, {
          width: [`0%`, `${scorePercent}%`],
          duration: 700,
          ease: 'outQuad',
        }, 600)
      }

      // 5. Mascot rises from bottom
      const mascotEl = node.querySelector('.celebrate-mascot')
      if (mascotEl) {
        tl.add(mascotEl, {
          translateY: [120, 0],
          scale: [0.6, 1],
          opacity: [0, 1],
          duration: 800,
          ease: 'outBack',
        }, 700)
      }

      // 6. Message
      const messageEl = node.querySelector('.celebrate-message')
      if (messageEl) {
        tl.add(messageEl, {
          translateY: [15, 0],
          opacity: [0, 1],
          duration: 400,
        }, 1100)
      }

      // 7. CTA slides up
      const ctaEl = node.querySelector('.celebrate-cta')
      if (ctaEl) {
        tl.add(ctaEl, {
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 500,
        }, 1300)
      }

    },
    [scorePercent]
  )

  return (
    <div ref={containerRef} className="relative flex h-full flex-col overflow-hidden">
      {/* Celebratory fireworks background */}
      <FireworksBackground
        className="pointer-events-none absolute inset-0"
        color={['#E8B931', '#E84393', '#6C5CE7', '#0984E3']}
        population={3}
        fireworkSpeed={{ min: 6, max: 12 }}
        fireworkSize={{ min: 3, max: 6 }}
        particleSpeed={{ min: 4, max: 10 }}
        particleSize={{ min: 2, max: 7 }}
      />

      {/* Content — score first, then mascot bottom-aligned */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Score section — top area */}
        {assessmentResult && (
          <div className="flex flex-col items-center gap-2 px-6 pt-10">
            {/* Row 1: X/N */}
            <div
              className="celebrate-score-num text-5xl font-medium tracking-tight text-foreground"
              style={{ opacity: 0 }}
            >
              {correct}<span className="text-2xl text-muted-foreground">/{total}</span>
            </div>

            {/* Row 2: Your Score */}
            <p
              className="celebrate-score-label text-sm text-muted-foreground"
              style={{ opacity: 0 }}
            >
              Your Score
            </p>

            {/* Row 3: tiny progress bar */}
            <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-muted">
              <div
                className={`score-bar-fill h-full rounded-full ${
                  scorePercent > 70 ? 'bg-primary' : scorePercent > 50 ? 'bg-yellow-400' : 'bg-orange-400'
                }`}
                style={{ width: '0%' }}
              />
            </div>
          </div>
        )}

        {/* Mascot — big, bottom-aligned, fills remaining space */}
        <div className="flex flex-1 flex-col items-center justify-end">
          {/* Speech bubble above mascot */}
          <div
            className="celebrate-message mb-2"
            style={{ opacity: 0 }}
          >
            <div className="relative rounded-2xl border-2 border-border bg-card px-5 py-3 shadow-level-1">
              <h2 className="text-center text-lg font-medium text-card-foreground">
                {isGreatScore ? 'You did amazing!' : 'Lesson Complete!'}
              </h2>
              {/* Speech bubble tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <div className="size-3 rotate-45 border-b-2 border-r-2 border-border bg-card" />
              </div>
            </div>
          </div>

          <div
            className="celebrate-mascot w-[22rem] max-w-[90vw] md:w-[28rem]"
            style={{ opacity: 0 }}
          >
            <div className="aspect-[500/520]">
              <MascotBlob
                bodyMode="static"
                staticBaseScale={2.4}
                staticBaseOffsetX={-40}
                staticInnerScale={1.2}
                faceScale={1.8}
                faceOffsetX={-20}
                faceOffsetY={-25}
                eyeVariant={isGreatScore ? 'excited' : 'regular'}
                mouthVariant={isGreatScore ? 'grin' : 'smile'}
              />
            </div>
          </div>
        </div>

        {/* Retry if failed */}
        {!passed && allowRetry && (
          <div className="flex justify-center pb-4">
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="mr-2 size-4" />
              Retake Quiz
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div
        className="celebrate-cta relative z-10 px-4 pb-8 pt-2"
        style={{ opacity: 0 }}
      >
        <Button
          className="w-full bg-black text-white hover:bg-black/90"
          size="lg"
          onClick={onFinish}
        >
          {nextLevelTitle ? nextLevelTitle : 'Continue Learning'}
        </Button>
      </div>
    </div>
  )
}
