import { useState } from 'react'
import type { ManyOfManyQuestion } from '@/types/content'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { HintReveal } from './HintReveal'
import { AnswerFeedback } from './AnswerFeedback'
import { scoreManyOfMany } from '@/lib/scoring'
import type { QuestionResult } from '@/types/content'

interface ManyOfManyQuestionProps {
  question: ManyOfManyQuestion
  onSubmit: (result: QuestionResult, answer: string[]) => void
  submitted?: boolean
}

export function ManyOfManyQuestionComponent({
  question,
  onSubmit,
  submitted = false,
}: ManyOfManyQuestionProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<QuestionResult | null>(null)

  const toggleOption = (optionId: string) => {
    if (submitted) return

    setSelected((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleSubmit = () => {
    if (selected.length === 0) return

    const scoring = scoreManyOfMany(question, selected)
    const questionResult: QuestionResult = {
      questionId: question.id,
      correct: scoring.correct,
      partial: scoring.partial,
      pointsEarned: scoring.pointsEarned,
      pointsPossible: question.points,
      userAnswer: selected,
      correctAnswer: question.correct_options,
      feedback: question.explanation,
    }

    setResult(questionResult)
    onSubmit(questionResult, selected)
  }

  const renderAs = question.render_as ?? 'checkboxes'

  const renderOptions = () => {
    const isCorrectOption = (id: string) =>
      result && question.correct_options.includes(id)
    const isWrongOption = (id: string) =>
      result && selected.includes(id) && !question.correct_options.includes(id)

    switch (renderAs) {
      case 'card-grid':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id)

              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  disabled={submitted}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  } ${isCorrectOption(option.id) ? 'border-green-500 bg-green-50' : ''} ${
                    isWrongOption(option.id) ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt=""
                      className="h-20 w-full rounded-lg object-cover"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex size-5 items-center justify-center rounded border-2 ${
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="size-3 text-primary-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="font-medium">{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )

      case 'toggle-list':
        return (
          <div className="space-y-2">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id)

              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  disabled={submitted}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  } ${isCorrectOption(option.id) ? 'border-green-500 bg-green-50' : ''} ${
                    isWrongOption(option.id) ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  <div
                    className={`flex size-5 items-center justify-center rounded border-2 ${
                      isSelected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="size-3 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-medium">{option.text}</span>
                </button>
              )
            })}
          </div>
        )

      case 'checkboxes':
      default:
        return (
          <div className="space-y-3">
            {question.options.map((option) => {
              const isSelected = selected.includes(option.id)

              return (
                <label
                  key={option.id}
                  className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent'
                  } ${isCorrectOption(option.id) ? 'border-green-500 bg-green-50' : ''} ${
                    isWrongOption(option.id) ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleOption(option.id)}
                    className="shrink-0"
                    disabled={submitted}
                  />
                  <span className="text-sm font-medium">{option.text}</span>
                </label>
              )
            })}
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{question.prompt}</h2>
        {question.hint && !submitted && <HintReveal hint={question.hint} />}
      </div>

      <div className="space-y-4">
        {renderOptions()}

        {!submitted && (
          <Button onClick={handleSubmit} disabled={selected.length === 0}>
            Check Answer
          </Button>
        )}
      </div>

      {result && <AnswerFeedback result={result} />}
    </div>
  )
}
