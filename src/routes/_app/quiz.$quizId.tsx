import { createFileRoute } from '@tanstack/react-router'
import { useQuizQuery } from '@/hooks/useQuizQuery'
import { QuizContainer } from '@/components/quiz/QuizContainer'

function QuizPage() {
  const { quizId } = Route.useParams()
  const { data: quiz, isLoading, error } = useQuizQuery(quizId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-destructive">Quiz not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md">
      <QuizContainer quiz={quiz} />
    </div>
  )
}

export const Route = createFileRoute('/_app/quiz/$quizId')({
  component: QuizPage,
})
