import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { AppEnv } from '../env'
import { MIGRATIONS } from './migrations'

type BunQuery = {
  run: (...params: unknown[]) => unknown
  get: (...params: unknown[]) => unknown
}

type BunDatabase = {
  query: (sql: string) => BunQuery
}

export async function createSqliteDb(env: AppEnv) {
  mkdirSync(dirname(env.sqliteDbPath), { recursive: true })

  const sqlite = await import('bun:sqlite')
  const db = new sqlite.Database(env.sqliteDbPath) as BunDatabase

  return {
    migrate: async () => {
      for (const sql of MIGRATIONS) {
        db.query(sql).run()
      }
    },
    health: async () => ({ provider: 'sqlite' as const, ok: true as const }),
    getOne: async <T>(sql: string, params: unknown[] = []) => {
      const row = db.query(sql).get(...params)
      return (row ?? null) as T | null
    },
    run: async (sql: string, params: unknown[] = []) => {
      db.query(sql).run(...params)
    },
  }
}
