import { Flame } from 'lucide-react'

interface StreakBannerProps {
  count: number
}

export function StreakBanner({ count }: StreakBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 p-4 text-white">
      <div className="flex items-center gap-3">
        <Flame className="size-8" />
        <div>
          <p className="text-2xl font-medium tracking-tight">{count} day streak!</p>
          <p className="text-sm opacity-90">Keep it going — practice today</p>
        </div>
      </div>
    </div>
  )
}
