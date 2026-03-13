import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { animate } from 'animejs'
import { ChevronLeft } from 'lucide-react'
import { CATEGORIES, PLACEHOLDER_LESSONS } from './category-data'

export function ExploreCategoryPage({ categoryId }: { categoryId: string }) {
  const mountedRef = useRef(false)
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0]
  const lessons = PLACEHOLDER_LESSONS[categoryId] ?? PLACEHOLDER_LESSONS['all']
  const Icon = category.icon

  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-blue-400 to-indigo-500',
    'from-purple-400 to-pink-500',
    'from-amber-400 to-orange-500',
  ]

  const setRef = (el: HTMLDivElement | null) => {
    if (el && !mountedRef.current) {
      mountedRef.current = true
      const cards = el.querySelectorAll('.explore-card')
      animate(cards, {
        y: [30, 0],
        opacity: [0, 1],
        duration: 600,
        delay: (_el, i: number) => i * 100,
        ease: 'outExpo',
      })
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          className="flex size-8 items-center justify-center rounded-full bg-muted"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-medium">{category.label}</h1>
      </div>

      <div ref={setRef} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {lessons.map((lesson, i) => (
          <div
            key={`${i}-${lesson.title}`}
            className="explore-card overflow-hidden rounded-2xl border border-border opacity-0"
          >
            <div
              className={`flex h-28 items-center justify-center bg-gradient-to-br ${gradients[i % gradients.length]}`}
            >
              <Icon className="size-10 text-white/80" />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-semibold">{lesson.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {lesson.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
