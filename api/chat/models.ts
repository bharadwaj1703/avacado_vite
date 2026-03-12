import type { IncomingMessage, ServerResponse } from 'node:http'
import { getEnv } from '../_lib/env.js'
import { fetchAllowedModels } from '../_lib/openrouter-models.js'
import { methodNotAllowed, sendJson } from '../_lib/http.js'
import { requireClerkUserId } from '../_lib/auth.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, 'GET')
    return
  }

  try {
    await requireClerkUserId(req)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 401, { error: message })
    return
  }

  try {
    const env = getEnv()
    const models = await fetchAllowedModels(env)
    sendJson(res, 200, { data: models })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    sendJson(res, 500, { error: message })
  }
}
