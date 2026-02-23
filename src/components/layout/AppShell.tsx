import { Outlet, useMatches } from '@tanstack/react-router'
import { RequireOnboardingComplete } from '@/components/auth/AuthGuards'
import { Header } from './Header'
import { BottomTabBar } from './BottomTabBar'

export function AppShell() {
  const matches = useMatches()
  const routeKey = matches[matches.length - 1]?.id ?? ''
  const isImmersiveChatRoute =
    routeKey === '/_app/chat/new' || routeKey === '/_app/chat/$chatId'

  return (
    <RequireOnboardingComplete>
      <div className="flex h-dvh flex-col">
        {!isImmersiveChatRoute && <Header />}
        <main className={`flex min-h-0 flex-1 flex-col overflow-y-auto ${isImmersiveChatRoute ? '' : 'pb-24'}`}>
          <div
            key={routeKey}
            className="flex min-h-0 flex-1 flex-col animate-[tab-fade-in_250ms_ease-out]"
          >
            <Outlet />
          </div>
        </main>
        {!isImmersiveChatRoute && <BottomTabBar />}
      </div>
    </RequireOnboardingComplete>
  )
}
