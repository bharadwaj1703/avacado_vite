import type { Migration } from './types'

export const migration0001CreateUsers: Migration = {
  id: '0001_create_users',
  statements: [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      clerk_user_id TEXT NOT NULL UNIQUE,
      lead_id TEXT,
      display_name TEXT,
      profession TEXT,
      self_reported_ai_knowledge INTEGER,
      company_website TEXT,
      extracted_company_details TEXT,
      job_title TEXT,
      time_commitment_span INTEGER,
      time_commitment_frequency TEXT,
      preferred_timing TEXT,
      timezone TEXT,
      onboarding_completed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ],
}
