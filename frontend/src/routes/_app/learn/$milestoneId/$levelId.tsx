import { createFileRoute } from '@tanstack/react-router'
import { useMilestone, useLevel, useLessons } from '@/hooks/useContentManifest'
import { useGating, useLessonProgress } from '@/store/progress'
import { contentManifest } from '@/hooks/useContentManifest'
import { Lock, CheckCircle2, PlayCircle, Star, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/learn/$milestoneId/$levelId')({
  component: LevelDetail,
})

function LevelDetail() {
  const { milestoneId, levelId } = Route.useParams()
  const milestone = useMilestone(milestoneId)
  const level = useLevel(milestoneId, levelId)
  const lessons = useLessons(milestoneId, levelId)
  const gating = useGating(contentManifest)

  if (!milestone || !level) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Level Not Found</h1>
          <p className="text-muted-foreground">This level doesn't exist.</p>
          <a href="/learn">
            <Button className="mt-4">Back to Learning Path</Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/learn" className="hover:text-foreground">
            Learning Path
          </a>
          <ChevronRight className="size-4" />
          <a href={`/learn/${milestoneId}`} className="hover:text-foreground">
            {milestone.title}
          </a>
          <ChevronRight className="size-4" />
          <span className="text-foreground">{level.title}</span>
        </div>
        <h1 className="text-2xl font-bold">{level.title}</h1>
        <p className="text-muted-foreground">{level.description}</p>
      </div>

      {/* Lessons */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <div className="grid gap-3">
          {lessons.map((lesson) => {
            const isUnlocked = gating.isLessonUnlocked(milestoneId, levelId, lesson.id)
            const isLocked = !isUnlocked

            return (
              <LessonCard
                key={lesson.id}
                milestoneId={milestoneId}
                levelId={levelId}
                lesson={lesson}
                isLocked={isLocked}
                isUnlocked={isUnlocked}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

interface LessonCardProps {
  milestoneId: string
  levelId: string
  lesson: { id: string; title: string; description: string; estimated_duration_minutes?: number }
  isLocked: boolean
  isUnlocked: boolean
}

function LessonCard({
  milestoneId,
  levelId,
  lesson,
  isLocked,
  isUnlocked,
}: LessonCardProps) {
  const progress = useLessonProgress(milestoneId, levelId, lesson.id)
  const isComplete = progress.isComplete
  const score = progress.result?.score

  return (
    <div
      className={`transition-opacity ${isLocked ? 'pointer-events-none opacity-60' : ''}`}
    >
      {isUnlocked ? (
        <a href={`/lesson/${milestoneId}/${levelId}/${lesson.id}`}>
          <Card className="hover:border-primary cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                  isComplete
                    ? 'bg-green-100 text-green-700'
                    : isUnlocked
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="size-6" />
                ) : (
                  <PlayCircle className="size-6" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{lesson.title}</h3>
                  {isComplete && score !== undefined && (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-green-600">
                      <Star className="size-3 fill-current" />
                      {Math.round(score * 100)}%
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {lesson.description}
                </p>
                {lesson.estimated_duration_minutes && (
                  <p className="text-xs text-muted-foreground">
                    ~{lesson.estimated_duration_minutes} min
                  </p>
                )}
              </div>

              <div className="shrink-0">
                {isLocked && <Lock className="size-5 text-muted-foreground" />}
              </div>
            </CardContent>
          </Card>
        </a>
      ) : (
        <Card className="grayscale">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Lock className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">{lesson.title}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {lesson.description}
              </p>
              {lesson.estimated_duration_minutes && (
                <p className="text-xs text-muted-foreground">
                  ~{lesson.estimated_duration_minutes} min
                </p>
              )}
            </div>

            <div className="shrink-0">
              <Lock className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
