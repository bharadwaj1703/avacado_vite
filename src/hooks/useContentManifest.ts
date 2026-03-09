import { useMemo } from 'react'
import manifest from 'virtual:content-manifest'
import type {
  ContentManifest,
  Curriculum,
  Milestone,
  Level,
  Lesson,
  Screen,
  Question,
  Rewards,
} from '@/types/content'

// ============================================================================
// Static Manifest Access
// ============================================================================

export const contentManifest: ContentManifest = manifest

// ============================================================================
// Hook: Full Manifest
// ============================================================================

export function useContentManifest(): ContentManifest {
  return contentManifest
}

// ============================================================================
// Hook: Curriculum
// ============================================================================

export function useCurriculum(): Curriculum {
  return contentManifest.curriculum
}

export function useRewards(): Rewards {
  return contentManifest.rewards
}

// ============================================================================
// Hook: Milestones
// ============================================================================

export function useMilestones(): Milestone[] {
  return useMemo(() => {
    return contentManifest.curriculum.milestone_refs
      .map((ref) => contentManifest.milestones[ref])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }, [])
}

export function useMilestone(milestoneId: string): Milestone | undefined {
  return useMemo(() => {
    return Object.values(contentManifest.milestones).find((m) => m.id === milestoneId)
  }, [milestoneId])
}

// ============================================================================
// Hook: Levels
// ============================================================================

export function useLevels(milestoneId: string): Level[] {
  return useMemo(() => {
    const milestone = Object.values(contentManifest.milestones).find((m) => m.id === milestoneId)
    if (!milestone) return []

    return milestone.level_refs
      .map((ref) => contentManifest.levels[ref])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }, [milestoneId])
}

export function useLevel(
  milestoneId: string,
  levelId: string
): Level | undefined {
  return useMemo(() => {
    return contentManifest.levels[`${milestoneId}/${levelId}`]
  }, [milestoneId, levelId])
}

// ============================================================================
// Hook: Lessons
// ============================================================================

export function useLessons(milestoneId: string, levelId: string): Lesson[] {
  return useMemo(() => {
    const level = contentManifest.levels[`${milestoneId}/${levelId}`]
    if (!level) return []

    return level.lesson_refs
      .map((ref) => contentManifest.lessons[ref])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order)
  }, [milestoneId, levelId])
}

export function useLesson(
  milestoneId: string,
  levelId: string,
  lessonId: string
): Lesson | undefined {
  return useMemo(() => {
    return contentManifest.lessons[`${milestoneId}/${levelId}/${lessonId}`]
  }, [milestoneId, levelId, lessonId])
}

// ============================================================================
// Hook: Screens
// ============================================================================

export function useScreens(
  milestoneId: string,
  levelId: string,
  lessonId: string
): Screen[] {
  return useMemo(() => {
    const lesson = contentManifest.lessons[`${milestoneId}/${levelId}/${lessonId}`]
    if (!lesson) return []

    return lesson.screen_refs
      .map((ref) => contentManifest.screens[ref])
      .filter(Boolean)
  }, [milestoneId, levelId, lessonId])
}

export function useScreen(
  milestoneId: string,
  levelId: string,
  lessonId: string,
  screenId: string
): Screen | undefined {
  return useMemo(() => {
    return contentManifest.screens[`${milestoneId}/${levelId}/${lessonId}/${screenId}`]
  }, [milestoneId, levelId, lessonId, screenId])
}

// ============================================================================
// Hook: Questions
// ============================================================================

export function useQuestions(
  milestoneId: string,
  levelId: string,
  lessonId: string
): Question[] {
  return useMemo(() => {
    const lesson = contentManifest.lessons[`${milestoneId}/${levelId}/${lessonId}`]
    if (!lesson?.quiz?.question_refs) return []

    return lesson.quiz.question_refs
      .map((ref) => contentManifest.questions[ref])
      .filter(Boolean)
  }, [milestoneId, levelId, lessonId])
}

export function useQuestion(
  milestoneId: string,
  levelId: string,
  lessonId: string,
  questionId: string
): Question | undefined {
  return useMemo(() => {
    return contentManifest.questions[`${milestoneId}/${levelId}/${lessonId}/${questionId}`]
  }, [milestoneId, levelId, lessonId, questionId])
}

// ============================================================================
// Hook: Quiz Config
// ============================================================================

export function useQuizConfig(milestoneId: string, levelId: string, lessonId: string) {
  return useMemo(() => {
    const lesson = contentManifest.lessons[`${milestoneId}/${levelId}/${lessonId}`]
    return lesson?.quiz ?? null
  }, [milestoneId, levelId, lessonId])
}

// ============================================================================
// Helper: Navigation
// ============================================================================

export function getAdjacentLesson(
  milestoneId: string,
  levelId: string,
  lessonId: string,
  direction: 'next' | 'prev'
): { milestoneId: string; levelId: string; lessonId: string } | null {
  const level = contentManifest.levels[`${milestoneId}/${levelId}`]
  if (!level) return null

  const lessons = level.lesson_refs
    .map((ref) => contentManifest.lessons[ref])
    .filter(Boolean)
    .sort((a, b) => a.order - b.order)

  const currentIndex = lessons.findIndex((l) => l.id === lessonId)
  if (currentIndex === -1) return null

  if (direction === 'next') {
    if (currentIndex < lessons.length - 1) {
      return { milestoneId, levelId, lessonId: lessons[currentIndex + 1]!.id }
    }
    // Try next level
    const milestone = Object.values(contentManifest.milestones).find((m) => m.id === milestoneId)
    if (milestone) {
      const levels = milestone.level_refs
        .map((ref) => contentManifest.levels[ref])
        .filter(Boolean)
        .sort((a, b) => a.order - b.order)
      const levelIndex = levels.findIndex((l) => l.id === levelId)
      if (levelIndex < levels.length - 1) {
        const nextLevel = levels[levelIndex + 1]
        if (nextLevel) {
          const nextLessons = nextLevel.lesson_refs
            .map((ref) => contentManifest.lessons[ref])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order)
          if (nextLessons.length > 0) {
            return { milestoneId, levelId: nextLevel.id, lessonId: nextLessons[0]!.id }
          }
        }
      }
    }
  } else {
    if (currentIndex > 0) {
      return { milestoneId, levelId, lessonId: lessons[currentIndex - 1]!.id }
    }
    // Try prev level
    const milestone = Object.values(contentManifest.milestones).find((m) => m.id === milestoneId)
    if (milestone) {
      const levels = milestone.level_refs
        .map((ref) => contentManifest.levels[ref])
        .filter(Boolean)
        .sort((a, b) => a.order - b.order)
      const levelIndex = levels.findIndex((l) => l.id === levelId)
      if (levelIndex > 0) {
        const prevLevel = levels[levelIndex - 1]
        if (prevLevel) {
          const prevLessons = prevLevel.lesson_refs
            .map((ref) => contentManifest.lessons[ref])
            .filter(Boolean)
            .sort((a, b) => a.order - b.order)
          if (prevLessons.length > 0) {
            return {
              milestoneId,
              levelId: prevLevel.id,
              lessonId: prevLessons[prevLessons.length - 1]!.id,
            }
          }
        }
      }
    }
  }

  return null
}

// ============================================================================
// Helper: Build paths
// ============================================================================

export function buildLessonPath(
  milestoneId: string,
  levelId: string,
  lessonId: string
): string {
  return `/lesson/${milestoneId}/${levelId}/${lessonId}`
}

export function buildLevelPath(milestoneId: string, levelId: string): string {
  return `/learn/${milestoneId}/${levelId}`
}

export function buildMilestonePath(milestoneId: string): string {
  return `/learn/${milestoneId}`
}
