import { useReducer, useCallback } from 'react'
import type { Question, QuestionResult, QuizConfig, AssessmentResult } from '@/types/content'
import { QuestionRenderer } from './questions/QuestionRenderer'
import { Assessment } from './Assessment'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { assessQuiz } from '@/lib/scoring'

// ============================================================================
// Types
// ============================================================================

interface QuizRunnerProps {
  questions: Question[]
  config: QuizConfig
  onComplete: (result: AssessmentResult) => void
  onRetry?: () => void
  onAnswerRecord?: (correct: boolean) => void
}

interface QuizState {
  currentIndex: number
  answers: Record<string, unknown>
  submittedQuestions: Set<string>
  results: Record<string, QuestionResult>
  isComplete: boolean
  assessmentResult: AssessmentResult | null
}

type QuizAction =
  | { type: 'SUBMIT_ANSWER'; questionId: string; answer: unknown; result: QuestionResult }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'COMPLETE_QUIZ'; result: AssessmentResult }
  | { type: 'RESET_QUIZ' }

// ============================================================================
// Reducer
// ============================================================================

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
        submittedQuestions: new Set(state.submittedQuestions).add(action.questionId),
        results: { ...state.results, [action.questionId]: action.result },
      }
    case 'NEXT_QUESTION':
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, Object.keys(state.answers).length),
      }
    case 'PREV_QUESTION':
      return {
        ...state,
        currentIndex: Math.max(state.currentIndex - 1, 0),
      }
    case 'COMPLETE_QUIZ':
      return {
        ...state,
        isComplete: true,
        assessmentResult: action.result,
      }
    case 'RESET_QUIZ':
      return {
        currentIndex: 0,
        answers: {},
        submittedQuestions: new Set<string>(),
        results: {},
        isComplete: false,
        assessmentResult: null,
      }
    default:
      return state
  }
}

// ============================================================================
// Component
// ============================================================================

export function QuizRunner({ questions, config, onComplete, onRetry, onAnswerRecord }: QuizRunnerProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    currentIndex: 0,
    answers: {},
    submittedQuestions: new Set<string>(),
    results: {},
    isComplete: false,
    assessmentResult: null,
  })

  const currentQuestion = questions[state.currentIndex]
  const isLastQuestion = state.currentIndex === questions.length - 1
  const hasSubmittedCurrent = currentQuestion
    ? state.submittedQuestions.has(currentQuestion.id)
    : false

  const handleSubmit = useCallback(
    (result: QuestionResult, answer: unknown) => {
      if (!currentQuestion) return

      onAnswerRecord?.(result.correct)
      dispatch({
        type: 'SUBMIT_ANSWER',
        questionId: currentQuestion.id,
        answer,
        result,
      })
    },
    [currentQuestion, onAnswerRecord]
  )

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      // Calculate assessment and complete
      const assessment = assessQuiz(questions, state.answers, config.minimum_passing_score)
      dispatch({ type: 'COMPLETE_QUIZ', result: assessment })
      onComplete(assessment)
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }, [isLastQuestion, questions, state.answers, config.minimum_passing_score, onComplete])

  const handleRetry = useCallback(() => {
    dispatch({ type: 'RESET_QUIZ' })
    onRetry?.()
  }, [onRetry])

  // Show assessment when complete
  if (state.isComplete && state.assessmentResult) {
    return (
      <Assessment
        result={state.assessmentResult}
        onContinue={() => onComplete(state.assessmentResult!)}
        onRetry={config.allow_retry ? handleRetry : undefined}
      />
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">No questions available</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Progress Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Question {state.currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((state.submittedQuestions.size / questions.length) * 100)}% complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{
              width: `${(state.submittedQuestions.size / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1">
        <QuestionRenderer
          question={currentQuestion}
          onSubmit={handleSubmit}
          submitted={hasSubmittedCurrent}
        />
      </div>

      {/* Navigation */}
      {hasSubmittedCurrent && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleNext}>
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
