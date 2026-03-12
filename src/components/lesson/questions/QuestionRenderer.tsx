import type { Question, QuestionResult } from '@/types/content'
import { TextEntryQuestionComponent } from './TextEntryQuestion'
import { OneOfManyQuestionComponent } from './OneOfManyQuestion'
import { ManyOfManyQuestionComponent } from './ManyOfManyQuestion'

interface QuestionRendererProps {
  question: Question
  onSubmit: (result: QuestionResult, answer: unknown) => void
  submitted?: boolean
}

export function QuestionRenderer({
  question,
  onSubmit,
  submitted = false,
}: QuestionRendererProps) {
  switch (question.type) {
    case 'text-entry':
      return (
        <TextEntryQuestionComponent
          question={question}
          onSubmit={(result, answer) => onSubmit(result, answer)}
          submitted={submitted}
        />
      )

    case 'one-of-many':
      return (
        <OneOfManyQuestionComponent
          question={question}
          onSubmit={(result, answer) => onSubmit(result, answer)}
          submitted={submitted}
        />
      )

    case 'many-of-many':
      return (
        <ManyOfManyQuestionComponent
          question={question}
          onSubmit={(result, answer) => onSubmit(result, answer)}
          submitted={submitted}
        />
      )

    default:
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-700">Unknown question type</p>
        </div>
      )
  }
}
