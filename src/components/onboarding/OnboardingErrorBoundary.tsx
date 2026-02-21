import type { ReactNode } from 'react'
import { Component } from 'react'

interface Props {
  children: ReactNode
  fallback: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches errors (e.g. Convex hook throwing when backend not deployed) and shows fallback
 * so the onboarding form is never blank.
 */
export class OnboardingErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
