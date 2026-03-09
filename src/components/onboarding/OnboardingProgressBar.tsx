interface OnboardingProgressBarProps {
  totalSteps: number
  currentStep: number
}

export function OnboardingProgressBar({ totalSteps, currentStep }: OnboardingProgressBarProps) {
  const pct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  return (
    <div className="h-0.5 w-full bg-muted">
      <div
        className="h-full transition-[width] duration-300 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: 'var(--onboarding-fill)',
        }}
      />
    </div>
  )
}
