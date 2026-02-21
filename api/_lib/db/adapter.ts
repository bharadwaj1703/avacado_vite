import { randomUUID } from 'node:crypto'
import { getEnv, type AppEnv } from '../env'
import { createD1Db } from './d1'
import { createSqliteDb } from './sqlite'
import type { OnboardingInput, RecordActivityInput, UserRow } from '../types'

export type AppDb = {
  migrate: () => Promise<void>
  health: () => Promise<{ provider: 'sqlite' | 'd1'; ok: true }>
  findUserByClerkId: (clerkUserId: string) => Promise<UserRow | null>
  upsertUserFromClerk: (params: { clerkUserId: string; leadId?: string; displayName?: string }) => Promise<string>
  updateOnboarding: (params: { clerkUserId: string; input: OnboardingInput }) => Promise<{ userId: string; onboardingCompletedAt?: string }>
  insertActivity: (params: { clerkUserId: string; input: RecordActivityInput }) => Promise<string | null>
}

type SqlClient = {
  migrate: () => Promise<void>
  health: () => Promise<{ provider: 'sqlite' | 'd1'; ok: true }>
  getOne<T>(sql: string, params?: unknown[]): Promise<T | null>
  run(sql: string, params?: unknown[]): Promise<void>
}

let dbPromise: Promise<AppDb> | null = null

export function getDb(): Promise<AppDb> {
  if (!dbPromise) {
    dbPromise = createDb(getEnv())
  }
  return dbPromise
}

async function createDb(env: AppEnv): Promise<AppDb> {
  const client: SqlClient = env.databaseProvider === 'd1' ? await createD1Db(env) : await createSqliteDb(env)

  async function findUserByClerkId(clerkUserId: string): Promise<UserRow | null> {
    return client.getOne<UserRow>('SELECT * FROM users WHERE clerk_user_id = ?', [clerkUserId])
  }

  async function upsertUserFromClerk(params: {
    clerkUserId: string
    leadId?: string
    displayName?: string
  }): Promise<string> {
    const now = new Date().toISOString()
    const existing = await findUserByClerkId(params.clerkUserId)

    if (!existing) {
      const id = randomUUID()
      await client.run(
        `INSERT INTO users (
          id, clerk_user_id, lead_id, display_name, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          params.clerkUserId,
          params.leadId ?? null,
          params.displayName ?? null,
          now,
          now,
        ]
      )
      return id
    }

    const leadId = existing.lead_id ?? params.leadId ?? null
    const displayName = params.displayName ?? existing.display_name ?? null
    await client.run('UPDATE users SET lead_id = ?, display_name = ?, updated_at = ? WHERE id = ?', [
      leadId,
      displayName,
      now,
      existing.id,
    ])
    return existing.id
  }

  async function updateOnboarding(params: {
    clerkUserId: string
    input: OnboardingInput
  }): Promise<{ userId: string; onboardingCompletedAt?: string }> {
    const userId = await upsertUserFromClerk({ clerkUserId: params.clerkUserId })
    const now = new Date().toISOString()
    const completedAt = params.input.completed ? now : null

    await client.run(
      `UPDATE users SET
        profession = ?,
        self_reported_ai_knowledge = ?,
        company_website = ?,
        extracted_company_details = ?,
        job_title = ?,
        time_commitment_span = ?,
        time_commitment_frequency = ?,
        preferred_timing = ?,
        timezone = ?,
        onboarding_completed_at = COALESCE(?, onboarding_completed_at),
        updated_at = ?
      WHERE id = ?`,
      [
        params.input.profession ?? null,
        params.input.selfReportedAiKnowledge ?? null,
        params.input.companyWebsite ?? null,
        params.input.extractedCompanyDetails ?? null,
        params.input.jobTitle ?? null,
        params.input.timeCommitmentSpan ?? null,
        params.input.timeCommitmentFrequency ?? null,
        params.input.preferredTiming ?? null,
        params.input.timezone ?? null,
        completedAt,
        now,
        userId,
      ]
    )

    return {
      userId,
      ...(completedAt ? { onboardingCompletedAt: completedAt } : {}),
    }
  }

  async function insertActivity(params: { clerkUserId: string; input: RecordActivityInput }): Promise<string | null> {
    const user = await findUserByClerkId(params.clerkUserId)
    if (!user) return null

    const id = randomUUID()
    const now = new Date().toISOString()

    await client.run(
      `INSERT INTO activities (
        id, user_id, action_kind, slug, entity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, user.id, params.input.actionKind, params.input.slug, params.input.entity, now]
    )

    return id
  }

  return {
    migrate: client.migrate,
    health: client.health,
    findUserByClerkId,
    upsertUserFromClerk,
    updateOnboarding,
    insertActivity,
  }
}
