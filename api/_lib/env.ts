export type DatabaseProvider = 'sqlite' | 'd1' | 'turso'

export type AppEnv = {
  databaseProvider: DatabaseProvider
  sqliteDbPath: string
  databaseTursoDatabaseUrl: string | null
  databaseTursoAuthToken: string | null
  cloudflareAccountId: string | null
  cloudflareD1DatabaseId: string | null
  cloudflareApiToken: string | null
  clerkSecretKey: string | null
  clerkBackendApiUrl: string
  clerkWebhookSecret: string | null
  openrouterApiKey: string | null
  aiModelMaxInputPricePerMtok: number
  aiModelMaxOutputPricePerMtok: number
}

function resolveDatabaseProvider(): DatabaseProvider {
  const databaseRaw = (process.env.DATABASE ?? '').trim().toLowerCase()
  if (databaseRaw === 'turso') return 'turso'
  if (databaseRaw === 'd1') return 'd1'
  if (databaseRaw === 'sqlite' || databaseRaw === 'none' || databaseRaw === '') return 'sqlite'
  const providerRaw = (process.env.DATABASE_PROVIDER ?? '').trim().toLowerCase()
  if (providerRaw === 'd1') return 'd1'
  if (providerRaw === 'turso') return 'turso'
  return 'sqlite'
}

export function getEnv(): AppEnv {
  const databaseProvider = resolveDatabaseProvider()

  const maxInput = Number(process.env.AI_MODEL_MAX_INPUT_PRICE_PER_MTOK)
  const maxOutput = Number(process.env.AI_MODEL_MAX_OUTPUT_PRICE_PER_MTOK)

  return {
    databaseProvider,
    sqliteDbPath: process.env.SQLITE_DB_PATH?.trim() || './.data/avacado.sqlite',
    databaseTursoDatabaseUrl: process.env.DATABASE_TURSO_DATABASE_URL?.trim() || null,
    databaseTursoAuthToken: process.env.DATABASE_TURSO_AUTH_TOKEN?.trim() || null,
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || null,
    cloudflareD1DatabaseId: process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() || null,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
    clerkSecretKey: process.env.CLERK_SECRET_KEY?.trim() || null,
    clerkBackendApiUrl: process.env.CLERK_BACKEND_API_URL?.trim() || 'https://api.clerk.com',
    clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET?.trim() || null,
    openrouterApiKey: process.env.OPENROUTER_API_KEY?.trim() || null,
    aiModelMaxInputPricePerMtok: Number.isFinite(maxInput) && maxInput > 0 ? maxInput : 1,
    aiModelMaxOutputPricePerMtok: Number.isFinite(maxOutput) && maxOutput > 0 ? maxOutput : 2.5,
  }
}

export function assertTursoEnv(env: AppEnv): void {
  if (env.databaseProvider !== 'turso') return
  if (!env.databaseTursoDatabaseUrl || !env.databaseTursoAuthToken) {
    throw new Error(
      'Missing Turso env. When DATABASE=turso, set DATABASE_TURSO_DATABASE_URL and DATABASE_TURSO_AUTH_TOKEN.'
    )
  }
}

export function assertD1Env(env: AppEnv): void {
  if (!env.cloudflareAccountId || !env.cloudflareD1DatabaseId || !env.cloudflareApiToken) {
    throw new Error('Missing D1 env. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.')
  }
}

export function assertClerkSecret(env: AppEnv): asserts env is AppEnv & { clerkSecretKey: string } {
  if (!env.clerkSecretKey) {
    throw new Error('Missing CLERK_SECRET_KEY.')
  }
}

export function assertWebhookSecret(env: AppEnv): asserts env is AppEnv & { clerkWebhookSecret: string } {
  if (!env.clerkWebhookSecret) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET.')
  }
}

export function assertOpenRouterApiKey(env: AppEnv): asserts env is AppEnv & { openrouterApiKey: string } {
  if (!env.openrouterApiKey) {
    throw new Error('Missing OPENROUTER_API_KEY.')
  }
}
