/**
 * Chat Domain Types
 */

import type { UIMessage } from 'ai'

export type ChatStatus =
  | 'awaiting_user'
  | 'awaiting_llm'
  | 'streaming'
  | 'errored'
  | 'ready'

export type MessageRole = 'system' | 'developer' | 'user' | 'assistant' | 'tool'

/**
 * Database Row Types
 */
export interface ChatRow {
  id: string
  user_id: string
  title: string | null
  model_id: string | null
  deleted_at: string | null
  status: ChatStatus
  created_at: string
  updated_at: string
}

export interface MessageRow {
  id: string
  chat_id: string
  role: MessageRole
  content: string
  usage: string | null
  stop_reason: string | null
  created_at: string
}

/**
 * Request/Response DTOs
 */
export interface CreateChatRequest {
  title?: string | null
  modelId?: string
}

export interface CreateChatResponse extends ChatRow {}

export interface ListChatsResponse {
  data: ChatRow[]
}

export interface SendMessageRequest {
  id: string
  message: UIMessage
}

export interface ChatModelsResponse {
  data: Array<{
    id: string
    name: string
    description?: string
    contextLength?: number
    pricing?: {
      prompt: number
      completion: number
    }
  }>
}
