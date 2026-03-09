import type { Quiz } from '@/types/quiz'
import { useQuiz } from '@/hooks/useQuiz'
import { QuizProgress } from './QuizProgress'
import { RadioQuestion } from './RadioQuestion'
import { CheckboxQuestion } from './CheckboxQuestion'
import { Button } from '@/components/ui/button'
import { Trophy } from 'lucide-react'

interface QuizContainerProps {
  quiz: Quiz
}

export function QuizContainer({ quiz }: QuizContainerProps) {
  const { currentQuestion, totalQuestions, progress, selectedAnswers, canContinue, isComplete, isFirst, state, dispatch } = useQuiz(quiz)

  if (isComplete) {
    const answeredCount = Object.keys(state.answers).length
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <Trophy className="size-16 text-primary" />
        <h2 className="text-2xl font-medium tracking-tight">Quiz Complete!</h2>
        <p className="text-muted-foreground">
          You answered {answeredCount} of {totalQuestions} questions
        </p>
        <Button onClick={() => dispatch({ type: 'RESET' })} size="lg" className="w-full max-w-xs">
          Try Again
        </Button>
      </div>
    )
  }

  const handleSelect = (optionId: string) => {
    dispatch({
      type: 'SELECT_ANSWER',
      questionId: currentQuestion.id,
      optionId,
      questionType: currentQuestion.type,
    })
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <div className="space-y-2">
        <QuizProgress progress={progress} />
        <p className="text-xs text-muted-foreground">
          Question {state.currentIndex + 1} of {totalQuestions}
        </p>
      </div>

      {currentQuestion.type === 'single' ? (
        <RadioQuestion
          prompt={currentQuestion.prompt}
          options={currentQuestion.options}
          selected={selectedAnswers}
          onSelect={handleSelect}
        />
      ) : (
        <CheckboxQuestion
          prompt={currentQuestion.prompt}
          options={currentQuestion.options}
          selected={selectedAnswers}
          onSelect={handleSelect}
        />
      )}

      <div className="sticky bottom-20 flex gap-3 bg-background pb-4 pt-2">
        {!isFirst && (
          <Button variant="outline" onClick={() => dispatch({ type: 'PREV' })} className="flex-1">
            Back
          </Button>
        )}
        <Button
          onClick={() => dispatch({ type: 'NEXT' })}
          disabled={!canContinue}
          className="flex-1"
        >
          {state.currentIndex === totalQuestions - 1 ? 'Finish' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
