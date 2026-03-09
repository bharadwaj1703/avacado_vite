import { useState, useRef } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import { animate } from 'animejs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CouponDrawer } from './CouponDrawer'
import {
  X,
  Play,
  BookHeart,
  Brain,
  Check,
  TicketPercent,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type PricingPlan = 'monthly' | 'yearly'

function StatCard({
  icon: Icon,
  stat,
  label,
  bg,
  iconColor,
}: {
  icon: typeof Play
  stat: string
  label: string
  bg: string
  iconColor: string
}) {
  return (
    <Card className={cn('flex-1 border-0 shadow-none', bg)}>
      <CardContent className="flex flex-col items-start gap-1 p-3">
        <Icon className={cn('h-5 w-5', iconColor)} />
        <span className="text-2xl font-bold">{stat}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

function PricingCard({
  price,
  subtext,
  badge,
  selected,
  onSelect,
}: {
  price: string
  subtext?: string
  badge?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        selected
          ? 'border-sky-400 ring-2 ring-sky-400/30 shadow-lg shadow-sky-200/50'
          : 'border-border'
      )}
      onClick={onSelect}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {/* Radio indicator */}
        <div
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
            selected
              ? 'bg-sky-400 border-sky-400 ring-2 ring-sky-400/30'
              : 'border-2 border-muted'
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>

        <div className="flex-1">
          <p className="text-lg font-bold">{price}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground">{subtext}</p>
          )}
        </div>

        {badge && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            {badge}
          </span>
        )}
      </CardContent>
    </Card>
  )
}

function CouponCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className="cursor-pointer border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 transition-all hover:shadow-md hover:shadow-amber-100/60 active:scale-[0.99]"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        {/* Avatar circle */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm">
          <TicketPercent className="h-6 w-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold tracking-tight text-foreground">
            Special Coupon:{' '}
            <span className="font-mono text-amber-700">SOYDEV</span>
          </p>
          <p className="text-xs text-muted-foreground">Limited Time Offer</p>
        </div>

        {/* Decorative dashed border ticket edge */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-amber-300/70">
          <span className="text-lg font-bold text-amber-600">%</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function PaywallPage() {
  const queryClient = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>('yearly')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [swipeExpired, setSwipeExpired] = useState(false)
  const mountedRef = useRef(false)

  async function handleDismiss() {
    await queryClient.invalidateQueries({ queryKey: ['appUser', 'me'] })
    window.history.back()
  }

  function handleTimerExpired() {
    setSwipeExpired(true)
  }

  const setRef = (el: HTMLDivElement | null) => {
    if (el && !mountedRef.current) {
      mountedRef.current = true
      const sections = el.querySelectorAll('.pw-section')
      animate(sections, {
        y: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: (_el, i: number) => i * 100,
        ease: 'outExpo',
      })
    }
  }

  return (
    <div ref={setRef} className="flex min-h-dvh flex-col px-4 py-6">
      <div className="pw-section opacity-0">
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-sm text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 pt-4">
        {/* Header */}
        <div className="pw-section opacity-0">
          <h1 className="text-3xl font-bold tracking-tight">
            Unlock your Career Growth
          </h1>
          <p className="mt-1 text-base text-muted-foreground">
            AI will change everything
          </p>
        </div>

        {/* Stat cards */}
        <div className="pw-section flex gap-3 opacity-0">
          <StatCard
            icon={Play}
            stat="100+"
            label="Lessons"
            bg="bg-blue-50"
            iconColor="text-blue-500"
          />
          <StatCard
            icon={BookHeart}
            stat="25+"
            label="Resources"
            bg="bg-pink-50"
            iconColor="text-pink-500"
          />
          <StatCard
            icon={Brain}
            stat="200+"
            label="AI Models"
            bg="bg-purple-50"
            iconColor="text-purple-500"
          />
        </div>

        {/* Pricing cards */}
        <div className="pw-section flex flex-col gap-3 opacity-0">
          <PricingCard
            price="$1/month"
            subtext="$19/month from next month"
            badge="94% OFF"
            selected={selectedPlan === 'monthly'}
            onSelect={() => setSelectedPlan('monthly')}
          />
          <PricingCard
            price="$199/year"
            subtext="Just ¢54/day"
            selected={selectedPlan === 'yearly'}
            onSelect={() => setSelectedPlan('yearly')}
          />
        </div>

        {/* Bullet points */}
        <div className="pw-section flex flex-col gap-2 opacity-0">
          {[
            'Personalised learning path based on your schedule',
            'Bite-sized lessons designed for your profession',
            'Track your progress and earn streaks',
          ].map((text) => (
            <div key={text} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-sm text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>

        {/* Coupon card */}
        {!swipeExpired && (
          <div className="pw-section opacity-0">
            <CouponCard onClick={() => setDrawerOpen(true)} />
          </div>
        )}

        {/* CTAs */}
        <div className="pw-section mt-auto flex flex-col gap-3 pb-4 opacity-0">
          <Button size="lg" className="w-full" onClick={handleDismiss}>
            Start Learning
          </Button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Maybe Later
          </button>
        </div>
      </div>

      <CouponDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onClaim={handleDismiss}
        onTimerExpired={handleTimerExpired}
      />
    </div>
  )
}
