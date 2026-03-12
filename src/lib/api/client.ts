export type AuthTokenProvider = () => Promise<string | null>

const API_ORIGIN =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    (import.meta.env.VITE_API_ORIGIN as string | undefined)) ||
  ''

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return API_ORIGIN ? `${API_ORIGIN.replace(/\/$/, '')}${p}` : p
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'DELETE'
    tokenProvider?: AuthTokenProvider
    body?: unknown
  } = {}
): Promise<TResponse> {
  const token = options.tokenProvider ? await options.tokenProvider() : null
  const response = await fetch(apiUrl(path), {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  })

  const payload = await parseJson(response)
  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : 'Request failed'
    throw new Error(errorMessage)
  }

  return payload as TResponse
}
