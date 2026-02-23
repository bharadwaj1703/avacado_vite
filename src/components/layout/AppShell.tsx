import { Outlet, useMatches } from '@tanstack/react-router'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { Header } from './Header'
import { BottomTabBar } from './BottomTabBar'

export function AppShell() {
  const matches = useMatches()
  const routeKey = matches[matches.length - 1]?.id ?? ''

  return (
    <SignedInGuard>
      <div className="flex h-dvh flex-col">
        <Header />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-16">
          <div
            key={routeKey}
            className="flex min-h-0 flex-1 flex-col animate-[tab-fade-in_250ms_ease-out]"
          >
            <Outlet />
          </div>
        </main>
        <BottomTabBar />
      </div>
    </SignedInGuard>
  )
}
