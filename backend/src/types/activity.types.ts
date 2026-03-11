/**
 * Activity Domain Types
 */

export type ActivityActionKind =
  | 'lesson_watched'
  | 'quiz_answered_correctly'
  | 'quiz_answered_incorrectly'

export type ActivityEntity = 'lesson' | 'quiz'

/**
 * Request/Response DTOs
 */
export interface RecordActivityRequest {
  actionKind: ActivityActionKind
  slug: string
  entity: ActivityEntity
}

export interface RecordActivityResponse {
  activityId: string | null
}
