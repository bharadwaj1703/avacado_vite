import { createFileRoute } from '@tanstack/react-router'
import { ExploreCategoryPage } from '@/components/explore/ExploreCategoryPage'

function ExploreCategory() {
  const { categoryId } = Route.useParams()
  return <ExploreCategoryPage categoryId={categoryId} />
}

export const Route = createFileRoute('/_app/explore/$categoryId')({
  component: ExploreCategory,
})
