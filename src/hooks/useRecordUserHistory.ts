import { useRecordUserActivity } from '@/hooks/useRecordUserActivity'

export function useRecordUserHistory() {
  const { recordLessonWatched, recordQuizAnswer } = useRecordUserActivity()
  return { recordLessonWatched, recordQuizAnswer }
}
