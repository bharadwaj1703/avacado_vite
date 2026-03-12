import { createFileRoute } from '@tanstack/react-router'
import { InitialRouteRedirect } from '@/components/auth/AuthGuards'

export const Route = createFileRoute('/')({
  component: InitialRouteRedirect,
})
