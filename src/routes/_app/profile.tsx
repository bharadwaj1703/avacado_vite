import { createFileRoute } from '@tanstack/react-router'
import { User } from 'lucide-react'

function ProfilePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-8 text-center">
      <User className="mx-auto size-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-medium tracking-tight">Your Profile</h2>
      <p className="mt-2 text-muted-foreground">Coming soon</p>
    </div>
  )
}

export const Route = createFileRoute('/_app/profile')({
  component: ProfilePage,
})
