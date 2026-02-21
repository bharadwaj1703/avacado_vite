import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { AppUserSync } from '@/components/auth/AppUserSync'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <>
      <AppUserSync />
      <RouterProvider router={router} />
    </>
  )
}
