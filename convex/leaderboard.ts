import { query } from './_generated/server'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    const currentUser = identity
      ? await ctx.db
          .query('users')
          .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
          .unique()
      : null

    const allHistory = await ctx.db.query('userHistory').collect()
    const scoreByUser = new Map<string, number>()
    for (const row of allHistory) {
      const id = row.userId
      const s = scoreByUser.get(id) ?? 0
      if (row.actionKind === 'lesson_watched') {
        scoreByUser.set(id, s + 1)
      } else if (row.actionKind === 'quiz_answered_correctly') {
        scoreByUser.set(id, s + 2)
      }
      // quiz_answered_incorrectly: no points or +0
    }

    const allUsers = await ctx.db.query('users').collect()
    const entries: { userId: string; displayName: string; score: number }[] = allUsers.map((u) => ({
      userId: u._id,
      displayName: u.displayName ?? 'Learner',
      score: scoreByUser.get(u._id) ?? 0,
    }))
    entries.sort((a, b) => b.score - a.score)
    const topN = 20
    const result: { rank: number; userId: string; displayName: string; score: number; isCurrentUser: boolean }[] = entries
      .slice(0, topN)
      .map((e, i) => ({
        rank: i + 1,
        userId: e.userId,
        displayName: e.displayName,
        score: e.score,
        isCurrentUser: !!currentUser && e.userId === currentUser._id,
      }))

    if (currentUser) {
      const inTop = result.some((r) => r.userId === currentUser._id)
      if (!inTop) {
        const myScore = scoreByUser.get(currentUser._id) ?? 0
        const myRank = entries.findIndex((e) => e.userId === currentUser._id) + 1
        result.push({
          rank: myRank,
          userId: currentUser._id,
          displayName: currentUser.displayName ?? 'You',
          score: myScore,
          isCurrentUser: true,
        })
      }
    }

    return result
  },
})
