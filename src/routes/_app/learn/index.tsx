import { createFileRoute, Link } from '@tanstack/react-router'
import { useMilestones } from '@/hooks/useContentManifest'
import { useGating } from '@/store/progress'
import { contentManifest } from '@/hooks/useContentManifest'
import { Lock, PlayCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_app/learn/')({
  component: LearnIndex,
})

function LearnIndex() {
  const milestones = useMilestones()
  const gating = useGating(contentManifest)

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Learning Path</h1>
        <p className="text-muted-foreground">
          Master AI through structured milestones and lessons
        </p>
      </div>

      <div className="grid gap-4">
        {milestones.map((milestone) => {
          const isUnlocked = gating.isMilestoneUnlocked(milestone.id)
          const isLocked = !isUnlocked

          return (
            <div
              key={milestone.id}
              className={`transition-opacity ${isLocked ? 'pointer-events-none opacity-60' : ''}`}
            >
              {isUnlocked ? (
                <Link to="/learn/$milestoneId" params={{ milestoneId: milestone.id }}>
                  <Card className="hover:border-primary cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {milestone.description}
                          </p>
                        </div>
                        <div className="rounded-full bg-muted p-2">
                          <PlayCircle className="size-5 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {milestone.level_refs.length} levels
                        </span>
                        {milestone.color_theme && (
                          <span
                            className="size-3 rounded-full"
                            style={{ backgroundColor: milestone.color_theme }}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="grayscale">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {milestone.description}
                        </p>
                      </div>
                      <div className="rounded-full bg-muted p-2">
                        <Lock className="size-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {milestone.level_refs.length} levels
                      </span>
                      {milestone.color_theme && (
                        <span
                          className="size-3 rounded-full"
                          style={{ backgroundColor: milestone.color_theme }}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
