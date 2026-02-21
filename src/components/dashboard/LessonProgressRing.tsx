interface LessonProgressRingProps {
  /** Progress from 0 to 1 */
  progress: number
  /** Ring size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Tailwind color class for the progress stroke (default: text-primary) */
  progressColor?: string
}

export function LessonProgressRing({
  progress,
  size = 68,
  strokeWidth = 3,
  progressColor = 'text-primary',
}: LessonProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted"
      />
      {/* Progress ring */}
      {progress > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={progressColor}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
    </svg>
  )
}
