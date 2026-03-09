import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScreenNavProps {
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  currentIndex: number
  totalScreens: number
}

export function ScreenNav({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  currentIndex,
  totalScreens,
}: ScreenNavProps) {
  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="icon"
        onClick={onPrev}
        disabled={!canGoPrev}
        className="rounded-full"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <div className="flex gap-1.5">
        {Array.from({ length: totalScreens }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex
                ? 'w-6 bg-primary'
                : i < currentIndex
                  ? 'w-1.5 bg-primary/50'
                  : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-full"
      >
        <ChevronRight className="size-5" />
      </Button>
    </div>
  )
}
