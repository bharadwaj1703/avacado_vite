import { CheckCircle2, XCircle, RotateCcw, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AssessmentResult } from '@/types/content'
import { formatScore, getScoreColor, getPassFailMessage } from '@/lib/scoring'

interface AssessmentProps {
  result: AssessmentResult
  onContinue: () => void
  onRetry?: () => void
}

export function Assessment({ result, onContinue, onRetry }: AssessmentProps) {
  const { score, passed, breakdown, pointsEarned, totalPoints } = result
  const scoreColor = getScoreColor(score)

  const scoreBgClass = {
    green: 'bg-green-50 border-green-200 text-green-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-900',
  }[scoreColor]

  const scoreTextClass = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  }[scoreColor]

  const scoreRingClass = {
    green: 'stroke-green-500',
    yellow: 'stroke-yellow-500',
    red: 'stroke-red-500',
  }[scoreColor]

  // Calculate circle progress
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - score * circumference

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
      {/* Score Circle */}
      <div className="relative">
        <svg className="size-32 -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`${scoreRingClass} transition-all duration-1000`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${scoreTextClass}`}>
            {formatScore(score)}
          </span>
          <span className="text-xs text-muted-foreground">
            {pointsEarned}/{totalPoints} pts
          </span>
        </div>
      </div>

      {/* Pass/Fail Message */}
      <div className={`rounded-xl border-2 p-4 text-center ${scoreBgClass}`}>
        <div className="mb-2 flex justify-center">
          {passed ? (
            <CheckCircle2 className="size-8 text-green-600" />
          ) : (
            <XCircle className="size-8 text-red-600" />
          )}
        </div>
        <h3 className="mb-1 text-lg font-bold">
          {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
        </h3>
        <p className="text-sm opacity-90">{getPassFailMessage(passed, score)}</p>
      </div>

      {/* Breakdown */}
      <div className="w-full max-w-sm rounded-lg border bg-card p-4">
        <h4 className="mb-3 text-sm font-medium">Question Breakdown</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-green-50 p-2">
            <div className="text-lg font-bold text-green-600">{breakdown.correct}</div>
            <div className="text-xs text-green-700">Correct</div>
          </div>
          <div className="rounded-lg bg-yellow-50 p-2">
            <div className="text-lg font-bold text-yellow-600">{breakdown.partial}</div>
            <div className="text-xs text-yellow-700">Partial</div>
          </div>
          <div className="rounded-lg bg-red-50 p-2">
            <div className="text-lg font-bold text-red-600">{breakdown.incorrect}</div>
            <div className="text-xs text-red-700">Incorrect</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!passed && onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCcw className="mr-2 size-4" />
            Try Again
          </Button>
        )}
        <Button onClick={onContinue}>
          {passed ? 'Continue' : 'Review & Continue'}
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </div>
  )
}
