import { createFileRoute } from '@tanstack/react-router'
import { SignedIn, UserButton, useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { User } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ProfilePage() {
  const { isLoaded: clerkLoaded, isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const clerk = useClerk()

  if (!clerkLoaded) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <p className="text-center text-sm text-muted-foreground">Loading account...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md px-4 py-8 text-center">
        <User className="mx-auto size-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-medium tracking-tight">Your Profile</h2>
        <p className="mt-2 text-muted-foreground">Sign in to see your profile.</p>
      </div>
    )
  }

  const displayName = clerkUser?.fullName ?? clerkUser?.username ?? '—'
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? '—'

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Profile</h1>

      <div className="rounded-xl border border-border p-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Account</p>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-right font-medium">{displayName}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-right">{email}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Profile Data</dt>
            <dd className="text-right text-muted-foreground">Coming soon</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border p-4">
        <p className="text-sm text-muted-foreground">
          Onboarding insights and streak summaries are temporarily hidden while we complete the backend migration.
        </p>
      </div>

      <SignedIn>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Account menu</p>
          <UserButton />
        </div>
      </SignedIn>

      <Button
        className="w-full"
        variant="destructive"
        onClick={() => clerk.signOut({ redirectUrl: '/splash' })}
      >
        Sign out
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
