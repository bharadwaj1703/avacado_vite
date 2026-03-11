/**
 * Chat Service
 * Business logic for chat operations
 */

import { getDb } from '../_lib/db/adapter.js'
import { getEnv } from '../_lib/env.js'
import { fetchAllowedModels, isModelAllowed } from '../_lib/openrouter-models.js'
import type {
  ChatRow,
  CreateChatRequest,
  ListChatsResponse,
  ChatModelsResponse,
} from '../types/chat.types.js'

const MAX_CHATS_PER_USER = 50

export class ChatService {
  /**
   * List all chats for a user
   */
  async listChats(userId: string, limit = MAX_CHATS_PER_USER): Promise<ListChatsResponse> {
    const db = await getDb()
    const chats = await db.listChatsByUserId(userId, limit)
    return { data: chats }
  }

  /**
   * Create a new chat
   */
  async createChat(userId: string, request: CreateChatRequest): Promise<ChatRow> {
    const db = await getDb()

    // Check if user has active chat
    const hasActive = await db.hasUserActiveChat(userId)
    if (hasActive) {
      throw new Error(
        'Another chat is still generating a response. Wait for it to finish before starting a new chat.'
      )
    }

    // Check chat limit
    const count = await db.countChatsByUserId(userId)
    if (count >= MAX_CHATS_PER_USER) {
      throw new Error(
        'Maximum 50 chats per user. Delete an old chat to create a new one.'
      )
    }

    // Validate model
    const modelId = request.modelId?.trim()
    if (!modelId) {
      throw new Error('Missing modelId')
    }

    const env = getEnv()
    const allowedModels = await fetchAllowedModels(env)
    if (!isModelAllowed(modelId, allowedModels)) {
      throw new Error('Selected model is not allowed')
    }

    // Create chat
    const id = await db.createChat(userId, modelId, request.title ?? null)
    const chat = await db.getChatById(id)

    if (!chat) {
      throw new Error('Failed to create chat')
    }

    return chat
  }

  /**
   * Get chat by ID
   */
  async getChatById(chatId: string, userId: string): Promise<ChatRow> {
    const db = await getDb()
    const chat = await db.getChatById(chatId)

    if (!chat || chat.user_id !== userId) {
      throw new Error('Chat not found')
    }

    return chat
  }

  /**
   * Delete chat (soft delete)
   */
  async deleteChat(chatId: string, userId: string): Promise<void> {
    const db = await getDb()

    // Verify ownership
    const chat = await db.getChatById(chatId)
    if (!chat || chat.user_id !== userId) {
      throw new Error('Chat not found')
    }

    await db.softDeleteChat(chatId)
  }

  /**
   * Get allowed chat models
   */
  async getAllowedModels(): Promise<ChatModelsResponse> {
    const env = getEnv()
    const models = await fetchAllowedModels(env)

    return {
      data: models.map((m) => ({
        id: m.id,
        name: m.name,
        pricing: m.pricing,
        context_length: m.context_length,
      })),
    }
  }

  /**
   * Check if user has active chat
   */
  async hasActiveChat(userId: string): Promise<boolean> {
    const db = await getDb()
    return db.hasUserActiveChat(userId)
  }
}

// Singleton instance
export const chatService = new ChatService()
