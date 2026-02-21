import { useState, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { OnboardingRouteGuard } from '@/components/auth/AuthGuards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioQuestion } from '@/components/quiz/RadioQuestion'
import { OnboardingProgressBar } from '@/components/onboarding/OnboardingProgressBar'
import { OnboardingMascotBubble } from '@/components/onboarding/OnboardingMascotBubble'
import { OnboardingErrorBoundary } from '@/components/onboarding/OnboardingErrorBoundary'
import { PageContainer } from '@/components/layout/PageContainer'
import { MascotBlob } from '@/components/mascot/MascotBlob'
import { DEFAULT_OUTER_BLOBS } from '@/components/mascot/mascot-blob-config'
import { animate, createScope } from 'animejs'
import type { Option } from '@/types/quiz'
import { isConvexSkipped } from '@/lib/convex-skip'

type Profession = 'student' | 'freelancer' | 'founder' | 'business_owner' | 'working_professional' | 'others'
type StepKey = 'profession' | 'companyWebsite' | 'jobTitle' | 'aiKnowledge' | 'timeCommitment' | 'preferredTiming'

const PROFESSION_OPTIONS: Option[] = [
  { id: 'student', text: 'Student' },
  { id: 'freelancer', text: 'Freelancer' },
  { id: 'founder', text: 'Founder' },
  { id: 'business_owner', text: 'Business owner' },
  { id: 'working_professional', text: 'Working professional' },
  { id: 'others', text: 'Others' },
]

const AI_KNOWLEDGE_OPTIONS: Option[] = [
  { id: '0', text: 'I am not sure' },
  { id: '1', text: 'Beginner' },
  { id: '2', text: 'Basic' },
  { id: '3', text: 'Intermediate' },
  { id: '4', text: 'Advanced' },
]

const TIME_SPAN_OPTIONS = [5, 10, 15, 20, 30] as const
const FREQUENCY_OPTIONS: Option[] = [
  { id: 'daily', text: 'Daily' },
  { id: 'weekly', text: 'Weekly' },
  { id: 'weekend', text: 'Weekend' },
  { id: 'monthly', text: 'Monthly' },
]

const TIMING_OPTIONS: Option[] = [
  { id: 'morning', text: 'Morning' },
  { id: 'lunch', text: 'Afternoon' },
  { id: 'evening', text: 'Evening' },
  { id: 'night', text: 'Night' },
]

function buildSteps(profession: Profession | null): StepKey[] {
  const steps: StepKey[] = ['profession']
  if (profession && profession !== 'student') steps.push('companyWebsite')
  if (profession === 'working_professional') steps.push('jobTitle')
  steps.push('aiKnowledge', 'timeCommitment', 'preferredTiming')
  return steps
}

type OnboardingPhase = 'steps' | 'saving' | 'celebration' | 'exiting'

function OnboardingPage() {
  const navigate = useNavigate()
  const updateOnboarding = useMutation((api as any).users.updateOnboarding)

  const [phase, setPhase] = useState<OnboardingPhase>('steps')
  const [profession, setProfession] = useState<Profession | null>(null)
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [aiKnowledge, setAiKnowledge] = useState<string>('')
  const [timeSpan, setTimeSpan] = useState<5 | 10 | 15 | 20 | 30 | null>(null)
  const [frequency, setFrequency] = useState<string>('')
  const [preferredTiming, setPreferredTiming] = useState<string>('')

  const steps = buildSteps(profession)
  const [stepIndex, setStepIndex] = useState(0)
  const currentStepKey = steps[stepIndex]
  const totalSteps = steps.length
  const isLastStep = stepIndex === totalSteps - 1

  const completionRootRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null)

  async function handleContinue() {
    if (isLastStep) {
      setPhase('saving')
      if (isConvexSkipped()) {
        setPhase('celebration')
        return
      }
      const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
      try {
        await updateOnboarding({
          profession: profession ?? undefined,
          companyWebsite: companyWebsite.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          selfReportedAiKnowledge: aiKnowledge === '' ? undefined : (Number(aiKnowledge) as 0 | 1 | 2 | 3 | 4),
          timeCommitmentSpan: timeSpan ?? undefined,
          timeCommitmentFrequency: frequency || undefined,
          preferredTiming: preferredTiming || undefined,
          timezone,
          completed: true,
        })
        setPhase('celebration')
      } catch {
        setPhase('steps')
      }
      return
    }
    setStepIndex(stepIndex + 1)
  }

  function handleSkip() {
    setStepIndex(stepIndex + 1)
  }

  const canContinue =
    currentStepKey === 'profession'
      ? !!profession
      : currentStepKey === 'companyWebsite'
        ? true
        : currentStepKey === 'jobTitle'
          ? true
          : currentStepKey === 'aiKnowledge'
            ? true
            : currentStepKey === 'timeCommitment'
              ? timeSpan !== null && !!frequency
              : currentStepKey === 'preferredTiming'
                ? !!preferredTiming
                : false

  function handleCtaClick() {
    if (phase !== 'celebration') return
    setPhase('exiting')
    const root = completionRootRef.current
    if (!root) {
      navigate({ to: '/dashboard' })
      return
    }
    const scope = scopeRef.current
    if (scope?.methods?.exit) {
      scope.methods.exit()
      window.setTimeout(() => navigate({ to: '/dashboard' }), 450)
    } else {
      navigate({ to: '/dashboard' })
    }
  }

  if (phase === 'saving') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Setting up your plan...</p>
      </div>
    )
  }

  if (phase === 'celebration' || phase === 'exiting') {
    return (
      <OnboardingCompleteScreen
        rootRef={completionRootRef}
        scopeRef={scopeRef}
        phase={phase}
        onCtaClick={handleCtaClick}
      />
    )
  }

  const stepQuestion =
    currentStepKey === 'profession'
      ? 'What describes you the best?'
      : currentStepKey === 'companyWebsite'
        ? 'Does your company have a website?'
        : currentStepKey === 'jobTitle'
          ? 'What is your job title?'
          : currentStepKey === 'aiKnowledge'
            ? 'How well do you understand AI?'
            : currentStepKey === 'timeCommitment'
              ? 'How much time can you take out to learn AI?'
              : currentStepKey === 'preferredTiming'
                ? 'When do you learn the best?'
                : ''

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="fixed top-0 left-0 right-0 z-10 flex flex-col border-b border-border bg-background">
        <OnboardingProgressBar totalSteps={totalSteps} currentStep={stepIndex} />
        <div className="flex min-h-[100px] items-center px-4 py-3">
          <OnboardingMascotBubble question={stepQuestion} variant="header" className="w-full" />
        </div>
      </header>

      <div className="flex flex-1 flex-col justify-center px-4 pt-[140px] pb-6">
        <PageContainer className="max-w-md space-y-6">
          {currentStepKey === 'profession' && (
            <>
              <RadioQuestion
                prompt=""
                options={PROFESSION_OPTIONS}
                selected={profession ? [profession] : []}
                onSelect={(id) => setProfession(id as Profession)}
              />
            </>
          )}

          {currentStepKey === 'companyWebsite' && (
            <>
              <Input
                placeholder="https://..."
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                className="mt-2"
              />
            </>
          )}

          {currentStepKey === 'jobTitle' && (
            <>
              <Input
                placeholder="e.g. Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="mt-2"
              />
            </>
          )}

          {currentStepKey === 'aiKnowledge' && (
            <>
              <RadioQuestion
                prompt=""
                options={AI_KNOWLEDGE_OPTIONS}
                selected={aiKnowledge ? [aiKnowledge] : []}
                onSelect={setAiKnowledge}
              />
            </>
          )}

          {currentStepKey === 'timeCommitment' && (
            <>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {TIME_SPAN_OPTIONS.map((m) => (
                    <Button
                      key={m}
                      type="button"
                      variant={timeSpan === m ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTimeSpan(m)}
                    >
                      {m} mins
                    </Button>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-muted-foreground">How often?</p>
                  <RadioQuestion
                    prompt=""
                    options={FREQUENCY_OPTIONS}
                    selected={frequency ? [frequency] : []}
                    onSelect={setFrequency}
                  />
                </div>
              </div>
            </>
          )}

          {currentStepKey === 'preferredTiming' && (
            <>
              <RadioQuestion
                prompt=""
                options={TIMING_OPTIONS}
                selected={preferredTiming ? [preferredTiming] : []}
                onSelect={setPreferredTiming}
              />
            </>
          )}
        </PageContainer>
      </div>

      <PageContainer className="max-w-md px-4 pb-8">
        <div className="flex flex-col gap-3">
          {currentStepKey === 'companyWebsite' && (
            <Button variant="outline" size="lg" className="w-full" onClick={handleSkip}>
              Skip
            </Button>
          )}
          <Button onClick={handleContinue} disabled={!canContinue} size="lg" className="w-full">
            {isLastStep ? "Let's go!" : 'Continue'}
          </Button>
        </div>
      </PageContainer>
    </div>
  )
}

function OnboardingCompleteScreen({
  rootRef,
  scopeRef,
  onCtaClick,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>
  scopeRef: React.MutableRefObject<ReturnType<typeof createScope> | null>
  phase: OnboardingPhase
  onCtaClick: () => void
}) {
  const mountedRef = useRef(false)
  const setRef = (el: HTMLDivElement | null) => {
    ;(rootRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    if (el && !mountedRef.current) {
      mountedRef.current = true
      scopeRef.current = createScope({ root: el }).add((self) => {
        animate('.ob-mascot', { y: [80, 0], opacity: [0, 1], duration: 700, ease: 'outExpo' })
        animate('.ob-shine', { scale: [0.8, 1.2], opacity: [0, 0.6], duration: 900, delay: 200, ease: 'outExpo' })
        self?.add('exit', () => {
          animate('.ob-mascot', { y: 120, opacity: 0, duration: 400, ease: 'inExpo' })
          animate('.ob-shine', { scale: 1.5, opacity: 0, duration: 400 })
        })
      })
    }
  }

  return (
    <div ref={setRef} className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4">
      <div
        className="ob-shine absolute -z-10 h-[300px] w-[300px] rounded-full bg-(--onboarding-fill) opacity-0 blur-3xl"
        style={{ transform: 'scale(0.8)' }}
      />
      <div className="ob-mascot flex justify-center">
        <CompletionMascot />
      </div>
      <p className="mt-6 text-center text-lg font-medium">Your personal plan is ready</p>
      <Button
        size="lg"
        className="mt-6 w-full max-w-xs bg-black text-white hover:bg-black/90"
        onClick={onCtaClick}
      >
        Your Personal Plan is Ready
      </Button>
    </div>
  )
}

function CompletionMascot() {
  return (
    <MascotBlob
      className="w-40"
      bodyMode="static"
      staticBaseScale={1.3}
      staticBaseOffsetX={0}
      staticBaseOffsetY={0}
      staticInnerScale={1}
      eyeVariant="excited"
      mouthVariant="grin"
      outerBlobs={DEFAULT_OUTER_BLOBS}
      innerScale={0.78}
      innerOffsetY={-8}
      faceOffsetX={0}
      faceOffsetY={-35}
      faceSpacing={1}
      faceScale={1.1}
      animationEnabled={false}
      animationSpeed={1}
      animationAmplitude={8}
      grainEnabled={false}
      grainFrequency={0.65}
      grainOctaves={4}
      grainContrast={200}
      grainBrightness={150}
      grainScale={1}
    />
  )
}

/** Fallback when Convex hooks throw (e.g. backend not deployed): show message and let user continue */
function OnboardingFallback() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4">
      <p className="text-center text-muted-foreground">
        Having trouble connecting. You can continue to the app and finish setup later.
      </p>
      <Button size="lg" className="w-full max-w-xs" onClick={() => navigate({ to: '/dashboard' })}>
        Continue to app
      </Button>
    </div>
  )
}

export const Route = createFileRoute('/onboarding')({
  component: () => (
    <OnboardingErrorBoundary fallback={<OnboardingFallback />}>
      <OnboardingRouteGuard>
        <OnboardingPage />
      </OnboardingRouteGuard>
    </OnboardingErrorBoundary>
  ),
})
