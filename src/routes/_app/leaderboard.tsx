import { createFileRoute } from '@tanstack/react-router'
import { RadialIntro } from '@/components/animate-ui/components/community/radial-intro'

const LEADERBOARD_ORBIT_ITEMS = [
  { id: 1, name: 'Alex', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 2, name: 'Sam', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam' },
  { id: 3, name: 'Jordan', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 4, name: 'Casey', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
  { id: 5, name: 'Riley', src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Riley' },
]

function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-5 py-6">
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
  component: LeaderboardPage,
})
