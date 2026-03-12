import { SignUp } from '@clerk/clerk-react'
import { createFileRoute } from '@tanstack/react-router'
import { SignedOutOnlyGuard } from '@/components/auth/AuthGuards'

function SignupPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4 py-8">
      <SignUp routing="hash" signInUrl="/login" forceRedirectUrl="/" />
    </div>
  )
}

export const Route = createFileRoute('/signup')({
  component: () => (
    <SignedOutOnlyGuard>
      <SignupPage />
    </SignedOutOnlyGuard>
  ),
})
