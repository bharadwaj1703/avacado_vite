import { createFileRoute } from '@tanstack/react-router'
import { useLesson } from '@/hooks/useContentManifest'
import { contentManifest } from '@/hooks/useContentManifest'
import { LessonPlayer } from '@/components/lesson/LessonPlayer'
import { Button } from '@/components/ui/button'
import { useProgressStore } from '@/store/progress'
import { RequireOnboardingComplete } from '@/components/auth/AuthGuards'

export const Route = createFileRoute('/lesson/$milestoneId/$levelId/$lessonId')({
  component: LessonRouteWrapper,
  beforeLoad: ({ params }) => {
    // Check if lesson is unlocked
    const isUnlocked = useProgressStore.getState().isLessonUnlocked(
      params.milestoneId,
      params.levelId,
      params.lessonId,
      contentManifest
    )

    if (!isUnlocked) {
      throw new Error('LESSON_LOCKED')
    }
  },
  errorComponent: ({ error }) => {
    // Use window.location to get params since Route.useParams isn't available in errorComponent
    const pathParts = window.location.pathname.split('/')
    const milestoneId = pathParts[2] || ''
    const levelId = pathParts[3] || ''

    if (error.message === 'LESSON_LOCKED') {
      return (
        <div className="flex h-dvh flex-col items-center justify-center gap-4 p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold">Lesson Locked</h1>
            <p className="text-muted-foreground">
              Complete the previous lessons to unlock this one.
            </p>
          </div>
          <a href={`/learn/${milestoneId}/${levelId}`}>
            <Button>Back to Level</Button>
          </a>
        </div>
      )
    }

    throw error
  },
})

function LessonRouteWrapper() {
  return (
    <RequireOnboardingComplete>
      <LessonRoute />
    </RequireOnboardingComplete>
  )
}

function LessonRoute() {
  const { milestoneId, levelId, lessonId } = Route.useParams()
  const lesson = useLesson(milestoneId, levelId, lessonId)

  if (!lesson) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Lesson Not Found</h1>
          <p className="text-muted-foreground">This lesson doesn't exist.</p>
        </div>
        <a href={`/learn/${milestoneId}/${levelId}`}>
          <Button>Back to Level</Button>
        </a>
      </div>
    )
  }

  return (
    <LessonPlayer
      milestoneId={milestoneId}
      levelId={levelId}
      lesson={lesson}
      manifest={contentManifest}
    />
  )
}
