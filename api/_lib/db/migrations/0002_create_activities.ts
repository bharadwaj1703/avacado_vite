import type { Migration } from './types'

export const migration0002CreateActivities: Migration = {
  id: '0002_create_activities',
  statements: [
    `CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      action_kind TEXT NOT NULL,
      slug TEXT NOT NULL,
      entity TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
  ],
}
