import type { Unit } from '@/types/quiz'
import type { Lesson } from '@/types/content'
import { LessonCard } from './LessonCard'

interface UnitSectionProps {
  unit: Unit
  milestoneId?: string
  levelId?: string
}

export function UnitSection({ unit, milestoneId = '01-ai-foundations', levelId = '01-intro-to-ai' }: UnitSectionProps) {
  return (
    <div className="space-y-1">
      <div className="rounded-xl bg-secondary px-4 py-3">
        <h3 className="text-sm font-bold text-secondary-foreground">{unit.title}</h3>
        <p className="text-xs text-muted-foreground">{unit.description}</p>
      </div>
      <div className="flex flex-col items-center py-2">
        {unit.lessons.map((lesson, i) => {
          const contentLesson: Lesson = {
            id: lesson.id,
            title: lesson.title,
            description: '',
            order: i,
            screen_refs: [],
          }
          return (
            <LessonCard
              key={lesson.id}
              milestoneId={milestoneId}
              levelId={levelId}
              lesson={contentLesson}
              isLocked={lesson.status === 'locked'}
              isCurrent={lesson.status === 'current'}
              isComplete={lesson.status === 'completed'}
              progress={lesson.status === 'completed' ? 100 : lesson.status === 'current' ? 50 : 0}
            />
          )
        })}
      </div>
    </div>
  )
}
