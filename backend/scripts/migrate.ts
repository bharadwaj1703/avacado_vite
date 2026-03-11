/**
 * Run DB migrations at build time. Uses same env as the app (DATABASE, etc.).
 * Invoked by: bun run migrate (e.g. during deploy build).
 */
import { resolve } from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

const envPath = resolve(import.meta.dirname, '..', '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
      value = value.slice(1, -1)
    if (!process.env[key]) process.env[key] = value
  }
}

import { getDb } from '../src/_lib/db/adapter'

async function main() {
  const db = await getDb()
  await db.migrate()
  const { provider } = await db.health()
  console.log(`Migrations complete (${provider})`)
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  }
)
