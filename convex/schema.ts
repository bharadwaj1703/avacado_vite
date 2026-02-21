import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const profession = v.union(
  v.literal('student'),
  v.literal('freelancer'),
  v.literal('founder'),
  v.literal('business_owner'),
  v.literal('working_professional'),
  v.literal('others')
)

const timeCommitmentSpan = v.union(
  v.literal(5),
  v.literal(10),
  v.literal(15),
  v.literal(20),
  v.literal(30)
)

const timeCommitmentFrequency = v.union(
  v.literal('daily'),
  v.literal('weekly'),
  v.literal('weekend'),
  v.literal('monthly')
)

const preferredTiming = v.union(
  v.literal('morning'),
  v.literal('lunch'),
  v.literal('evening'),
  v.literal('night')
)

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    leadId: v.optional(v.string()),
    displayName: v.optional(v.string()),
    profession: v.optional(profession),
    selfReportedAiKnowledge: v.optional(v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4))),
    companyWebsite: v.optional(v.string()),
    extractedCompanyDetails: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    timeCommitmentSpan: v.optional(timeCommitmentSpan),
    timeCommitmentFrequency: v.optional(timeCommitmentFrequency),
    preferredTiming: v.optional(preferredTiming),
    timezone: v.optional(v.string()),
    onboardingCompletedAt: v.optional(v.number()),
  }).index('by_clerk_user_id', ['clerkUserId']),

  userHistory: defineTable({
    userId: v.id('users'),
    actionKind: v.union(
      v.literal('lesson_watched'),
      v.literal('quiz_answered_correctly'),
      v.literal('quiz_answered_incorrectly')
    ),
    slug: v.string(),
    entity: v.union(v.literal('lesson'), v.literal('quiz')),
  }).index('by_user', ['userId']),
})
