import { Link } from '@tanstack/react-router'
import type { Lesson } from '@/types/quiz'
import {
  Shirt,
  Palette,
  Ruler,
  Scissors,
  type LucideIcon,
  Gem,
  Layers,
  Watch,
  Grid3X3,
  Leaf,
  Sparkles,
} from 'lucide-react'
import { MascotBlob } from '@/components/mascot/MascotBlob'

const iconMap: Record<string, LucideIcon> = {
  shirt: Shirt,
  palette: Palette,
  ruler: Ruler,
  scissors: Scissors,
  gem: Gem,
  layers: Layers,
  watch: Watch,
  grid: Grid3X3,
  leaf: Leaf,
  sparkles: Sparkles,
}

interface LessonCardProps {
  lesson: Lesson
  offset: 'left' | 'center' | 'right'
}

export function LessonCard({ lesson, offset }: LessonCardProps) {
  const offsetClass = {
    left: '-translate-x-6',
    center: 'translate-x-0',
    right: 'translate-x-6',
  }[offset]

  const statusStyles = {
    completed: 'bg-primary text-primary-foreground shadow-md',
    current: 'border-2 border-primary bg-background text-primary shadow-md animate-pulse',
    locked: 'bg-muted text-muted-foreground opacity-60',
  }[lesson.status]

  const IconComponent = iconMap[lesson.icon] ?? Shirt

  const isCurrent = lesson.status === 'current'

  const node = (
    <div className={`relative ${offsetClass}`}>
      <div
        className={`flex h-16 w-16 flex-col items-center justify-center rounded-full transition-transform ${statusStyles}`}
      >
        <IconComponent className="size-5" />
        <span className="text-[10px] font-medium leading-tight">{lesson.title.split(' ')[0]}</span>
      </div>
      {isCurrent && (
        <div className="absolute -right-32 -top-10 h-[130px] aspect-[500/520]">
          <MascotBlob
            bodyMode="static"
            staticBaseScale={1.8}
            staticInnerScale={1.0}
            faceScale={1.3}
            faceOffsetY={-35}
            eyeVariant="regular"
            mouthVariant="smile"
          />
        </div>
      )}
    </div>
  )

  if (lesson.status === 'locked' || !lesson.quizId) {
    return <div className="flex justify-center py-2">{node}</div>
  }

  return (
    <Link to="/quiz/$quizId" params={{ quizId: lesson.quizId }} className="flex justify-center py-2">
      {node}
    </Link>
  )
}
