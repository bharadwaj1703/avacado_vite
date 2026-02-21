import { useSyncUserOnAuth } from '@/hooks/useAppUser'

export function AppUserSync() {
  useSyncUserOnAuth()
  return null
}
