import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { ConvexUserSync } from '@/components/auth/ConvexUserSync'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return (
    <>
      <ConvexUserSync />
      <RouterProvider router={router} />
    </>
  )
}
