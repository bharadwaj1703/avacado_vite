/**
 * Activity Service
 * Business logic for activity tracking
 */

import { getDb } from '../_lib/db/adapter.js'
import type { RecordActivityRequest, RecordActivityResponse } from '../types/activity.types.js'

export class ActivityService {
  /**
   * Record user activity
   */
  async recordActivity(
    clerkUserId: string,
    input: RecordActivityRequest
  ): Promise<RecordActivityResponse> {
    const db = await getDb()

    const activityId = await db.insertActivity({
      clerkUserId,
      input,
    })

    return { activityId }
  }
}

// Singleton instance
export const activityService = new ActivityService()
