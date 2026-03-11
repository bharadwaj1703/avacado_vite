import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { QuestionResult } from '@/types/content'

interface AnswerFeedbackProps {
  result: QuestionResult
}

export function AnswerFeedback({ result }: AnswerFeedbackProps) {
  const { correct, partial, feedback } = result

  if (correct) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">
              Correct!
            </p>
            <p className="text-sm text-green-700 dark:text-green-400">
              {feedback}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (partial) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950/30">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-300">
              Partially correct
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              {feedback}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
        <div>
          <p className="font-medium text-red-800 dark:text-red-300">
            Not quite right
          </p>
          <p className="text-sm text-red-700 dark:text-red-400">{feedback}</p>
        </div>
      </div>
    </div>
  )
}
