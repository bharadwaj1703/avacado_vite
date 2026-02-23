import type { Migration } from './types'

export const migration0006CreateChatModels: Migration = {
  id: '0006_create_chat_models',
  statements: [
    `CREATE TABLE IF NOT EXISTS chat_models (
      chat_id TEXT PRIMARY KEY,
      model_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id)
    )`,
  ],
}
