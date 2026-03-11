import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Option } from '@/types/quiz'

interface RadioQuestionProps {
  prompt: string
  options: Option[]
  selected: string[]
  onSelect: (optionId: string) => void
}

export function RadioQuestion({ prompt, options, selected, onSelect }: RadioQuestionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">{prompt}</h2>
      <RadioGroup value={selected[0] ?? ''} onValueChange={onSelect}>
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
                <RadioGroupItem value={option.id} className="shrink-0" />
                <span className="text-sm font-medium">{option.text}</span>
              </label>
            )
          })}
        </div>
      </RadioGroup>
    </div>
  )
}
