/**
 * User Service
 * Business logic for user operations
 */

import { getDb } from '../_lib/db/adapter.js'
import type {
  UserRow,
  OnboardingInput,
  UserProfileResponse,
  UserSyncRequest,
  UserSyncResponse,
  OnboardingResponse,
} from '../types/user.types.js'

export class UserService {
  /**
   * Get user profile by Clerk ID
   * Creates user if doesn't exist
   */
  async getUserProfile(clerkUserId: string): Promise<UserProfileResponse> {
    const db = await getDb()

    // Try to find existing user
    let user = await db.findUserByClerkId(clerkUserId)

    // Create user if doesn't exist
    if (!user) {
      await db.upsertUserFromClerk({ clerkUserId })
      user = await db.findUserByClerkId(clerkUserId)
    }

    if (!user) {
      throw new Error('Failed to retrieve user after upsert')
    }

    return {
      id: user.id,
      clerkUserId: user.clerk_user_id,
      displayName: user.display_name,
      onboardingCompletedAt: user.onboarding_completed_at,
    }
  }

  /**
   * Sync user data from Clerk
   */
  async syncUser(clerkUserId: string, data: UserSyncRequest): Promise<UserSyncResponse> {
    const db = await getDb()

    const userId = await db.upsertUserFromClerk({
      clerkUserId,
      leadId: data.leadId,
      displayName: data.displayName,
    })

    return { userId }
  }

  /**
   * Update user onboarding data
   */
  async updateOnboarding(
    clerkUserId: string,
    input: OnboardingInput
  ): Promise<OnboardingResponse> {
    const db = await getDb()

    const result = await db.updateOnboarding({ clerkUserId, input })

    return {
      userId: result.userId,
      onboardingCompletedAt: result.onboardingCompletedAt,
    }
  }

  /**
   * Find user by Clerk ID
   */
  async findUserByClerkId(clerkUserId: string): Promise<UserRow | null> {
    const db = await getDb()
    return db.findUserByClerkId(clerkUserId)
  }

  /**
   * Upsert user from Clerk webhook
   */
  async upsertUserFromWebhook(
    clerkUserId: string,
    displayName?: string
  ): Promise<string> {
    const db = await getDb()
    return db.upsertUserFromClerk({ clerkUserId, displayName })
  }
}

// Singleton instance
export const userService = new UserService()
