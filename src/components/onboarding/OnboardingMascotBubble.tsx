import type { ReactNode } from 'react'
import { MascotBlob } from '@/components/mascot/MascotBlob'
import { DEFAULT_OUTER_BLOBS } from '@/components/mascot/mascot-blob-config'
import { cn } from '@/lib/utils'

interface OnboardingMascotBubbleProps {
  question: ReactNode
  className?: string
  /** Compact single-row layout for fixed header (mascot + bubble vertically centered) */
  variant?: 'default' | 'header'
}

export function OnboardingMascotBubble({ question, className, variant = 'default' }: OnboardingMascotBubbleProps) {
  const isHeader = variant === 'header'
  return (
    <div
      className={cn(
        'flex gap-3',
        !isHeader && 'flex-col items-center gap-4 sm:flex-row sm:gap-6',
        isHeader && 'items-center gap-3',
        className
      )}
    >
      <div className={cn('flex shrink-0 justify-center sm:order-2', isHeader && '-my-3')}>
        <MascotBlob
          className={cn(isHeader ? 'w-20 sm:w-24' : 'w-32 sm:w-40')}
          bodyMode="static"
          staticBaseScale={isHeader ? 1.8 : 1.2}
          staticBaseOffsetX={0}
          staticBaseOffsetY={0}
          staticInnerScale={1}
          eyeVariant="regular"
          mouthVariant="smile"
          outerBlobs={DEFAULT_OUTER_BLOBS}
          innerScale={0.78}
          innerOffsetY={-8}
          faceOffsetX={0}
          faceOffsetY={-35}
          faceSpacing={1}
          faceScale={1.1}
          animationEnabled={false}
          animationSpeed={1}
          animationAmplitude={8}
          grainEnabled={false}
          grainFrequency={0.65}
          grainOctaves={4}
          grainContrast={200}
          grainBrightness={150}
          grainScale={1}
        />
      </div>
      <div
        className={cn(
          'relative rounded-2xl rounded-bl-sm border-2 border-border bg-card shadow-level-1 sm:order-1 sm:rounded-bl-2xl sm:rounded-tl-sm',
          isHeader ? 'px-3 py-2' : 'px-4 py-3'
        )}
        aria-label="Question"
      >
        <div className={cn('text-left font-medium text-card-foreground', isHeader ? 'text-sm' : 'text-base sm:text-lg')}>
          {question}
        </div>
      </div>
    </div>
  )
}
