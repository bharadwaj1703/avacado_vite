import { useMutation } from 'convex/react'
import { useAuth } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'
import { isConvexSkipped } from '@/lib/convex-skip'

export function useRecordUserHistory() {
  const { isSignedIn } = useAuth()
  const skipConvex = isConvexSkipped()
  const record = useMutation(api.userHistory.record)

  function recordLessonWatched(slug: string) {
    if (!isSignedIn || skipConvex) return Promise.resolve(null)
    return record({ actionKind: 'lesson_watched', slug, entity: 'lesson' })
  }

  function recordQuizAnswer(slug: string, correct: boolean) {
    if (!isSignedIn || skipConvex) return Promise.resolve(null)
    return record({
      actionKind: correct ? 'quiz_answered_correctly' : 'quiz_answered_incorrectly',
      slug,
      entity: 'quiz',
    })
  }

  return { recordLessonWatched, recordQuizAnswer }
}
