import type { ReactNode } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Navigate } from '@tanstack/react-router'
import { useAppUserProfile } from '@/hooks/useAppUser'

type PostAuthPath = '/dashboard'

function AuthLoadingFallback() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Loading account...</p>
    </div>
  )
}

export function RedirectSignedInFromSplash({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthLoadingFallback />
  if (isSignedIn) {
    const postAuthPath: PostAuthPath = '/dashboard'
    return <Navigate to={postAuthPath} />
  }

  return <>{children}</>
}

export function SignedOutOnlyGuard({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return <AuthLoadingFallback />
  if (isSignedIn) {
    const postAuthPath: PostAuthPath = '/dashboard'
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
  const { data: profile, isLoading } = useAppUserProfile()

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (isLoading) return <AuthLoadingFallback />

  if (profile?.onboardingCompletedAt) {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

export function RequireOnboardingComplete({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { data: profile, isLoading } = useAppUserProfile()

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (isLoading) return <AuthLoadingFallback />

  if (!profile?.onboardingCompletedAt) {
    return <Navigate to="/onboarding" />
  }

  return <>{children}</>
}


export function InitialRouteRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const { data: profile, isLoading } = useAppUserProfile()

  if (!isLoaded) return <AuthLoadingFallback />
  if (!isSignedIn) return <Navigate to="/splash" />
  if (isLoading) return <AuthLoadingFallback />

  if (!profile?.onboardingCompletedAt) {
    return <Navigate to="/onboarding" />
  }

  const postAuthPath: PostAuthPath = '/dashboard'
  return <Navigate to={postAuthPath} />
}
