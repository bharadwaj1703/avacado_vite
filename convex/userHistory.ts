import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

const actionKindValidator = v.union(
  v.literal('lesson_watched'),
  v.literal('quiz_answered_correctly'),
  v.literal('quiz_answered_incorrectly')
)
const entityValidator = v.union(v.literal('lesson'), v.literal('quiz'))

export const record = mutation({
  args: {
    actionKind: actionKindValidator,
    slug: v.string(),
    entity: entityValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    // Auth may not be ready on initial client frames; skip quietly.
    if (!identity) return null
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) return null
    return await ctx.db.insert('userHistory', {
      userId: user._id,
      actionKind: args.actionKind,
      slug: args.slug,
      entity: args.entity,
    })
  },
})

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) return []
    return await ctx.db
      .query('userHistory')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(500)
  },
})
