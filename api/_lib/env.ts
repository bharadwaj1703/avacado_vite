export type DatabaseProvider = 'sqlite' | 'd1'

export type AppEnv = {
  databaseProvider: DatabaseProvider
  sqliteDbPath: string
  cloudflareAccountId: string | null
  cloudflareD1DatabaseId: string | null
  cloudflareApiToken: string | null
  clerkSecretKey: string | null
  clerkBackendApiUrl: string
  clerkWebhookSecret: string | null
}

export function getEnv(): AppEnv {
  const providerRaw = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  const databaseProvider: DatabaseProvider = providerRaw === 'd1' ? 'd1' : 'sqlite'

  return {
    databaseProvider,
    sqliteDbPath: process.env.SQLITE_DB_PATH?.trim() || './.data/avacado.sqlite',
    cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || null,
    cloudflareD1DatabaseId: process.env.CLOUDFLARE_D1_DATABASE_ID?.trim() || null,
    cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN?.trim() || null,
    clerkSecretKey: process.env.CLERK_SECRET_KEY?.trim() || null,
    clerkBackendApiUrl: process.env.CLERK_BACKEND_API_URL?.trim() || 'https://api.clerk.com',
    clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET?.trim() || null,
  }
}

export function assertD1Env(env: AppEnv): void {
  if (!env.cloudflareAccountId || !env.cloudflareD1DatabaseId || !env.cloudflareApiToken) {
    throw new Error('Missing D1 env. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_API_TOKEN.')
  }
}

export function assertClerkSecret(env: AppEnv): void {
  if (!env.clerkSecretKey) {
    throw new Error('Missing CLERK_SECRET_KEY.')
  }
}

export function assertWebhookSecret(env: AppEnv): void {
  if (!env.clerkWebhookSecret) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET.')
  }
}
