import { useState, memo } from 'react'
import type { TextEntryQuestion } from '@/types/content'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HintReveal } from './HintReveal'
import { AnswerFeedback } from './AnswerFeedback'
import { scoreTextEntry } from '@/lib/scoring'
import type { QuestionResult } from '@/types/content'

interface TextEntryQuestionProps {
  question: TextEntryQuestion
  onSubmit: (result: QuestionResult, answer: string) => void
  submitted?: boolean
}

export const TextEntryQuestionComponent = memo(function TextEntryQuestionComponent({
  question,
  onSubmit,
  submitted = false,
}: TextEntryQuestionProps) {
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<QuestionResult | null>(null)

  const handleSubmit = () => {
    if (!answer.trim()) return

    const scoring = scoreTextEntry(question, answer)
    const questionResult: QuestionResult = {
      questionId: question.id,
      correct: scoring.correct,
      partial: false,
      pointsEarned: scoring.pointsEarned,
      pointsPossible: question.points,
      userAnswer: scoring.normalizedUserAnswer,
      correctAnswer: question.correct_answer,
      feedback: question.explanation,
    }

    setResult(questionResult)
    onSubmit(questionResult, answer)
  }

  const isCorrect = result?.correct ?? false

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{question.prompt}</h2>
        {question.hint && !submitted && <HintReveal hint={question.hint} />}
      </div>

      <div className="space-y-4">
        <Input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={question.placeholder || 'Enter your answer...'}
          disabled={submitted || isCorrect}
          className={isCorrect ? 'border-green-500 bg-green-50' : ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !submitted) {
              handleSubmit()
            }
          }}
        />

        {!submitted && (
          <Button onClick={handleSubmit} disabled={!answer.trim()} aria-label="Submit answer">
            Check Answer
          </Button>
        )}
      </div>

      {result && <AnswerFeedback result={result} />}
    </div>
  )
})
