import { useQuery } from '@tanstack/react-query'
import { sampleQuizzes } from '@/data/sampleQuiz'
import { sampleUnits, streakCount } from '@/data/sampleLessons'

export function useQuizQuery(quizId: string) {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => {
      const quiz = sampleQuizzes[quizId]
      if (!quiz) throw new Error(`Quiz "${quizId}" not found`)
      return quiz
    },
  })
}

export function useLessonsQuery() {
  return useQuery({
    queryKey: ['lessons'],
    queryFn: () => ({ units: sampleUnits, streakCount }),
  })
}
