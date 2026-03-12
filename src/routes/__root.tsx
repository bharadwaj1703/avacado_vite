import { createRootRoute, Outlet } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppUserSync } from '@/components/auth/AppUserSync'

const queryClient = new QueryClient()

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AppUserSync />
      <Outlet />
    </QueryClientProvider>
  ),
})
