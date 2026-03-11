import { Checkbox } from '@/components/ui/checkbox'
import type { Option } from '@/types/quiz'

interface CheckboxQuestionProps {
  prompt: string
  options: Option[]
  selected: string[]
  onSelect: (optionId: string) => void
}

export function CheckboxQuestion({ prompt, options, selected, onSelect }: CheckboxQuestionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{prompt}</h2>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected.includes(option.id)
          return (
            <label
              key={option.id}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 p-4 shadow-level-1 transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(option.id)}
                className="shrink-0"
              />
              <span className="text-sm font-medium">{option.text}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
