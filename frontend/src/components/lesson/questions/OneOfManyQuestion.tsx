import { useState, memo } from 'react'
import type { OneOfManyQuestion } from '@/types/content'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { HintReveal } from './HintReveal'
import { AnswerFeedback } from './AnswerFeedback'
import { scoreOneOfMany } from '@/lib/scoring'
import type { QuestionResult } from '@/types/content'

interface OneOfManyQuestionProps {
  question: OneOfManyQuestion
  onSubmit: (result: QuestionResult, answer: string) => void
  submitted?: boolean
}

export const OneOfManyQuestionComponent = memo(function OneOfManyQuestionComponent({
  question,
  onSubmit,
  submitted = false,
}: OneOfManyQuestionProps) {
  const [selected, setSelected] = useState<string>('')
  const [result, setResult] = useState<QuestionResult | null>(null)

  const handleSubmit = () => {
    if (!selected) return

    const scoring = scoreOneOfMany(question, selected)
    const questionResult: QuestionResult = {
      questionId: question.id,
      correct: scoring.correct,
      partial: scoring.partial,
      pointsEarned: scoring.pointsEarned,
      pointsPossible: question.points,
      userAnswer: selected,
      correctAnswer: question.correct_option,
      feedback: question.explanation,
    }

    setResult(questionResult)
    onSubmit(questionResult, selected)
  }

  const renderAs = question.render_as ?? 'radio'

  const renderOptions = () => {
    switch (renderAs) {
      case 'cards':
        return (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isSelected = selected === option.id
              const isCorrect = result && option.id === question.correct_option
              const isWrong = result && isSelected && !isCorrect

              return (
                <button
                  key={option.id}
                  onClick={() => !submitted && setSelected(option.id)}
                  disabled={submitted}
                  aria-label={`Select option: ${option.text}`}
                  className={`flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  } ${isCorrect ? 'border-green-500 bg-green-50' : ''} ${
                    isWrong ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  {option.image && (
                    <img
                      src={option.image}
                      alt=""
                      className="h-20 w-full rounded-lg object-cover"
                    />
                  )}
                  <span className="font-medium">{option.text}</span>
                </button>
              )
            })}
          </div>
        )

      case 'button-grid':
        return (
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => {
              const isSelected = selected === option.id
              const isCorrect = result && option.id === question.correct_option
              const isWrong = result && isSelected && !isCorrect

              return (
                <button
                  key={option.id}
                  onClick={() => !submitted && setSelected(option.id)}
                  disabled={submitted}
                  aria-label={`Select option: ${option.text}`}
                  className={`min-h-12 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  } ${isCorrect ? 'border-green-500 bg-green-50' : ''} ${
                    isWrong ? 'border-red-500 bg-red-50' : ''
                  }`}
                >
                  {option.text}
                </button>
              )
            })}
          </div>
        )

      case 'dropdown':
        return (
          <Select
            value={selected}
            onValueChange={setSelected}
            disabled={submitted}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an answer..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'radio':
      default:
        return (
          <RadioGroup
            value={selected}
            onValueChange={submitted ? undefined : setSelected}
          >
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selected === option.id
                const isCorrect = result && option.id === question.correct_option
                const isWrong = result && isSelected && !isCorrect

                return (
                  <label
                    key={option.id}
                    className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent'
                    } ${isCorrect ? 'border-green-500 bg-green-50' : ''} ${
                      isWrong ? 'border-red-500 bg-red-50' : ''
                    }`}
                  >
                    <RadioGroupItem
                      value={option.id}
                      className="shrink-0"
                      disabled={submitted}
                    />
                    <span className="text-sm font-medium">{option.text}</span>
                  </label>
                )
              })}
            </div>
          </RadioGroup>
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
          <Button onClick={handleSubmit} disabled={!selected} aria-label="Submit answer">
            Check Answer
          </Button>
        )}
      </div>

      {result && <AnswerFeedback result={result} />}
    </div>
  )
})
