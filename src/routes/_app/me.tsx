import { SignedIn, UserButton, useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

function MePage() {
  const { userId, sessionId } = useAuth()
  const { user } = useUser()
  const clerk = useClerk()

  const email = user?.primaryEmailAddress?.emailAddress ?? 'Not available'
  const fullName = user?.fullName ?? user?.username ?? 'Not available'

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-6">
      <div className="rounded-xl border border-border p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">User Details</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-right">{fullName}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-right">{email}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">User ID</dt>
            <dd className="text-right font-mono text-xs">{userId ?? 'Not available'}</dd>
          </div>
          <div className="flex items-start justify-between gap-2">
            <dt className="text-muted-foreground">Session ID</dt>
            <dd className="text-right font-mono text-xs">{sessionId ?? 'Not available'}</dd>
          </div>
        </dl>
      </div>

      <SignedIn>
        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Account Menu</p>
          <UserButton />
        </div>
      </SignedIn>

      <Button className="w-full" variant="destructive" onClick={() => clerk.signOut({ redirectUrl: '/splash' })}>
        Logout
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/_app/me')({
  component: MePage,
})
