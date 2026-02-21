import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { useConvexUser } from '@/hooks/useConvexUser'

const CONVEX_LOADING_TIMEOUT_MS = 1500

type PostAuthPath = '/onboarding' | '/dashboard'

function AuthLoadingFallback() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading account...</p>
    </div>
  )
}

export function InitialRouteRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoading: convexLoading, isOnboardingComplete } = useConvexUser()

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (convexLoading) return <AuthLoadingFallback />

  const postAuthPath: PostAuthPath = isOnboardingComplete ? '/dashboard' : '/onboarding'
  return <Navigate to={postAuthPath} />
}

export function RedirectSignedInFromSplash({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoading: convexLoading, isOnboardingComplete } = useConvexUser()

  if (!isLoaded) return <AuthLoadingFallback />
  if (isSignedIn) {
    if (convexLoading) return <AuthLoadingFallback />
    const postAuthPath: PostAuthPath = isOnboardingComplete ? '/dashboard' : '/onboarding'
    return <Navigate to={postAuthPath} />
  }

  return <>{children}</>
}

export function SignedOutOnlyGuard({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoading: convexLoading, isOnboardingComplete } = useConvexUser()

  if (!isLoaded) return <AuthLoadingFallback />
  if (isSignedIn) {
    if (convexLoading) return <AuthLoadingFallback />
    const postAuthPath: PostAuthPath = isOnboardingComplete ? '/dashboard' : '/onboarding'
    return <Navigate to={postAuthPath} />
  }

  return <>{children}</>
}

export function SignedInGuard({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />

  return <>{children}</>
}

export function OnboardingRouteGuard({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoading: convexLoading } = useConvexUser()
  const [showContentAfterTimeout, setShowContentAfterTimeout] = useState(false)

  // If Convex never resolves, show onboarding after timeout so the form is never blank
  useEffect(() => {
    const t = window.setTimeout(() => setShowContentAfterTimeout(true), CONVEX_LOADING_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [])

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (convexLoading && !showContentAfterTimeout) return <AuthLoadingFallback />

  // Do not redirect away from /onboarding when user has already completed it — they may have opened
  // the URL directly or are re-running onboarding. Only use isOnboardingComplete for initial route (/) and splash.
  return <>{children}</>
}

export function RequireOnboardingComplete({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoading: convexLoading } = useConvexUser()
  const [showContentAfterTimeout, setShowContentAfterTimeout] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setShowContentAfterTimeout(true), CONVEX_LOADING_TIMEOUT_MS)
    return () => clearTimeout(t)
  }, [])

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (convexLoading && !showContentAfterTimeout) return <AuthLoadingFallback />

  // Do not redirect away from /dashboard when onboarding isn't complete — only use that for initial route (/) and splash.
  return <>{children}</>
}
