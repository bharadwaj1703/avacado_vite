/**
 * Chat Routes
 * Route definitions for chat endpoints
 */

import { chatController } from '../controllers/chat.controller.js'
import type { HttpHandler } from '../types/common.types.js'

export const chatRoutes: Record<string, HttpHandler> = {
  '/api/chats': (req, res) => chatController.handleChats(req, res),
  '/api/chat/models': (req, res) => chatController.getModels(req, res),
}

/**
 * Dynamic route handler for /api/chats/:id
 */
export const chatByIdHandler: HttpHandler = (req, res) =>
  chatController.handleChatById(req, res)
