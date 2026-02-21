import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient } from 'convex/react'
import './index.css'
import App from './App.tsx'
import { ConvexErrorBoundary } from '@/components/auth/ConvexErrorBoundary'

const publishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ??
  import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error(
    'Missing Clerk Publishable Key. Set VITE_CLERK_PUBLISHABLE_KEY (preferred) or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.'
  )
}

// Use placeholder URL when not set so ConvexProvider always mounts (hooks don't throw); queries will fail until deployed
const convexUrl = (import.meta.env.VITE_CONVEX_URL as string) || 'https://placeholder.convex.cloud'
const convex = new ConvexReactClient(convexUrl)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexErrorBoundary>
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/splash">
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ConvexErrorBoundary>
  </StrictMode>
)
