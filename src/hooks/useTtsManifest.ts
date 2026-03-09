import { useQuery } from '@tanstack/react-query'

export type TtsManifest = Record<string, string>

const TTS_MANIFEST_URL = '/tts-manifest.json'

export function useTtsManifest() {
  return useQuery({
    queryKey: ['tts-manifest'],
    queryFn: async (): Promise<TtsManifest> => {
      const res = await fetch(TTS_MANIFEST_URL)
      if (!res.ok) return {}
      const data = await res.json()
      return typeof data === 'object' && data !== null ? data : {}
    },
    staleTime: 5 * 60 * 1000,
  })
}
