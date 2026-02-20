import type { Unit } from '@/types/quiz'
import { LessonCard } from './LessonCard'

interface UnitSectionProps {
  unit: Unit
}

const offsets: Array<'left' | 'center' | 'right'> = ['center', 'right', 'center', 'left']

export function UnitSection({ unit }: UnitSectionProps) {
  return (
    <div className="space-y-1">
      <div className="rounded-xl bg-secondary px-4 py-3">
        <h3 className="text-sm font-bold text-secondary-foreground">{unit.title}</h3>
        <p className="text-xs text-muted-foreground">{unit.description}</p>
      </div>
      <div className="flex flex-col items-center py-2">
        {unit.lessons.map((lesson, i) => (
          <LessonCard key={lesson.id} lesson={lesson} offset={offsets[i % offsets.length]} />
        ))}
      </div>
    </div>
  )
}
