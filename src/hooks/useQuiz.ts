import { useReducer } from 'react'
import type { Quiz, QuizState, QuizAction } from '@/types/quiz'

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_ANSWER': {
      const current = state.answers[action.questionId] ?? []
      let next: string[]
      if (action.questionType === 'single') {
        next = [action.optionId]
      } else {
        next = current.includes(action.optionId)
          ? current.filter((id) => id !== action.optionId)
          : [...current, action.optionId]
      }
      return { ...state, answers: { ...state.answers, [action.questionId]: next } }
    }
    case 'NEXT':
      return { ...state, currentIndex: state.currentIndex + 1 }
    case 'PREV':
      return { ...state, currentIndex: Math.max(0, state.currentIndex - 1) }
    case 'RESET':
      return { currentIndex: 0, answers: {} }
  }
}

export function useQuiz(quiz: Quiz) {
  const [state, dispatch] = useReducer(quizReducer, { currentIndex: 0, answers: {} })

  const currentQuestion = quiz.questions[state.currentIndex]
  const totalQuestions = quiz.questions.length
  const progress = totalQuestions > 0 ? ((state.currentIndex) / totalQuestions) * 100 : 0
  const selectedAnswers = currentQuestion ? (state.answers[currentQuestion.id] ?? []) : []
  const canContinue = selectedAnswers.length > 0
  const isComplete = state.currentIndex >= totalQuestions
  const isFirst = state.currentIndex === 0

  return {
    state,
    currentQuestion,
    totalQuestions,
    progress,
    selectedAnswers,
    canContinue,
    isComplete,
    isFirst,
    dispatch,
  }
}
