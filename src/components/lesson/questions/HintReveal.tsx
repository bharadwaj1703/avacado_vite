import { useState, useCallback } from 'react'
import { animate } from 'animejs'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HintRevealProps {
  hint: string
}

export function HintReveal({ hint }: HintRevealProps) {
  const [isVisible, setIsVisible] = useState(false)
  const contentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return

      if (isVisible) {
        animate(node, {
          opacity: [0, 1],
          height: [0, 'auto'],
          duration: 300,
          ease: 'outQuad',
        })
      }
    },
    [isVisible]
  )

  if (isVisible) {
    return (
      <div
        ref={contentRef}
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"
      >
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Hint
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">{hint}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsVisible(true)}
      className="text-muted-foreground hover:text-foreground"
    >
      <Lightbulb className="mr-1 size-4" />
      Need a hint?
    </Button>
  )
}
