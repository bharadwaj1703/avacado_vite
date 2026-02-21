export const MIGRATIONS: string[] = [
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
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id)',
  `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action_kind TEXT NOT NULL,
      slug TEXT NOT NULL,
      entity TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  'CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC)',
]
