import { SignIn } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { SignedOutOnlyGuard } from '@/components/auth/AuthGuards'

function LoginPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-8">
      <SignIn routing="hash" signUpUrl="/signup" forceRedirectUrl="/" />
    </div>
  )
}

export const Route = createFileRoute('/login')({
  component: () => (
    <SignedOutOnlyGuard>
      <LoginPage />
    </SignedOutOnlyGuard>
  ),
})
