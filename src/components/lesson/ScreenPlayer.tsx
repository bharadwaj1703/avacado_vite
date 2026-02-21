import { useCallback, useReducer, useRef } from 'react'
import type { Screen } from '@/types/content'
import { HeroRenderer, type HeroRendererRef } from './HeroRenderer'
import { TranscriptTyper } from './TranscriptTyper'

// ============================================================================
// Types
// ============================================================================

interface ScreenPlayerProps {
  screen: Screen
  onComplete: () => void
  onMascotCta?: () => void
}

interface ScreenPlayerState {
  transcriptComplete: boolean
  currentWordIndex: number
}

type ScreenPlayerAction =
  | { type: 'TRANSCRIPT_COMPLETE' }
  | { type: 'WORD_REVEALED'; index: number }

// ============================================================================
// Reducer
// ============================================================================

function screenPlayerReducer(
  state: ScreenPlayerState,
  action: ScreenPlayerAction
): ScreenPlayerState {
  switch (action.type) {
    case 'TRANSCRIPT_COMPLETE':
      return { ...state, transcriptComplete: true }
    case 'WORD_REVEALED':
      return { ...state, currentWordIndex: action.index }
    default:
      return state
  }
}

// ============================================================================
// Component
// ============================================================================

export function ScreenPlayer({
  screen,
  onComplete,
  onMascotCta,
}: ScreenPlayerProps) {
  const heroRef = useRef<HeroRendererRef>(null)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [state, dispatch] = useReducer(screenPlayerReducer, {
    transcriptComplete: false,
    currentWordIndex: 0,
  })

  const handleWordRevealed = useCallback((index: number) => {
    dispatch({ type: 'WORD_REVEALED', index })
  }, [])

  const handleTranscriptComplete = useCallback(() => {
    dispatch({ type: 'TRANSCRIPT_COMPLETE' })

    // Auto-advance after transcript finishes
    autoAdvanceRef.current = setTimeout(() => {
      onComplete()
    }, 500)
  }, [onComplete])

  const handleSyncPoint = useCallback(
    (syncPoint: { action: string; target?: string }) => {
      if (syncPoint.action === 'play' && heroRef.current?.play) {
        heroRef.current.play()
      } else if (syncPoint.action === 'pause' && heroRef.current?.pause) {
        heroRef.current.pause()
      }
    },
    []
  )

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Hero Section */}
      <HeroRenderer
        ref={heroRef}
        hero={screen.hero}
        currentWordIndex={state.currentWordIndex}
        onSyncPoint={handleSyncPoint}
        onMascotCta={onMascotCta}
      />

      {/* Transcript Section */}
      <div className="flex-1">
        <TranscriptTyper
          transcript={screen.transcript}
          speed={35}
          estimatedDuration={screen.estimated_duration_seconds}
          onWordRevealed={handleWordRevealed}
          onComplete={handleTranscriptComplete}
        />
      </div>

      {/* Status hint when waiting */}
      {!state.transcriptComplete && (
        <div className="flex items-center justify-center gap-2 pt-4 text-sm text-muted-foreground">
          <span>Continue watching to proceed...</span>
        </div>
      )}
    </div>
  )
}
