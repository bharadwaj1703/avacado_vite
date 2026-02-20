import { createFileRoute } from '@tanstack/react-router'
import { useLessonsQuery } from '@/hooks/useQuizQuery'
import { StreakBanner } from '@/components/dashboard/StreakBanner'
import { UnitSection } from '@/components/dashboard/UnitSection'

function DashboardPage() {
  const { data } = useLessonsQuery()

  if (!data) return null

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-4">
      <StreakBanner count={data.streakCount} />
      {data.units.map((unit) => (
        <UnitSection key={unit.id} unit={unit} />
      ))}
    </div>
  )
}

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
})
