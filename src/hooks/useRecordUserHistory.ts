import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'

export function useRecordUserHistory() {
  const record = useMutation((api as any).userHistory.record)

  function recordLessonWatched(slug: string) {
    return record({ actionKind: 'lesson_watched', slug, entity: 'lesson' })
  }

  function recordQuizAnswer(slug: string, correct: boolean) {
    return record({
      actionKind: correct ? 'quiz_answered_correctly' : 'quiz_answered_incorrectly',
      slug,
      entity: 'quiz',
    })
  }

  return { recordLessonWatched, recordQuizAnswer }
}
