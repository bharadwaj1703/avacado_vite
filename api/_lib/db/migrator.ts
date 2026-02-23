import { MIGRATIONS } from './migrations'

type MigrationRunnerClient = {
  getMany<T>(sql: string, params?: unknown[]): Promise<T[]>
  run(sql: string, params?: unknown[]): Promise<void>
}

const CREATE_SCHEMA_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`

export async function runMigrations(client: MigrationRunnerClient): Promise<void> {
  await client.run(CREATE_SCHEMA_MIGRATIONS_TABLE)

  const existingRows = await client.getMany<{ id: string }>('SELECT id FROM schema_migrations')
  const appliedMigrationIds = new Set(existingRows.map((row) => row.id))

  for (const migration of MIGRATIONS) {
    if (appliedMigrationIds.has(migration.id)) continue

    for (const statement of migration.statements) {
      await client.run(statement)
    }

    await client.run('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)', [
      migration.id,
      new Date().toISOString(),
    ])
  }
}
