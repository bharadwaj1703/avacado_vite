import type { Migration } from './types'

export const migration0004CreateMessages: Migration = {
  id: '0004_create_messages',
  statements: [
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      usage TEXT,
      stop_reason TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id)
    )`,
  ],
}
