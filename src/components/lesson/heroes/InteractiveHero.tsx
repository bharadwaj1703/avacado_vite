interface InteractiveHeroProps {
  component: string
  props?: Record<string, unknown>
}

export function InteractiveHero({ component }: InteractiveHeroProps) {
  // Placeholder for future dynamic component system
  // For now, render a "Coming Soon" box
  return (
    <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-muted">
      <div className="text-center">
        <div className="mb-3 text-4xl">🎮</div>
        <p className="text-sm font-medium text-muted-foreground">
          Interactive: {component}
        </p>
        <p className="text-xs text-muted-foreground">Coming soon</p>
      </div>
    </div>
  )
}
