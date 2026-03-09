import { useState, useRef, useCallback } from 'react'
import { animate } from 'animejs'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { FireworksBackground } from '@/components/animate-ui/components/backgrounds/fireworks'
import { TicketPercent, ChevronRight, Gift } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const DOT_COLORS = [
  'bg-sky-400',
  'bg-pink-400',
  'bg-yellow-400',
  'bg-sky-300',
  'bg-pink-300',
  'bg-yellow-300',
  'bg-purple-400',
  'bg-green-400',
]

const DOT_POSITIONS = [
  { top: '6%', left: '10%', size: 8 },
  { top: '10%', right: '15%', size: 6 },
  { top: '4%', left: '45%', size: 10 },
  { top: '14%', right: '8%', size: 7 },
  { top: '2%', left: '25%', size: 5 },
  { top: '12%', left: '70%', size: 9 },
  { top: '18%', right: '30%', size: 6 },
  { top: '6%', right: '45%', size: 8 },
]

const THUMB_SIZE = 48
const TRACK_PADDING = 4
const UNLOCK_THRESHOLD = 0.8

const FIREWORK_COLORS = ['#E8B931', '#E84393', '#6C5CE7', '#0984E3']

function SlideToUnlock({
  onUnlock,
  timerText,
}: {
  onUnlock: () => void
  timerText: string
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState(0)
  const [maxTravel, setMaxTravel] = useState(0)
  const startX = useRef(0)

  const progress = maxTravel > 0 ? offset / maxTravel : 0

  const measureTrack = useCallback((el: HTMLDivElement | null) => {
    trackRef.current = el
    if (el) {
      setMaxTravel(el.clientWidth - THUMB_SIZE - TRACK_PADDING * 2)
    }
  }, [])

  const handleStart = useCallback(
    (clientX: number) => {
      setDragging(true)
      startX.current = clientX - offset
    },
    [offset]
  )

  const handleMove = useCallback(
    (clientX: number) => {
      if (!dragging) return
      const raw = clientX - startX.current
      setOffset(Math.max(0, Math.min(raw, maxTravel)))
    },
    [dragging, maxTravel]
  )

  const handleEnd = useCallback(() => {
    if (!dragging) return
    setDragging(false)
    if (progress >= UNLOCK_THRESHOLD) {
      setOffset(maxTravel)
      onUnlock()
    } else {
      const currentOffset = offset
      const obj = { x: currentOffset }
      animate(obj, {
        x: 0,
        duration: 500,
        ease: 'outElastic(1, 0.5)',
        onUpdate: () => setOffset(obj.x),
      })
    }
  }, [dragging, progress, maxTravel, onUnlock, offset])

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    handleStart(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => handleMove(e.clientX)
  const onPointerUp = () => handleEnd()

  return (
    <div
      ref={measureTrack}
      className="relative h-14 w-full select-none overflow-hidden rounded-full bg-white/10"
      style={{ padding: TRACK_PADDING, touchAction: 'none' }}
    >
      {/* Center text with timer */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2"
        style={{ opacity: 1 - progress * 1.8 }}
      >
        <span className="text-sm font-medium text-white/60 tracking-wide">
          Slide to Claim
        </span>
        <span className="font-mono text-sm font-normal text-white/80">
          {timerText}
        </span>
        <span className="flex items-center opacity-50">
          <ChevronRight className="h-3.5 w-3.5 -mr-2 text-white/50" />
          <ChevronRight className="h-3.5 w-3.5 -mr-2 text-white/50" />
          <ChevronRight className="h-3.5 w-3.5 text-white/50" />
        </span>
      </div>

      {/* Thumb */}
      <div
        className={cn(
          'relative z-10 flex items-center justify-center rounded-full',
          'cursor-grab active:cursor-grabbing',
          'bg-white text-zinc-900',
          'shadow-lg',
          !dragging &&
            'transition-[left] duration-500 ease-[cubic-bezier(.175,.885,.32,1.275)]'
        )}
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          left: offset,
          position: 'relative',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="slider"
        aria-label="Slide to claim discount"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setOffset(maxTravel)
            onUnlock()
          }
        }}
      >
        <TicketPercent className="h-5 w-5" />
      </div>
    </div>
  )
}

const UNLOCKED_ITEMS = [
  { label: '7 Days Free', iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  { label: 'AI Mastermind Access', iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
  { label: 'AI for Marketing', iconBg: 'bg-pink-500/20', iconColor: 'text-pink-400' },
]

function CelebrationView({ onStartLearning }: { onStartLearning: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  const setRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
    if (el && !hasAnimated.current) {
      hasAnimated.current = true
      const items = el.querySelectorAll('.celebrate-item')
      animate(items, {
        y: [20, 0],
        opacity: [0, 1],
        duration: 500,
        delay: (_el, i: number) => 300 + i * 120,
        ease: 'outExpo',
      })
      const cta = el.querySelector('.celebrate-cta')
      if (cta) {
        animate(cta, {
          y: [20, 0],
          opacity: [0, 1],
          duration: 500,
          delay: 800,
          ease: 'outExpo',
        })
      }
    }
  }, [])

  return (
    <div ref={setRef} className="relative mx-auto w-full max-w-md">
      {/* Fireworks behind content */}
      <FireworksBackground
        className="pointer-events-none absolute inset-0 -top-20 h-[calc(100%+80px)]"
        color={FIREWORK_COLORS}
        population={3}
        fireworkSpeed={{ min: 4, max: 8 }}
        fireworkSize={{ min: 2, max: 4 }}
        particleSpeed={{ min: 3, max: 8 }}
        particleSize={{ min: 1, max: 5 }}
      />

      <div className="relative z-10">
        <DrawerHeader className="text-center pt-6">
          <DrawerTitle className="text-4xl font-bold text-white">
            Congratulations!
          </DrawerTitle>
          <p className="mt-1 text-sm text-zinc-400">You've unlocked:</p>
        </DrawerHeader>

        <div className="flex flex-col gap-3 px-4 pt-2">
          {UNLOCKED_ITEMS.map((item) => (
            <div
              key={item.label}
              className="celebrate-item flex items-center gap-3 rounded-xl bg-white/5 p-3 opacity-0"
            >
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  item.iconBg
                )}
              >
                <Gift className={cn('h-5 w-5', item.iconColor)} />
              </div>
              <p className="text-sm font-semibold text-white">{item.label}</p>
            </div>
          ))}
        </div>

        <DrawerFooter className="celebrate-cta opacity-0">
          <Button
            size="lg"
            className="w-full bg-white text-zinc-900 hover:bg-white/90"
            onClick={onStartLearning}
          >
            Start Learning
          </Button>
        </DrawerFooter>
      </div>
    </div>
  )
}

export function CouponDrawer({
  open,
  onOpenChange,
  onClaim,
  onTimerExpired,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onClaim: () => void
  onTimerExpired: () => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(165)
  const [unlocked, setUnlocked] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dotsAnimated = useRef(false)

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      clearTimer()
    }
    onOpenChange(next)
  }

  const innerRef = (el: HTMLDivElement | null) => {
    if (el && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearTimer()
            onTimerExpired()
            onOpenChange(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      if (!dotsAnimated.current) {
        dotsAnimated.current = true
        const dots = el.querySelectorAll('.celebration-dot')
        animate(dots, {
          scale: [0, 1],
          opacity: [0, 0.6],
          duration: 600,
          delay: (_el, i: number) => i * 80,
          ease: 'outBack',
        })
      }
    }
  }

  function handleSlideUnlock() {
    clearTimer()
    setUnlocked(true)
  }

  function handleStartLearning() {
    onClaim()
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent className="bg-zinc-900 border-zinc-800">
        <style>{`[data-slot="drawer-content"] > div:first-child { background: rgba(255,255,255,0.2) !important; }`}</style>

        {unlocked ? (
          <CelebrationView onStartLearning={handleStartLearning} />
        ) : (
          <div
            ref={innerRef}
            className="relative mx-auto w-full max-w-md overflow-hidden"
          >
            {/* Celebration dots */}
            {DOT_POSITIONS.map((pos, i) => (
              <div
                key={i}
                className={`celebration-dot absolute rounded-full opacity-0 ${DOT_COLORS[i]}`}
                style={{
                  top: pos.top,
                  left: 'left' in pos ? pos.left : undefined,
                  right: 'right' in pos ? pos.right : undefined,
                  width: pos.size,
                  height: pos.size,
                }}
              />
            ))}

            <DrawerHeader className="text-left">
              <DrawerTitle className="text-4xl font-bold text-white">
                FREE for 7 days!
              </DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col gap-3 px-4">
              <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
                  <Gift className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    AI Mastermind Access
                  </p>
                  <p className="text-xs text-zinc-400">Worth $499</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-white/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-500/20">
                  <Gift className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    AI for Marketing
                  </p>
                  <p className="text-xs text-zinc-400">Worth $1999</p>
                </div>
              </div>
            </div>

            <DrawerFooter>
              <SlideToUnlock
                onUnlock={handleSlideUnlock}
                timerText={formatTime(secondsLeft)}
              />
            </DrawerFooter>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
