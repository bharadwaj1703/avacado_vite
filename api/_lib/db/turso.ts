import { createClient } from '@libsql/client'
import { assertTursoEnv, type AppEnv } from '../env'
import { runMigrations } from './migrator'

export async function createTursoDb(env: AppEnv) {
  assertTursoEnv(env)

  const client = createClient({
    url: env.databaseTursoDatabaseUrl!,
    authToken: env.databaseTursoAuthToken!,
  })

  return {
    migrate: async () => {
      await runMigrations({
        getMany: async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
          const result = await client.execute({
            sql,
            args: params as (string | number | bigint | Uint8Array | null)[],
          })
          const columns = result.columns
          return result.rows.map((row) => {
            const obj: Record<string, unknown> = {}
            for (let i = 0; i < columns.length; i++) {
              obj[columns[i]] = row[i]
            }
            return obj as T
          })
        },
        run: async (sql: string, params: unknown[] = []) => {
          await client.execute({ sql, args: params as (string | number | bigint | Uint8Array | null)[] })
        },
      })
    },
    health: async () => ({ provider: 'turso' as const, ok: true as const }),
    getOne: async <T>(sql: string, params: unknown[] = []): Promise<T | null> => {
      const result = await client.execute({ sql, args: params as (string | number | bigint | Uint8Array | null)[] })
      const row = result.rows[0]
      if (row == null) return null
      const columns = result.columns
      const obj: Record<string, unknown> = {}
      for (let i = 0; i < columns.length; i++) {
        obj[columns[i]] = row[i]
      }
      return obj as T
    },
    getMany: async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
      const result = await client.execute({ sql, args: params as (string | number | bigint | Uint8Array | null)[] })
      const columns = result.columns
      return result.rows.map((row) => {
        const obj: Record<string, unknown> = {}
        for (let i = 0; i < columns.length; i++) {
          obj[columns[i]] = row[i]
        }
        return obj as T
      })
    },
    run: async (sql: string, params: unknown[] = []) => {
      await client.execute({ sql, args: params as (string | number | bigint | Uint8Array | null)[] })
    },
  }
}
