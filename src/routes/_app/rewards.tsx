import { useState } from 'react'
import { CircleDollarSign, X } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useRewards } from '@/hooks/useContentManifest'
import type { RewardItem } from '@/types/content'
import { Button } from '@/components/ui/button'

function RewardsPage() {
  const rewards = useRewards()
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)

  const openRewardDialog = (reward: RewardItem) => {
    setSelectedReward(reward)
    setIsFlipped(false)
    setTimeout(() => setIsFlipped(true), 16)
  }

  const closeRewardDialog = () => {
    setSelectedReward(null)
    setIsFlipped(false)
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{rewards.title}</h1>
          {rewards.description ? (
            <p className="text-sm text-muted-foreground">{rewards.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rewards.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openRewardDialog(item)}
              className="relative aspect-[9/16] w-full overflow-hidden rounded-xl border border-border bg-muted text-left shadow-sm transition-transform hover:scale-[1.01]"
            >
              <img
                src={item.thumbnail}
                alt={item.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0)_20%)]" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h2 className="text-base font-semibold text-white">{item.title}</h2>
                <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-amber-900">
                  <CircleDollarSign className="size-4" />
                  {item.price_coins.toLocaleString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedReward ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <button
            type="button"
            aria-label="Close reward dialog"
            className="absolute inset-0"
            onClick={closeRewardDialog}
          />

          <div className="relative z-10 w-full max-w-sm [perspective:1200px]">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
              onClick={closeRewardDialog}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div
              className={`relative aspect-[9/16] w-full transition-transform duration-700 [transform-style:preserve-3d] ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]">
                <img
                  src={selectedReward.thumbnail}
                  alt={selectedReward.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0)_20%)]" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="text-xl font-semibold text-white">{selectedReward.title}</h3>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-amber-900">
                    <CircleDollarSign className="size-4" />
                    {selectedReward.price_coins.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 overflow-hidden rounded-2xl bg-zinc-950 p-6 text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="flex h-full flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-widest text-zinc-400">Reward</p>
                    <h3 className="text-2xl font-semibold">{selectedReward.title}</h3>
                    <p className="text-sm text-zinc-300">
                      Unlock this reward with coins from completed lessons and streak progress.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-sm font-semibold text-amber-900">
                      <CircleDollarSign className="size-4" />
                      {selectedReward.price_coins.toLocaleString()}
                    </div>
                    <Button className="w-full" variant="outline" onClick={closeRewardDialog}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export const Route = createFileRoute('/_app/rewards')({
  component: RewardsPage,
})
