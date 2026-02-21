import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    return user
  },
})

export const syncFromClerk = mutation({
  args: {
    leadId: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const clerkUserId = identity.subject
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', clerkUserId))
      .unique()
    if (existing) {
      const updates: { leadId?: string; displayName?: string } = {}
      if (args.leadId !== undefined && existing.leadId === undefined) updates.leadId = args.leadId
      if (args.displayName !== undefined) updates.displayName = args.displayName
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates)
      }
      return existing._id
    }
    return await ctx.db.insert('users', {
      clerkUserId,
      ...(args.leadId !== undefined && { leadId: args.leadId }),
      ...(args.displayName !== undefined && { displayName: args.displayName }),
    })
  },
})

const professionValidator = v.union(
  v.literal('student'),
  v.literal('freelancer'),
  v.literal('founder'),
  v.literal('business_owner'),
  v.literal('working_professional'),
  v.literal('others')
)
const aiKnowledgeValidator = v.union(v.literal(0), v.literal(1), v.literal(2), v.literal(3), v.literal(4))
const timeSpanValidator = v.union(v.literal(5), v.literal(10), v.literal(15), v.literal(20), v.literal(30))
const frequencyValidator = v.union(
  v.literal('daily'),
  v.literal('weekly'),
  v.literal('weekend'),
  v.literal('monthly')
)
const timingValidator = v.union(v.literal('morning'), v.literal('lunch'), v.literal('evening'), v.literal('night'))

export const updateOnboarding = mutation({
  args: {
    profession: v.optional(professionValidator),
    selfReportedAiKnowledge: v.optional(aiKnowledgeValidator),
    companyWebsite: v.optional(v.string()),
    extractedCompanyDetails: v.optional(v.string()),
    jobTitle: v.optional(v.string()),
    timeCommitmentSpan: v.optional(timeSpanValidator),
    timeCommitmentFrequency: v.optional(frequencyValidator),
    preferredTiming: v.optional(timingValidator),
    timezone: v.optional(v.string()),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) throw new Error('User not found')
    const { completed, ...payload } = args
    const patch: Record<string, unknown> = {}
    if (payload.profession !== undefined) patch.profession = payload.profession
    if (payload.selfReportedAiKnowledge !== undefined) patch.selfReportedAiKnowledge = payload.selfReportedAiKnowledge
    if (payload.companyWebsite !== undefined) patch.companyWebsite = payload.companyWebsite
    if (payload.extractedCompanyDetails !== undefined) patch.extractedCompanyDetails = payload.extractedCompanyDetails
    if (payload.jobTitle !== undefined) patch.jobTitle = payload.jobTitle
    if (payload.timeCommitmentSpan !== undefined) patch.timeCommitmentSpan = payload.timeCommitmentSpan
    if (payload.timeCommitmentFrequency !== undefined) patch.timeCommitmentFrequency = payload.timeCommitmentFrequency
    if (payload.preferredTiming !== undefined) patch.preferredTiming = payload.preferredTiming
    if (payload.timezone !== undefined) patch.timezone = payload.timezone
    if (completed) patch.onboardingCompletedAt = Date.now()
    await ctx.db.patch(user._id, patch)
    return user._id
  },
})
