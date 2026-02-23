import { createFileRoute } from '@tanstack/react-router'
import { SignedInGuard } from '@/components/auth/AuthGuards'
import { PaywallPage } from '@/components/paywall/PaywallPage'

export const Route = createFileRoute('/paywall/full')({
  component: () => (
    <SignedInGuard>
      <PaywallPage />
    </SignedInGuard>
  ),
})
