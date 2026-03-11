import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'

const CONFIG_PATH = join(process.cwd(), 'prompts', 'ai_chat.yaml')

type ChatSystemPromptYaml = { content?: string }

let cached: string | null = null

/**
 * Load the system prompt content from prompts/ai_chat.yaml.
 */
export function loadChatSystemPrompt(): string {
  if (cached !== null) return cached
  try {
    const raw = readFileSync(CONFIG_PATH, 'utf-8')
    const parsed = yaml.load(raw) as ChatSystemPromptYaml | undefined
    const content = parsed?.content
    const text = typeof content === 'string' ? content.trim() : ''
    cached = text || 'You are a helpful assistant.'
    return cached
  } catch {
    cached = 'You are a helpful assistant.'
    return cached
  }
}
