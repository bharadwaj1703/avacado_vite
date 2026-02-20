import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { RadioQuestion } from '@/components/quiz/RadioQuestion'
import { StepIndicator } from '@/components/onboarding/StepIndicator'
import { PageContainer } from '@/components/layout/PageContainer'
import { Leaf } from 'lucide-react'

const goalOptions = [
  { id: 'confidence', text: 'Build confidence in my style' },
  { id: 'wardrobe', text: 'Build a better wardrobe' },
  { id: 'trends', text: 'Stay on top of trends' },
  { id: 'express', text: 'Express myself better' },
]

const experienceOptions = [
  { id: 'beginner', text: 'Complete beginner' },
  { id: 'some', text: 'I know some basics' },
  { id: 'intermediate', text: 'Fairly confident' },
  { id: 'advanced', text: 'I just want to level up' },
]

function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState<string[]>([])
  const [experience, setExperience] = useState<string[]>([])
  const navigate = useNavigate()

  const handleContinue = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  const canContinue =
    step === 0 || (step === 1 && goal.length > 0) || (step === 2 && experience.length > 0)

  return (
    <div className="flex h-dvh flex-col">
      <div className="px-4 pt-6">
        <StepIndicator totalSteps={3} currentStep={step} />
      </div>

      <div className="flex flex-1 flex-col justify-center px-4">
        <PageContainer className="max-w-md">
          {step === 0 && (
            <div className="space-y-6 text-center">
              <Leaf className="mx-auto size-16 text-primary" />
              <h1 className="text-3xl font-medium tracking-tight">Avocado Style</h1>
              <p className="text-lg text-muted-foreground">
                Your personal style journey starts here. Learn to dress with confidence, one lesson at a time.
              </p>
            </div>
          )}

          {step === 1 && (
            <RadioQuestion
              prompt="What's your style goal?"
              options={goalOptions}
              selected={goal}
              onSelect={(id) => setGoal([id])}
            />
          )}

          {step === 2 && (
            <RadioQuestion
              prompt="What's your experience level?"
              options={experienceOptions}
              selected={experience}
              onSelect={(id) => setExperience([id])}
            />
          )}
        </PageContainer>
      </div>

      <PageContainer className="max-w-md px-4 pb-8">
        <Button
          onClick={handleContinue}
          disabled={!canContinue}
          size="lg"
          className="w-full"
        >
          {step === 0 ? 'Get Started' : step === 2 ? "Let's Go!" : 'Continue'}
        </Button>
      </PageContainer>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})
