/**
 * Seed script: run from Convex Dashboard or CLI to add simulated leaderboard users.
 * Run: npx convex run seed:run (or from Dashboard → Functions → seed → run)
 */
import { internalMutation } from './_generated/server'

const SEED_USERS = [
  { clerkUserId: 'seed_leaderboard_1', displayName: 'Alex' },
  { clerkUserId: 'seed_leaderboard_2', displayName: 'Sam' },
  { clerkUserId: 'seed_leaderboard_3', displayName: 'Jordan' },
  { clerkUserId: 'seed_leaderboard_4', displayName: 'Casey' },
  { clerkUserId: 'seed_leaderboard_5', displayName: 'Riley' },
]

export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('users').first()
    if (existing) {
      return { message: 'Seed already applied (users exist)', skipped: true }
    }

    const userIds: string[] = []
    for (const u of SEED_USERS) {
      const id = await ctx.db.insert('users', {
        clerkUserId: u.clerkUserId,
        displayName: u.displayName,
      })
      userIds.push(id)
    }

    const lessonSlugs = ['01-ai-foundations/01-intro-to-ai/01-what-is-ai', '01-ai-foundations/01-intro-to-ai/02-basics']
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i]
      const lessonsToAdd = 3 + i
      for (let j = 0; j < lessonsToAdd; j++) {
        await ctx.db.insert('userHistory', {
          userId,
          actionKind: 'lesson_watched',
          slug: lessonSlugs[j % lessonSlugs.length] ?? lessonSlugs[0],
          entity: 'lesson',
        })
      }
      for (let j = 0; j < i; j++) {
        await ctx.db.insert('userHistory', {
          userId,
          actionKind: 'quiz_answered_correctly',
          slug: lessonSlugs[0],
          entity: 'quiz',
        })
      }
    }

    return { message: `Seeded ${userIds.length} users with history`, userIds }
  },
})
