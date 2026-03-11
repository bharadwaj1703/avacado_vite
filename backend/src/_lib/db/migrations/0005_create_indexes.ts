import type { Migration } from './types'

export const migration0005CreateIndexes: Migration = {
  id: '0005_create_indexes',
  statements: [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id ON users(clerk_user_id)',
    'CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_chats_user_updated ON chats(user_id, updated_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at)',
  ],
}
