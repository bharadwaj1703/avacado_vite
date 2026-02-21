import type { ReactNode } from 'react'
import { Component } from 'react'
import { setConvexSkipped, isConvexServerError } from '@/lib/convex-skip'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

/**
 * Catches Convex "Could not find public function" (backend not deployed) and
 * sets convex-skip so the app can run without Convex; then reloads.
 */
export class ConvexErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(err: unknown): State {
    const message = err instanceof Error ? err.message : String(err)
    return { hasError: true, message }
  }

  componentDidCatch(err: unknown) {
    if (isConvexServerError(err)) {
      setConvexSkipped()
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
          <p className="text-center text-sm text-muted-foreground">
            Connecting to backend… Reloading.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
