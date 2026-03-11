import { useAppUserProfile } from '@/hooks/useAppUser'

export function AppUserSync() {
  useAppUserProfile()
  return null
}
