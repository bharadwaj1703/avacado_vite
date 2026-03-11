/**
 * Chat Controller
 * Handles HTTP requests for chat endpoints
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import { requireClerkUserId } from '../_lib/auth.js'
import { methodNotAllowed, sendJson, readBodyJson } from '../_lib/http.js'
import { userService } from '../services/user.service.js'
import { chatService } from '../services/chat.service.js'
import type { CreateChatRequest } from '../types/chat.types.js'

export class ChatController {
  /**
   * GET /api/chats - List all chats
   * POST /api/chats - Create new chat
   */
  async handleChats(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'GET' && req.method !== 'POST') {
      methodNotAllowed(res, 'GET, POST')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const user = await userService.findUserByClerkId(clerkUserId)

      if (!user) {
        sendJson(res, 404, { error: 'User not found' })
        return
      }

      if (req.method === 'GET') {
        const chats = await chatService.listChats(user.id)
        sendJson(res, 200, chats)
        return
      }

      if (req.method === 'POST') {
        const body = await readBodyJson<CreateChatRequest>(req)
        const chat = await chatService.createChat(user.id, body)
        sendJson(res, 200, chat)
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      
      // Map specific errors to status codes
      let statusCode = 500
      if (message.includes('bearer token')) statusCode = 401
      else if (message.includes('Another chat is still generating')) statusCode = 409
      else if (message.includes('Maximum 50 chats')) statusCode = 400
      else if (message.includes('Missing modelId')) statusCode = 400
      else if (message.includes('not allowed')) statusCode = 400

      sendJson(res, statusCode, { error: message })
    }
  }

  /**
   * GET /api/chats/:id - Get chat by ID
   * DELETE /api/chats/:id - Delete chat
   */
  async handleChatById(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'GET' && req.method !== 'DELETE') {
      methodNotAllowed(res, 'GET, DELETE')
      return
    }

    try {
      const clerkUserId = await requireClerkUserId(req)
      const user = await userService.findUserByClerkId(clerkUserId)

      if (!user) {
        sendJson(res, 404, { error: 'User not found' })
        return
      }

      // Extract chat ID from URL
      const url = new URL(req.url ?? '/', 'http://localhost')
      const chatId = url.pathname.split('/').filter(Boolean)[2]

      if (!chatId) {
        sendJson(res, 400, { error: 'Missing chat ID' })
        return
      }

      if (req.method === 'GET') {
        const chat = await chatService.getChatById(chatId, user.id)
        sendJson(res, 200, chat)
        return
      }

      if (req.method === 'DELETE') {
        await chatService.deleteChat(chatId, user.id)
        sendJson(res, 200, { ok: true })
        return
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('not found') ? 404 : 500
      sendJson(res, statusCode, { error: message })
    }
  }

  /**
   * GET /api/chat/models
   * Get available chat models
   */
  async getModels(
    req: IncomingMessage & { body?: unknown },
    res: ServerResponse
  ): Promise<void> {
    if (req.method !== 'GET') {
      methodNotAllowed(res, 'GET')
      return
    }

    try {
      await requireClerkUserId(req)
      const models = await chatService.getAllowedModels()
      sendJson(res, 200, models)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const statusCode = message.includes('bearer token') ? 401 : 500
      sendJson(res, statusCode, { error: message })
    }
  }
}

// Singleton instance
export const chatController = new ChatController()
