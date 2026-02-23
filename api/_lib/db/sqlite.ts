import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { AppEnv } from '../env'
import { runMigrations } from './migrator'

type BunQuery = {
  run: (...params: unknown[]) => unknown
  get: (...params: unknown[]) => unknown
  all: (...params: unknown[]) => unknown[]
}

type BunDatabase = {
  query: (sql: string) => BunQuery
}

const SQLITE_BUSY_CODE = 'SQLITE_BUSY'
const MAX_BUSY_RETRIES = 7
const INITIAL_BUSY_BACKOFF_MS = 40

function isSqliteBusyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  const code = (error as { code?: string }).code
  return code === SQLITE_BUSY_CODE || message.includes('database is locked')
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function withSqliteBusyRetry<T>(operation: () => T): Promise<T> {
  let attempt = 0
  let delay = INITIAL_BUSY_BACKOFF_MS

  while (true) {
    try {
      return operation()
    } catch (error) {
      if (!isSqliteBusyError(error) || attempt >= MAX_BUSY_RETRIES) {
        throw error
      }
      await sleep(delay)
      attempt += 1
      delay *= 2
    }
  }
}

export async function createSqliteDb(env: AppEnv) {
  mkdirSync(dirname(env.sqliteDbPath), { recursive: true })

  const sqlite = await import('bun:sqlite')
  const db = new sqlite.Database(env.sqliteDbPath) as BunDatabase

  // Improve behavior under concurrent dev access (vite + api + migration runs).
  db.query('PRAGMA journal_mode = WAL').run()
  db.query('PRAGMA busy_timeout = 5000').run()
  db.query('PRAGMA synchronous = NORMAL').run()

  const getMany = async <T>(sql: string, params: unknown[] = []) => {
    const rows = await withSqliteBusyRetry(() => db.query(sql).all(...params))
    return (rows ?? []) as T[]
  }

  const run = async (sql: string, params: unknown[] = []) => {
    await withSqliteBusyRetry(() => db.query(sql).run(...params))
  }

  return {
    migrate: async () => {
      await runMigrations({ getMany, run })
    },
    health: async () => ({ provider: 'sqlite' as const, ok: true as const }),
    getOne: async <T>(sql: string, params: unknown[] = []) => {
      const row = await withSqliteBusyRetry(() => db.query(sql).get(...params))
      return (row ?? null) as T | null
    },
    getMany,
    run,
  }
}
