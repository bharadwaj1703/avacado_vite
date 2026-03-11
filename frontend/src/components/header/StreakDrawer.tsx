import { useRef } from 'react'
import { Flame } from 'lucide-react'
import { animate } from 'animejs'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface StreakDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STREAK_TIPS = [
  'Streaks multiply your coin earnings',
  '7-day streak = 0.5x extra coins',
  '30-day streak = 2x extra coins (max)',
]

const TOTAL_DAYS = 7
const OUTLINED_DAYS = 3

export function StreakDrawer({ open, onOpenChange }: StreakDrawerProps) {
  const animatedRef = useRef(false)

  const setRef = (el: HTMLDivElement | null) => {
    if (el && !animatedRef.current) {
      animatedRef.current = true
      const circles = el.querySelectorAll('.day-circle')
      animate(circles, {
        scale: [0, 1],
        duration: 400,
        delay: (_el, i: number) => i * 80,
        ease: 'outBack',
      })
    }
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      animatedRef.current = false
    }
    onOpenChange(value)
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-16 items-center justify-center rounded-full bg-orange-100">
              <Flame className="size-10 text-orange-500" />
            </div>
            <DrawerTitle className="text-2xl">7 Day Streak!</DrawerTitle>
          </div>
        </DrawerHeader>

        <div className="flex flex-col items-center gap-6 px-6 pb-6">
          <div ref={setRef} className="flex justify-center gap-3">
            {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
              const onFire = i >= OUTLINED_DAYS
              return (
                <div
                  key={i}
                  className={`day-circle flex size-9 items-center justify-center rounded-full border-2 ${
                    onFire
                      ? 'border-orange-500 bg-orange-100'
                      : 'border-muted-foreground/20'
                  }`}
                >
                  {onFire && <Flame className="size-4 text-orange-500" />}
                </div>
              )
            })}
          </div>

          <p className="text-sm font-medium text-muted-foreground">
            7 day streak
          </p>

          <div className="flex w-full flex-col gap-2">
            {STREAK_TIPS.map((tip) => (
              <div key={tip} className="flex items-center gap-3">
                <Flame className="size-4 shrink-0 text-orange-400" />
                <span className="text-sm text-muted-foreground">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
