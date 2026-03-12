import { createFileRoute, Link } from '@tanstack/react-router'
import { useMilestone, useLevels } from '@/hooks/useContentManifest'
import { useGating } from '@/store/progress'
import { contentManifest } from '@/hooks/useContentManifest'
import { Lock, PlayCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/_app/learn/$milestoneId/')({
  component: MilestoneIndex,
})

function MilestoneIndex() {
  const { milestoneId } = Route.useParams()
  const milestone = useMilestone(milestoneId)
  const levels = useLevels(milestoneId)
  const gating = useGating(contentManifest)

  if (!milestone) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold">Milestone Not Found</h1>
          <p className="text-muted-foreground">This milestone doesn't exist.</p>
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
          <span className="text-foreground">{milestone.title}</span>
        </div>
        <h1 className="text-2xl font-bold">{milestone.title}</h1>
        <p className="text-muted-foreground">{milestone.description}</p>
      </div>

      {/* Levels */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Levels</h2>
        <div className="grid gap-3">
          {levels.map((level, index) => {
            const isUnlocked = gating.isLevelUnlocked(milestoneId, level.id)
            const isLocked = !isUnlocked

            return (
              <div
                key={level.id}
                className={`transition-opacity ${isLocked ? 'pointer-events-none opacity-60' : ''}`}
              >
                {isUnlocked ? (
                  <Link to="/learn/$milestoneId/$levelId" params={{ milestoneId, levelId: level.id }}>
                    <Card className="hover:border-primary cursor-pointer">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold">{level.title}</h3>
                          <p className="truncate text-sm text-muted-foreground">
                            {level.description}
                          </p>
                        </div>
                        <div className="shrink-0">
                          <PlayCircle className="size-5 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Card className="grayscale">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold">{level.title}</h3>
                        <p className="truncate text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <Lock className="size-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
