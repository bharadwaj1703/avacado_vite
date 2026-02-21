import type { FunctionReference } from 'convex/server'
import { useQuery } from 'convex/react'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../../convex/_generated/api'
import { RequireOnboardingComplete } from '@/components/auth/AuthGuards'
import { isConvexSkipped } from '@/lib/convex-skip'
import { Trophy } from 'lucide-react'

type LeaderboardEntry = { rank: number; userId: string; displayName: string; score: number; isCurrentUser: boolean }

function LeaderboardContent() {
  const list = useQuery(
    (api as { leaderboard: { list: FunctionReference<'query'> } }).leaderboard.list
  ) as LeaderboardEntry[] | undefined

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="size-6 text-primary" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>
      {list === undefined ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries yet. Complete lessons to appear here!</p>
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
    <div className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Trophy className="size-6 text-primary" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Leaderboard needs the backend. Run <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">bun convex dev</code> to sync and see rankings.
      </p>
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
