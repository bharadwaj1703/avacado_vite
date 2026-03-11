import { Link } from '@tanstack/react-router'
import { Home, Coins, MessageCircle, Star } from 'lucide-react'

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-10 mx-auto max-w-2xl rounded-2xl border border-border bg-background/95 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex h-14 items-center justify-around">
        <Link
          to="/dashboard"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <Home className="size-4" />
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          to="/rewards"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <Coins className="size-4" />
          <span className="text-xs font-medium">Rewards</span>
        </Link>
        <Link
          to="/chat"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <MessageCircle className="size-4" />
          <span className="text-xs font-medium">AI Chat</span>
        </Link>
        <Link
          to="/paywall/full"
          className="flex flex-col items-center gap-0.5 px-3 py-2 text-muted-foreground transition-colors [&.active]:text-primary"
          activeProps={{ className: 'active text-primary' }}
        >
          <div className="flex size-5 items-center justify-center rounded-full border border-current">
            <Star className="size-3" />
          </div>
          <span className="text-xs font-medium">Pro</span>
        </Link>
      </div>
    </nav>
  )
}
