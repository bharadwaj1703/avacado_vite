import { Flame } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <h1 className="text-lg font-bold text-primary">Avocado Style</h1>
      <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
        <Flame className="size-4" />
        7
      </div>
    </header>
  )
}
