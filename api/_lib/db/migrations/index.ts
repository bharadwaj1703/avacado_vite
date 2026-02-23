import { migration0001CreateUsers } from './0001_create_users'
import { migration0002CreateActivities } from './0002_create_activities'
import { migration0003CreateChats } from './0003_create_chats'
import { migration0004CreateMessages } from './0004_create_messages'
import { migration0005CreateIndexes } from './0005_create_indexes'
import { migration0006CreateChatModels } from './0006_create_chat_models'
import { migration0007AddChatsDeletedAt } from './0007_add_chats_deleted_at'
import type { Migration } from './types'

export const MIGRATIONS: Migration[] = [
  migration0001CreateUsers,
  migration0002CreateActivities,
  migration0003CreateChats,
  migration0004CreateMessages,
  migration0005CreateIndexes,
  migration0006CreateChatModels,
  migration0007AddChatsDeletedAt,
]
