import { Flame } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Avocado
        </p>
        <div className="flex items-center gap-1 text-sm font-medium text-orange-500">
          <Flame className="size-4" />
          7
        </div>
      </div>
    </header>
  )
}
