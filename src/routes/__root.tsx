import { createRootRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppUserSync } from '@/components/auth/AppUserSync'
import { useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'

const queryClient = new QueryClient()

function NotFound() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        navigate({ to: '/dashboard' })
      } else {
        navigate({ to: '/splash' })
      }
    }
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Redirecting...</p>
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AppUserSync />
      <Outlet />
    </QueryClientProvider>
  ),
  notFoundComponent: NotFound,
})
