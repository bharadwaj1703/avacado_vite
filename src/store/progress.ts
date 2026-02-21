import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ContentManifest, LessonResult } from '@/types/content'

// ============================================================================
// Types
// ============================================================================

interface ProgressState {
  // Completed screens: key = "milestoneId/levelId/lessonId/screenId"
  completedScreens: Record<string, boolean>
  
  // Lesson results: key = "milestoneId/levelId/lessonId"
  lessonResults: Record<string, LessonResult>
  
  // Tracking
  lastAccessedLesson?: string
  lastAccessedAt?: string
}

interface ProgressActions {
  // Screen actions
  markScreenComplete: (milestoneId: string, levelId: string, lessonId: string, screenId: string) => void
  isScreenComplete: (milestoneId: string, levelId: string, lessonId: string, screenId: string) => boolean
  
  // Lesson actions
  recordLessonResult: (
    milestoneId: string,
    levelId: string,
    lessonId: string,
    score: number,
    passed: boolean
  ) => void
  getLessonResult: (milestoneId: string, levelId: string, lessonId: string) => LessonResult | undefined
  isLessonComplete: (milestoneId: string, levelId: string, lessonId: string) => boolean
  
  // Gating functions
  isLessonUnlocked: (
    milestoneId: string,
    levelId: string,
    lessonId: string,
    manifest: ContentManifest
  ) => boolean
  isLevelUnlocked: (
    milestoneId: string,
    levelId: string,
    manifest: ContentManifest
  ) => boolean
  isMilestoneUnlocked: (
    milestoneId: string,
    manifest: ContentManifest
  ) => boolean
  
  // Progress tracking
  updateLastAccessed: (milestoneId: string, levelId: string, lessonId: string) => void
  
  // Reset
  resetProgress: () => void
  resetLesson: (milestoneId: string, levelId: string, lessonId: string) => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function makeLessonKey(milestoneId: string, levelId: string, lessonId: string): string {
  return `${milestoneId}/${levelId}/${lessonId}`
}

function makeScreenKey(
  milestoneId: string,
  levelId: string,
  lessonId: string,
  screenId: string
): string {
  return `${milestoneId}/${levelId}/${lessonId}/${screenId}`
}

function parseLessonKey(key: string): { milestoneId: string; levelId: string; lessonId: string } {
  const parts = key.split('/')
  return {
    milestoneId: parts[0],
    levelId: parts[1],
    lessonId: parts[2],
  }
}

function parseRef(ref: string, expectedParts: number): string[] {
  const parts = ref.split('/')
  if (parts.length < expectedParts) {
    console.warn(`Unexpected ref format: ${ref}`)
    return Array(expectedParts).fill('')
  }
  return parts.slice(-expectedParts)
}

// ============================================================================
// Storage Adapter (swappable for future API sync)
// ============================================================================

const localStorageAdapter = {
  getItem: (name: string): string | null => {
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    localStorage.setItem(name, value)
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name)
  },
}

// ============================================================================
// Zustand Store
// ============================================================================

const initialState: ProgressState = {
  completedScreens: {},
  lessonResults: {},
}

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ----------------------------------------------------------------------
      // Screen Actions
      // ----------------------------------------------------------------------
      
      markScreenComplete: (milestoneId, levelId, lessonId, screenId) => {
        const key = makeScreenKey(milestoneId, levelId, lessonId, screenId)
        set((state) => ({
          completedScreens: {
            ...state.completedScreens,
            [key]: true,
          },
        }))
      },

      isScreenComplete: (milestoneId, levelId, lessonId, screenId) => {
        const key = makeScreenKey(milestoneId, levelId, lessonId, screenId)
        return !!get().completedScreens[key]
      },

      // ----------------------------------------------------------------------
      // Lesson Actions
      // ----------------------------------------------------------------------
      
      recordLessonResult: (milestoneId, levelId, lessonId, score, passed) => {
        const key = makeLessonKey(milestoneId, levelId, lessonId)
        const existing = get().lessonResults[key]
        
        const result: LessonResult = {
          lessonKey: key,
          score,
          passed,
          attempts: (existing?.attempts ?? 0) + 1,
          bestScore: existing ? Math.max(existing.bestScore, score) : score,
          completedAt: new Date().toISOString(),
        }

        set((state) => ({
          lessonResults: {
            ...state.lessonResults,
            [key]: result,
          },
        }))
      },

      getLessonResult: (milestoneId, levelId, lessonId) => {
        const key = makeLessonKey(milestoneId, levelId, lessonId)
        return get().lessonResults[key]
      },

      isLessonComplete: (milestoneId, levelId, lessonId) => {
        const result = get().getLessonResult(milestoneId, levelId, lessonId)
        return result?.passed ?? false
      },

      // ----------------------------------------------------------------------
      // Gating Functions
      // ----------------------------------------------------------------------
      
      isLessonUnlocked: (milestoneId, levelId, lessonId, manifest) => {
        // First lesson in a level is always unlocked
        const level = manifest.levels[`${milestoneId}/${levelId}`]
        if (!level) return false

        const lessonIds = level.lesson_refs
          .map((ref) => {
            const lesson = manifest.lessons[ref]
            return lesson?.id
          })
          .filter(Boolean) as string[]
        
        const lessonIndex = lessonIds.indexOf(lessonId)
        if (lessonIndex === -1) return false
        
        // First lesson is always unlocked
        if (lessonIndex === 0) return true

        // Check if previous lesson is complete
        const prevLessonId = lessonIds[lessonIndex - 1]
        const prevLessonKey = makeLessonKey(milestoneId, levelId, prevLessonId)
        const prevResult = get().lessonResults[prevLessonKey]
        
        // Previous lesson must be passed
        return prevResult?.passed ?? false
      },

      isLevelUnlocked: (milestoneId, levelId, manifest) => {
        const milestone = manifest.milestones[milestoneId]
        if (!milestone) return false

        const levelIds = milestone.level_refs
          .map((ref) => {
            const level = manifest.levels[ref]
            return level?.id
          })
          .filter(Boolean) as string[]

        const levelIndex = levelIds.indexOf(levelId)
        if (levelIndex === -1) return false

        // First level is always unlocked
        if (levelIndex === 0) return true

        // Check if all lessons in previous level are complete
        const prevLevelId = levelIds[levelIndex - 1]
        const prevLevel = manifest.levels[`${milestoneId}/${prevLevelId}`]
        if (!prevLevel) return false

        return prevLevel.lesson_refs.every((lessonRef) => {
          const lesson = manifest.lessons[lessonRef]
          if (!lesson) return false
          const key = makeLessonKey(milestoneId, prevLevelId, lesson.id)
          return get().lessonResults[key]?.passed ?? false
        })
      },

      isMilestoneUnlocked: (milestoneId, manifest) => {
        const milestoneIds = manifest.curriculum.milestone_refs
          .map((ref) => {
            const milestone = manifest.milestones[ref]
            return milestone?.id
          })
          .filter(Boolean) as string[]

        const milestoneIndex = milestoneIds.indexOf(milestoneId)
        if (milestoneIndex === -1) return false

        // First milestone is always unlocked
        if (milestoneIndex === 0) return true

        // Check if all levels in previous milestone are complete
        const prevMilestoneId = milestoneIds[milestoneIndex - 1]
        const prevMilestone = manifest.milestones[prevMilestoneId]
        if (!prevMilestone) return false

        return prevMilestone.level_refs.every((levelRef) => {
          const level = manifest.levels[levelRef]
          if (!level) return false
          const [, levelId] = parseRef(levelRef, 2)
          return level.lesson_refs.every((lessonRef) => {
            const lesson = manifest.lessons[lessonRef]
            if (!lesson) return false
            const [, , lessonId] = parseRef(lessonRef, 3)
            const key = makeLessonKey(prevMilestoneId, levelId, lessonId)
            return get().lessonResults[key]?.passed ?? false
          })
        })
      },

      // ----------------------------------------------------------------------
      // Progress Tracking
      // ----------------------------------------------------------------------
      
      updateLastAccessed: (milestoneId, levelId, lessonId) => {
        set({
          lastAccessedLesson: makeLessonKey(milestoneId, levelId, lessonId),
          lastAccessedAt: new Date().toISOString(),
        })
      },

      // ----------------------------------------------------------------------
      // Reset
      // ----------------------------------------------------------------------
      
      resetProgress: () => {
        set(initialState)
      },

      resetLesson: (milestoneId, levelId, lessonId) => {
        const key = makeLessonKey(milestoneId, levelId, lessonId)
        const screenPrefix = `${key}/`

        set((state) => {
          // Remove lesson result
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [key]: _removed, ...remainingResults } = state.lessonResults

          // Remove completed screens for this lesson
          const filteredScreens = Object.fromEntries(
            Object.entries(state.completedScreens).filter(
              ([k]) => !k.startsWith(screenPrefix)
            )
          )

          return {
            lessonResults: remainingResults,
            completedScreens: filteredScreens,
          }
        })
      },
    }),
    {
      name: 'avacado-progress',
      storage: {
        getItem: (name) => {
          const value = localStorageAdapter.getItem(name)
          return value ? JSON.parse(value) : null
        },
        setItem: (name, value) => {
          localStorageAdapter.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          localStorageAdapter.removeItem(name)
        },
      },
    }
  )
)

// ============================================================================
// Helper Hooks
// ============================================================================

export function useLessonProgress(milestoneId: string, levelId: string, lessonId: string) {
  const result = useProgressStore((state) => state.getLessonResult(milestoneId, levelId, lessonId))
  const isComplete = useProgressStore((state) => state.isLessonComplete(milestoneId, levelId, lessonId))
  const recordResult = useProgressStore((state) => state.recordLessonResult)
  const reset = useProgressStore((state) => state.resetLesson)

  return {
    result,
    isComplete,
    recordResult: (score: number, passed: boolean) =>
      recordResult(milestoneId, levelId, lessonId, score, passed),
    reset: () => reset(milestoneId, levelId, lessonId),
  }
}

export function useScreenProgress(milestoneId: string, levelId: string, lessonId: string) {
  const markComplete = useProgressStore((state) => state.markScreenComplete)
  const isComplete = useProgressStore((state) => state.isScreenComplete)

  return {
    markScreenComplete: (screenId: string) =>
      markComplete(milestoneId, levelId, lessonId, screenId),
    isScreenComplete: (screenId: string) =>
      isComplete(milestoneId, levelId, lessonId, screenId),
  }
}

export function useGating(manifest: ContentManifest) {
  const isLessonUnlockedFn = useProgressStore((state) => state.isLessonUnlocked)
  const isLevelUnlockedFn = useProgressStore((state) => state.isLevelUnlocked)
  const isMilestoneUnlockedFn = useProgressStore((state) => state.isMilestoneUnlocked)

  return {
    isLessonUnlocked: (milestoneId: string, levelId: string, lessonId: string) =>
      isLessonUnlockedFn(milestoneId, levelId, lessonId, manifest),
    isLevelUnlocked: (milestoneId: string, levelId: string) =>
      isLevelUnlockedFn(milestoneId, levelId, manifest),
    isMilestoneUnlocked: (milestoneId: string) =>
      isMilestoneUnlockedFn(milestoneId, manifest),
  }
}

// ============================================================================
// Export Key Helpers
// ============================================================================

export { makeLessonKey, makeScreenKey, parseLessonKey }
