import { useAuth } from '@clerk/clerk-react'
import { apiRequest } from '@/lib/api/client'
import type { RecordActivityInput, RecordActivityResponse } from '@/types/api'

export function useRecordUserActivity() {
  const { isSignedIn, getToken } = useAuth()

  function recordActivity(payload: RecordActivityInput): Promise<RecordActivityResponse | null> {
    if (!isSignedIn) return Promise.resolve(null)

    return apiRequest<RecordActivityResponse>('/api/activities', {
      method: 'POST',
      tokenProvider: () => getToken(),
      body: payload,
    }).catch(() => null)
  }

  function recordLessonWatched(slug: string) {
    return recordActivity({ actionKind: 'lesson_watched', slug, entity: 'lesson' })
  }

  function recordQuizAnswer(slug: string, correct: boolean) {
    return recordActivity({
      actionKind: correct ? 'quiz_answered_correctly' : 'quiz_answered_incorrectly',
      slug,
      entity: 'quiz',
    })
  }

  return { recordActivity, recordLessonWatched, recordQuizAnswer }
}
