const KEY = 'avacado_convex_skip'

export function isConvexSkipped(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(KEY) === '1'
}

export function setConvexSkipped(): void {
  sessionStorage.setItem(KEY, '1')
}

export function clearConvexSkipped(): void {
  sessionStorage.removeItem(KEY)
}

export function isConvexServerError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return (
    msg.includes('Could not find public function') ||
    msg.includes('CONVEX Q(') ||
    msg.includes('CONVEX M(')
  )
}
