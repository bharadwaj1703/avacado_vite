interface QuizProgressProps {
  progress: number
}

export function QuizProgress({ progress }: QuizProgressProps) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(100, progress)}%` }}
      />
    </div>
  )
}
