import { assertD1Env, type AppEnv } from '../env'
import { MIGRATIONS } from './migrations'

type D1Response<T> = {
  success: boolean
  errors?: { message: string }[]
  result?: Array<{
    success?: boolean
    results?: T[]
  }>
}

export async function createD1Db(env: AppEnv) {
  assertD1Env(env)

  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${env.cloudflareAccountId}/d1/database/${env.cloudflareD1DatabaseId}/query`

  async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.cloudflareApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    })

    if (!response.ok) {
      throw new Error(`D1 request failed (${response.status})`)
    }

    const payload = (await response.json()) as D1Response<T>
    if (!payload.success) {
      const message = payload.errors?.[0]?.message ?? 'D1 query failed'
      throw new Error(message)
    }

    return payload.result?.[0]?.results ?? []
  }

  return {
    migrate: async () => {
      for (const sql of MIGRATIONS) {
        await query(sql)
      }
    },
    health: async () => ({ provider: 'd1' as const, ok: true as const }),
    getOne: async <T>(sql: string, params: unknown[] = []) => {
      const rows = await query<T>(sql, params)
      return rows[0] ?? null
    },
    getMany: async <T>(sql: string, params: unknown[] = []) => {
      return query<T>(sql, params)
    },
    run: async (sql: string, params: unknown[] = []) => {
      await query(sql, params)
    },
  }
}
