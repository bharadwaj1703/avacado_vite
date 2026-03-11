import type { Migration } from './types'

export const migration0007AddChatsDeletedAt: Migration = {
  id: '0007_add_chats_deleted_at',
  statements: [
    'ALTER TABLE chats ADD COLUMN deleted_at TEXT',
  ],
}
