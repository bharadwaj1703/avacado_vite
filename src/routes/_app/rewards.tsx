import { useState, useRef, useCallback } from 'react'
import { CircleDollarSign, X } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useRewards } from '@/hooks/useContentManifest'
import { Button } from '@/components/ui/button'
import { animate, spring } from 'animejs'

interface DragState {
  active: boolean
  startX: number
  currentX: number
}

const STACK_OFFSETS = [
  { x: 0, y: 0, scale: 1, rotate: 0 },
  { x: 5, y: -16, scale: 0.96, rotate: -2.2 },
  { x: -8, y: -32, scale: 0.92, rotate: 2.8 },
  { x: 6, y: -48, scale: 0.88, rotate: -1.5 },
]

const SWIPE_THRESHOLD = 80

function RewardsPage() {
  const rewards = useRewards()
  const [cardOrder, setCardOrder] = useState<number[]>(() =>
    rewards.items.map((_, i) => i)
  )
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null)

  const dragState = useRef<DragState>({ active: false, startX: 0, currentX: 0 })
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const animatingRef = useRef(false)

  const setCardRef = useCallback((itemIndex: number, el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(itemIndex, el)
    } else {
      cardRefs.current.delete(itemIndex)
    }
  }, [])

  const cycleTopToBack = useCallback(() => {
    setCardOrder((prev) => {
      const next = [...prev]
      const first = next.shift()!
      next.push(first)
      return next
    })
  }, [])

  const dismissLeft = useCallback(() => {
    const topItemIndex = cardOrder[0]
    const el = cardRefs.current.get(topItemIndex)
    if (!el) return

    animatingRef.current = true
    animate(el, {
      translateX: -window.innerWidth * 1.2,
      rotate: -15,
      duration: 350,
      ease: 'inQuad',
      onComplete: () => {
        el.style.transform = ''
        cycleTopToBack()
        animatingRef.current = false
      },
    })
  }, [cardOrder, cycleTopToBack])

  const flipOpen = useCallback(() => {
    const topItemIndex = cardOrder[0]
    const el = cardRefs.current.get(topItemIndex)
    if (!el) return

    animatingRef.current = true
    animate(el, {
      translateX: 0,
      rotate: 0,
      duration: 300,
      ease: 'outQuad',
      onComplete: () => {
        el.style.transform = ''
        setFlippedIndex(topItemIndex)
        animatingRef.current = false
      },
    })
  }, [cardOrder])

  const springBack = useCallback(() => {
    const topItemIndex = cardOrder[0]
    const el = cardRefs.current.get(topItemIndex)
    if (!el) return

    animatingRef.current = true
    animate(el, {
      translateX: 0,
      rotate: 0,
      ease: spring({ stiffness: 300, damping: 20 }),
      onComplete: () => {
        el.style.transform = ''
        animatingRef.current = false
      },
    })
  }, [cardOrder])

  const closeFlipped = useCallback(() => {
    setFlippedIndex(null)
    setTimeout(() => {
      cycleTopToBack()
    }, 750)
  }, [cycleTopToBack])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (animatingRef.current || flippedIndex !== null) return
      const target = e.currentTarget
      target.setPointerCapture(e.pointerId)
      dragState.current = { active: true, startX: e.clientX, currentX: e.clientX }
    },
    [flippedIndex]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragState.current.active || animatingRef.current) return
      dragState.current.currentX = e.clientX
      const dx = e.clientX - dragState.current.startX
      const topItemIndex = cardOrder[0]
      const el = cardRefs.current.get(topItemIndex)
      if (!el) return

      const rotation = dx * 0.08
      el.style.transform = `translateX(${dx}px) rotate(${rotation}deg)`
    },
    [cardOrder]
  )

  const handlePointerUp = useCallback(() => {
    if (!dragState.current.active) return
    dragState.current.active = false

    const dx = dragState.current.currentX - dragState.current.startX

    if (dx < -SWIPE_THRESHOLD) {
      dismissLeft()
    } else if (dx > SWIPE_THRESHOLD) {
      flipOpen()
    } else {
      springBack()
    }
  }, [dismissLeft, flipOpen, springBack])

  const visibleCards = cardOrder.slice(0, 4)

  return (
    <div className="mx-auto flex flex-1 w-full max-w-2xl flex-col items-center justify-start px-5 py-6 md:justify-center">
      <div className="relative aspect-[9/16] w-full max-w-sm overflow-visible">
        {/* Blurred glow of top card image */}
        {cardOrder.length > 0 && (
          <div
            key={`glow-${rewards.items[cardOrder[0]].id}`}
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[200%] w-[200%] -translate-x-1/2 -translate-y-1/2 opacity-0"
            style={{
              animation: 'glow-fade-in 600ms ease-out forwards',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            }}
          >
            <img
              src={rewards.items[cardOrder[0]].thumbnail}
              alt=""
              className="h-full w-full object-cover blur-[120px] saturate-150"
              draggable={false}
            />
          </div>
        )}

        {visibleCards
          .slice()
          .reverse()
          .map((itemIndex) => {
            const stackPos = visibleCards.indexOf(itemIndex)
            const item = rewards.items[itemIndex]
            const offset = STACK_OFFSETS[stackPos]
            const isTop = stackPos === 0
            const isFlipped = flippedIndex === itemIndex

            return (
              <div
                key={item.id}
                ref={(el) => setCardRef(itemIndex, el)}
                className={`absolute inset-0 ${isTop ? 'touch-none' : ''}`}
                style={{
                  zIndex: 10 - stackPos,
                  ...(!isTop
                    ? {
                        transform: `translate(${offset.x}px, ${offset.y}px) scale(${offset.scale}) rotate(${offset.rotate}deg)`,
                      }
                    : {}),
                }}
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerMove={isTop ? handlePointerMove : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
              >
                <div className="h-full w-full [perspective:1200px]">
                  <div
                    className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                      isFlipped ? '[transform:rotateY(180deg)]' : ''
                    }`}
                  >
                    {/* Front face */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-xl [backface-visibility:hidden]">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0)_20%)]" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <h2 className="text-base font-semibold text-white">
                          {item.title}
                        </h2>
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-amber-900">
                          <CircleDollarSign className="size-4" />
                          {item.price_coins.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Back face */}
                    <div className="absolute inset-0 overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {isFlipped ? (
                        <button
                          type="button"
                          className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                          onClick={closeFlipped}
                          aria-label="Close"
                        >
                          <X className="size-4" />
                        </button>
                      ) : null}
                      <div className="flex h-full flex-col justify-between">
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-widest text-zinc-400">
                            Reward
                          </p>
                          <h3 className="text-2xl font-semibold">{item.title}</h3>
                          <p className="text-sm text-zinc-300">
                            Unlock this reward with coins from completed lessons and
                            streak progress.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-amber-900">
                            <CircleDollarSign className="size-4" />
                            {item.price_coins.toLocaleString()}
                          </div>
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={closeFlipped}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/rewards')({
  component: RewardsPage,
})
