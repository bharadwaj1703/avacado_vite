import { randomUUID } from 'node:crypto'
import { getEnv, type AppEnv } from '../env'
import { createD1Db } from './d1'
import { createSqliteDb } from './sqlite'
import { createTursoDb } from './turso'
import type {
  ChatRow,
  ChatStatus,
  MessageRow,
  MessageRole,
  OnboardingInput,
  RecordActivityInput,
  UserRow,
} from '../types'

export type AppDb = {
  migrate: () => Promise<void>
  health: () => Promise<{ provider: 'sqlite' | 'd1' | 'turso'; ok: true }>
  findUserByClerkId: (clerkUserId: string) => Promise<UserRow | null>
  upsertUserFromClerk: (params: { clerkUserId: string; leadId?: string; displayName?: string }) => Promise<string>
  updateOnboarding: (params: { clerkUserId: string; input: OnboardingInput }) => Promise<{ userId: string; onboardingCompletedAt?: string }>
  insertActivity: (params: { clerkUserId: string; input: RecordActivityInput }) => Promise<string | null>
  createChat: (userId: string, title?: string | null) => Promise<string>
  getChatById: (id: string) => Promise<ChatRow | null>
  listChatsByUserId: (userId: string, limit?: number) => Promise<ChatRow[]>
  updateChatStatus: (id: string, status: ChatStatus) => Promise<void>
  updateChatUpdatedAt: (id: string) => Promise<void>
  insertMessage: (
    chatId: string,
    role: MessageRole,
    content: string,
    options?: { usage?: string; stopReason?: string | null }
  ) => Promise<string>
  listMessagesByChatId: (chatId: string) => Promise<MessageRow[]>
  hasUserActiveChat: (userId: string) => Promise<boolean>
  countChatsByUserId: (userId: string) => Promise<number>
}

type SqlClient = {
  migrate: () => Promise<void>
  health: () => Promise<{ provider: 'sqlite' | 'd1' | 'turso'; ok: true }>
  getOne<T>(sql: string, params?: unknown[]): Promise<T | null>
  getMany<T>(sql: string, params?: unknown[]): Promise<T[]>
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
  const client: SqlClient =
    env.databaseProvider === 'turso'
      ? await createTursoDb(env)
      : env.databaseProvider === 'd1'
        ? await createD1Db(env)
        : await createSqliteDb(env)

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

  const MAX_CHATS_PER_USER = 50
  const MAX_MESSAGES_PER_CHAT = 10
  const ACTIVE_STATUSES: ChatStatus[] = ['streaming', 'awaiting_llm']

  async function countChatsByUserId(userId: string): Promise<number> {
    const row = await client.getOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM chats WHERE user_id = ?',
      [userId]
    )
    return row?.count ?? 0
  }

  async function createChat(userId: string, title?: string | null): Promise<string> {
    const count = await countChatsByUserId(userId)
    if (count >= MAX_CHATS_PER_USER) {
      throw new Error('Max 50 chats per user.')
    }
    const id = randomUUID()
    const now = new Date().toISOString()
    await client.run(
      'INSERT INTO chats (id, user_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, title ?? null, 'awaiting_user', now, now]
    )
    return id
  }

  async function getChatById(id: string): Promise<ChatRow | null> {
    return client.getOne<ChatRow>('SELECT * FROM chats WHERE id = ?', [id])
  }

  async function listChatsByUserId(userId: string, limit = 50): Promise<ChatRow[]> {
    return client.getMany<ChatRow>(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?',
      [userId, limit]
    )
  }

  async function updateChatStatus(id: string, status: ChatStatus): Promise<void> {
    const now = new Date().toISOString()
    await client.run('UPDATE chats SET status = ?, updated_at = ? WHERE id = ?', [status, now, id])
  }

  async function updateChatUpdatedAt(id: string): Promise<void> {
    const now = new Date().toISOString()
    await client.run('UPDATE chats SET updated_at = ? WHERE id = ?', [now, id])
  }

  async function insertMessage(
    chatId: string,
    role: MessageRole,
    content: string,
    options?: { usage?: string; stopReason?: string | null }
  ): Promise<string> {
    const rows = await client.getOne<{ count: number }>('SELECT COUNT(*) as count FROM messages WHERE chat_id = ?', [
      chatId,
    ])
    const count = rows?.count ?? 0
    if (count >= MAX_MESSAGES_PER_CHAT) {
      throw new Error('Max 10 messages per chat.')
    }
    const id = randomUUID()
    const now = new Date().toISOString()
    await client.run(
      'INSERT INTO messages (id, chat_id, role, content, usage, stop_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, chatId, role, content, options?.usage ?? null, options?.stopReason ?? null, now]
    )
    return id
  }

  async function listMessagesByChatId(chatId: string): Promise<MessageRow[]> {
    return client.getMany<MessageRow>(
      'SELECT * FROM messages WHERE chat_id = ? ORDER BY created_at',
      [chatId]
    )
  }

  async function hasUserActiveChat(userId: string): Promise<boolean> {
    const placeholders = ACTIVE_STATUSES.map(() => '?').join(',')
    const row = await client.getOne<{ n: number }>(
      `SELECT 1 as n FROM chats WHERE user_id = ? AND status IN (${placeholders}) LIMIT 1`,
      [userId, ...ACTIVE_STATUSES]
    )
    return row != null
  }

  return {
    migrate: client.migrate,
    health: client.health,
    findUserByClerkId,
    upsertUserFromClerk,
    updateOnboarding,
    insertActivity,
    createChat,
    getChatById,
    listChatsByUserId,
    updateChatStatus,
    updateChatUpdatedAt,
    insertMessage,
    listMessagesByChatId,
    hasUserActiveChat,
    countChatsByUserId,
  }
}
