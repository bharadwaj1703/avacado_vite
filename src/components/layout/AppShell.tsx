import { Outlet } from '@tanstack/react-router'
import { Header } from './Header'
import { BottomTabBar } from './BottomTabBar'

export function AppShell() {
  return (
    <div className="flex h-dvh flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomTabBar />
    </div>
  )
}
