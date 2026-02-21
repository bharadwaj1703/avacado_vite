import { createFileRoute } from '@tanstack/react-router'
import { RequireOnboardingComplete } from '@/components/auth/AuthGuards'
import { RadialIntro } from '@/components/animate-ui/components/community/radial-intro'
import { Trophy } from 'lucide-react'

const LEADERBOARD_ORBIT_ITEMS = [
  { id: 1, name: 'Alex', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 2, name: 'Sam', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { id: 3, name: 'Jordan', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 4, name: 'Casey', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
  { id: 5, name: 'Riley', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley' },
]

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-6">
      <div className="flex items-center gap-2">
        <Trophy className="size-6 text-primary" />
        <h1 className="text-xl font-semibold">Leaderboard</h1>
      </div>
      <div className="mb-8 flex justify-center">
        <RadialIntro orbitItems={LEADERBOARD_ORBIT_ITEMS} stageSize={320} imageSize={56} />
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Leaderboard rankings are temporarily hidden while we complete the backend migration.
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/_app/leaderboard')({
  component: () => (
    <RequireOnboardingComplete>
      <LeaderboardPage />
    </RequireOnboardingComplete>
  ),
})
