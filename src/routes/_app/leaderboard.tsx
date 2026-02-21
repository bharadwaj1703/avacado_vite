import { useQuery } from 'convex/react'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../../convex/_generated/api'
import { RequireOnboardingComplete } from '@/components/auth/AuthGuards'
import { clearConvexSkipped, isConvexSkipped } from '@/lib/convex-skip'
import { RadialIntro } from '@/components/animate-ui/components/community/radial-intro'
import { Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'

const LEADERBOARD_ORBIT_ITEMS = [
  { id: 1, name: 'Alex', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 2, name: 'Sam', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { id: 3, name: 'Jordan', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 4, name: 'Casey', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
  { id: 5, name: 'Riley', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley' },
]

type LeaderboardEntry = { rank: number; userId: string; displayName: string; score: number; isCurrentUser: boolean }

function LeaderboardContent() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Convex api; leaderboard.list query ref
  const list = useQuery((api as any).leaderboard.list) as LeaderboardEntry[] | undefined

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="size-6 text-primary" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>
      <div className="mb-8 flex justify-center">
        <RadialIntro orbitItems={LEADERBOARD_ORBIT_ITEMS} stageSize={320} imageSize={56} />
      </div>
      {list === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : list.length === 0 ? (
        <p className="space-y-2 text-sm text-muted-foreground">
          <p>No one on the leaderboard yet.</p>
          <p>Complete onboarding and a lesson to earn points and appear here. If you just connected the backend, refresh the page.</p>
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((entry: LeaderboardEntry) => (
            <li
              key={entry.userId}
              className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                entry.isCurrentUser ? 'border-primary bg-primary/5' : 'border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">#{entry.rank}</span>
                <span className="font-medium">{entry.displayName}</span>
                {entry.isCurrentUser && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">You</span>
                )}
              </div>
              <span className="text-sm font-semibold">{entry.score} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LeaderboardUnavailable() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="flex items-center gap-2">
        <Trophy className="size-6 text-primary" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>
      <div className="mb-8 flex justify-center">
        <RadialIntro orbitItems={LEADERBOARD_ORBIT_ITEMS} stageSize={320} imageSize={56} />
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Backend not connected</p>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
          Run <code className="rounded bg-amber-200/60 px-1 font-mono text-xs dark:bg-amber-900/60">bun convex dev</code>, then tap Reconnect to load rankings.
        </p>
        <Button
          className="mt-3 w-full"
          variant="outline"
          size="sm"
          onClick={() => {
            clearConvexSkipped()
            window.location.reload()
          }}
        >
          Reconnect backend
        </Button>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/leaderboard')({
  component: () => (
    <RequireOnboardingComplete>
      {isConvexSkipped() ? <LeaderboardUnavailable /> : <LeaderboardContent />}
    </RequireOnboardingComplete>
  ),
})
