import type { AppEnv } from './env'

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'

/** Input-related pricing keys (per token); take max for input $/Mtok */
const INPUT_PRICE_KEYS = [
  'prompt',
  'image',
  'audio',
  'input_cache_read',
  'input_cache_write',
] as const

/** Output-related pricing keys (per token); take max for output $/Mtok */
const OUTPUT_PRICE_KEYS = ['completion', 'internal_reasoning'] as const

const PRICE_PER_MTOK_FACTOR = 1_000_000

type PricingRecord = Record<string, string | undefined>

function parsePrice(value: string | undefined): number {
  if (value == null || value === '') return 0
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function maxPricePerMtok(pricing: PricingRecord, keys: readonly string[]): number {
  let max = 0
  for (const key of keys) {
    const v = parsePrice(pricing[key])
    const perMtok = v * PRICE_PER_MTOK_FACTOR
    if (perMtok > max) max = perMtok
  }
  return max
}

export type OpenRouterModelSummary = {
  id: string
  name: string
  pricing: PricingRecord
  context_length?: number | null
}

type OpenRouterModelsResponse = {
  data?: Array<{
    id: string
    name: string
    pricing?: PricingRecord
    context_length?: number | null
  }>
}

export function filterModelsByPricing(
  models: Array<{ id: string; name: string; pricing?: PricingRecord; context_length?: number | null }>,
  env: Pick<AppEnv, 'aiModelMaxInputPricePerMtok' | 'aiModelMaxOutputPricePerMtok'>
): OpenRouterModelSummary[] {
  const result: OpenRouterModelSummary[] = []
  const pricing = (p: PricingRecord | undefined) => p ?? {}

  for (const m of models) {
    const p = pricing(m.pricing)
    const inputPerMtok = maxPricePerMtok(p, INPUT_PRICE_KEYS)
    const outputPerMtok = maxPricePerMtok(p, OUTPUT_PRICE_KEYS)
    if (
      inputPerMtok <= env.aiModelMaxInputPricePerMtok &&
      outputPerMtok <= env.aiModelMaxOutputPricePerMtok
    ) {
      result.push({
        id: m.id,
        name: m.name,
        pricing: p,
        context_length: m.context_length,
      })
    }
  }
  return result
}

export async function fetchAllowedModels(
  env: Pick<AppEnv, 'openrouterApiKey' | 'aiModelMaxInputPricePerMtok' | 'aiModelMaxOutputPricePerMtok'>
): Promise<OpenRouterModelSummary[]> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (env.openrouterApiKey) {
    headers['Authorization'] = `Bearer ${env.openrouterApiKey}`
  }
  const res = await fetch(OPENROUTER_MODELS_URL, { headers })
  if (!res.ok) {
    throw new Error(`OpenRouter models fetch failed: ${res.status}`)
  }
  const body = (await res.json()) as OpenRouterModelsResponse
  const data = body.data ?? []
  return filterModelsByPricing(data, env)
}

export function isModelAllowed(
  modelId: string,
  allowed: OpenRouterModelSummary[]
): boolean {
  return allowed.some((m) => m.id === modelId)
}
