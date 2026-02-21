import { query } from './_generated/server'

function toDateKey(ms: number): string {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export const streak = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return 0
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) return 0
    const history = await ctx.db
      .query('userHistory')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()
    const daysWithActivity = new Set<string>()
    for (const row of history) {
      if (row.actionKind === 'lesson_watched' || row.entity === 'quiz') {
        daysWithActivity.add(toDateKey(row._creationTime))
      }
    }
    const sortedDays = Array.from(daysWithActivity).sort().reverse()
    if (sortedDays.length === 0) return 0
    const today = toDateKey(Date.now())
    let streakCount = 0
    let expected = today
    for (const day of sortedDays) {
      if (day !== expected) break
      streakCount += 1
      const [y, m, dStr] = day.split('-').map(Number)
      const prev = new Date(Date.UTC(y, m - 1, dStr))
      prev.setUTCDate(prev.getUTCDate() - 1)
      expected = toDateKey(prev.getTime())
    }
    return streakCount
  },
})

export const completedLessonSlugs = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) return []
    const history = await ctx.db
      .query('userHistory')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    const slugs = new Set<string>()
    for (const row of history) {
      if (row.entity === 'lesson' && row.actionKind === 'lesson_watched') {
        slugs.add(row.slug)
      }
    }
    return Array.from(slugs)
  },
})

export const metrics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { streak: 0, completedLessonSlugs: [] }
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', identity.subject))
      .unique()
    if (!user) return { streak: 0, completedLessonSlugs: [] }
    const history = await ctx.db
      .query('userHistory')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .collect()
    const daysWithActivity = new Set<string>()
    const lessonSlugs = new Set<string>()
    for (const row of history) {
      if (row.actionKind === 'lesson_watched' || row.entity === 'quiz') {
        daysWithActivity.add(toDateKey(row._creationTime))
      }
      if (row.entity === 'lesson' && row.actionKind === 'lesson_watched') {
        lessonSlugs.add(row.slug)
      }
    }
    const sortedDays = Array.from(daysWithActivity).sort().reverse()
    let streakCount = 0
    if (sortedDays.length > 0) {
      const today = toDateKey(Date.now())
      let expected = today
      for (const day of sortedDays) {
        if (day !== expected) break
        streakCount += 1
        const [y, m, dStr] = day.split('-').map(Number)
        const prev = new Date(Date.UTC(y, m - 1, dStr))
        prev.setUTCDate(prev.getUTCDate() - 1)
        expected = toDateKey(prev.getTime())
      }
    }
    return {
      streak: streakCount,
      completedLessonSlugs: Array.from(lessonSlugs),
    }
  },
})
