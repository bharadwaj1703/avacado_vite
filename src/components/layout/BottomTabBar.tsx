import { Link } from '@tanstack/react-router'
import { Home, Coins, Trophy, User } from 'lucide-react'

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-background">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <Home className="size-5" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          to="/rewards"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <Coins className="size-5" />
          <span className="text-xs font-medium">Rewards</span>
        </Link>
        <Link
          to="/leaderboard"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <Trophy className="size-5" />
          <span className="text-xs font-medium">Leaderboard</span>
        </Link>
        <Link
          to="/profile"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <User className="size-5" />
          <span className="text-xs font-medium">Profile</span>
        </Link>
      </div>
    </nav>
  )
}
