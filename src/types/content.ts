import { z } from 'zod'

// ============================================================================
// Enums
// ============================================================================

export const HeroTypeEnum = z.enum([
  'image',
  'video',
  'gif',
  'animated-svg',
  'interactive',
  'mascot',
])

export const MatchStrategyEnum = z.enum([
  'exact',
  'fuzzy',
  'regex',
  'number',
  'number-range',
])

export const PassingRuleEnum = z.enum([
  'match-all',
  'at-least-k',
  'strict',
])

export const OneOfManyRenderAsEnum = z.enum([
  'radio',
  'cards',
  'button-grid',
  'dropdown',
])

export const ManyOfManyRenderAsEnum = z.enum([
  'checkboxes',
  'card-grid',
  'toggle-list',
])

// ============================================================================
// Hero Configuration
// ============================================================================

export const SyncPointSchema = z.object({
  word_index: z.number().int().min(0),
  action: z.enum(['highlight', 'animate', 'trigger']),
  target: z.string().optional(),
})

export const ImageHeroSchema = z.object({
  type: z.literal('image'),
  src: z.string(),
  alt: z.string(),
  sync_points: z.array(SyncPointSchema).optional(),
})

export const VideoHeroSchema = z.object({
  type: z.literal('video'),
  src: z.string(),
  poster: z.string().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  muted: z.boolean().optional(),
  sync_points: z.array(SyncPointSchema).optional(),
})

export const GifHeroSchema = z.object({
  type: z.literal('gif'),
  src: z.string(),
  alt: z.string(),
  sync_points: z.array(SyncPointSchema).optional(),
})

export const AnimatedSVGHeroSchema = z.object({
  type: z.literal('animated-svg'),
  src: z.string(),
  animation_config: z.record(z.string(), z.unknown()).optional(),
  sync_points: z.array(SyncPointSchema).optional(),
})

export const InteractiveHeroSchema = z.object({
  type: z.literal('interactive'),
  component: z.string(),
  props: z.record(z.string(), z.unknown()).optional(),
  sync_points: z.array(SyncPointSchema).optional(),
})

export const MascotHeroSchema = z.object({
  type: z.literal('mascot'),
  eye_variant: z.string().optional(),
  mouth_variant: z.string().optional(),
  cta_text: z.string().optional(),
  cta_action: z.enum(['next', 'quiz', 'home']).optional(),
})

export const HeroConfigSchema = z.union([
  ImageHeroSchema,
  VideoHeroSchema,
  GifHeroSchema,
  AnimatedSVGHeroSchema,
  InteractiveHeroSchema,
  MascotHeroSchema,
])

// ============================================================================
// Question Schemas
// ============================================================================

export const BaseQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  hint: z.string().optional(),
  explanation: z.string(),
  points: z.number().default(1),
})

export const TextEntryQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('text-entry'),
  match_strategy: MatchStrategyEnum,
  correct_answer: z.union([z.string(), z.number(), z.array(z.string())]),
  case_sensitive: z.boolean().optional(),
  fuzzy_threshold: z.number().min(0).max(1).optional(),
  range_min: z.number().optional(),
  range_max: z.number().optional(),
  tolerance: z.number().optional(),
  placeholder: z.string().optional(),
})

export const OneOfManyOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  image: z.string().optional(),
})

export const OneOfManyQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('one-of-many'),
  options: z.array(OneOfManyOptionSchema).min(2),
  correct_option: z.string(),
  render_as: OneOfManyRenderAsEnum.default('radio'),
  partial_credit: z.boolean().optional(),
})

export const ManyOfManyOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  image: z.string().optional(),
})

export const ManyOfManyQuestionSchema = BaseQuestionSchema.extend({
  type: z.literal('many-of-many'),
  options: z.array(ManyOfManyOptionSchema).min(2),
  correct_options: z.array(z.string()).min(1),
  passing_rule: PassingRuleEnum.default('match-all'),
  min_required: z.number().int().min(1).optional(),
  partial_credit: z.boolean().optional(),
  render_as: ManyOfManyRenderAsEnum.default('checkboxes'),
})

export const QuestionSchema = z.union([
  TextEntryQuestionSchema,
  OneOfManyQuestionSchema,
  ManyOfManyQuestionSchema,
])

// ============================================================================
// Screen Schema
// ============================================================================

export const CheckpointQuizSchema = z.object({
  question_ref: z.string(),
  required_to_pass: z.boolean().default(true),
  allow_skip: z.boolean().default(false),
})

export const ScreenSchema = z.object({
  id: z.string(),
  title: z.string(),
  hero: HeroConfigSchema,
  transcript: z.string(),
  checkpoint_quiz: CheckpointQuizSchema.optional(),
  estimated_duration_seconds: z.number().int().optional(),
})

// ============================================================================
// Quiz Configuration
// ============================================================================

export const QuizConfigSchema = z.object({
  question_refs: z.array(z.string()),
  minimum_passing_score: z.number().min(0).max(1).default(0.7),
  allow_retry: z.boolean().default(true),
  show_answers_after: z.boolean().default(true),
  max_attempts: z.number().int().min(1).optional(),
  time_limit_minutes: z.number().int().min(1).optional(),
})

// ============================================================================
// Lesson, Level, Milestone, Curriculum Schemas
// ============================================================================

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int(),
  screen_refs: z.array(z.string()),
  quiz: QuizConfigSchema.optional(),
  estimated_duration_minutes: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
})

export const LevelSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int(),
  lesson_refs: z.array(z.string()),
  thumbnail: z.string().optional(),
})

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int(),
  level_refs: z.array(z.string()),
  thumbnail: z.string().optional(),
  color_theme: z.string().optional(),
})

export const CurriculumSchema = z.object({
  version: z.string(),
  title: z.string(),
  description: z.string(),
  last_updated: z.string().datetime().optional(),
  milestone_refs: z.array(z.string()),
})

// ============================================================================
// Content Manifest
// ============================================================================

export const ContentManifestSchema = z.object({
  version: z.string(),
  generated_at: z.string().datetime(),
  curriculum: CurriculumSchema,
  milestones: z.record(z.string(), MilestoneSchema),
  levels: z.record(z.string(), LevelSchema),
  lessons: z.record(z.string(), LessonSchema),
  screens: z.record(z.string(), ScreenSchema),
  questions: z.record(z.string(), QuestionSchema),
})

// ============================================================================
// Type Exports
// ============================================================================

export type HeroType = z.infer<typeof HeroTypeEnum>
export type MatchStrategy = z.infer<typeof MatchStrategyEnum>
export type PassingRule = z.infer<typeof PassingRuleEnum>
export type OneOfManyRenderAs = z.infer<typeof OneOfManyRenderAsEnum>
export type ManyOfManyRenderAs = z.infer<typeof ManyOfManyRenderAsEnum>

export type SyncPoint = z.infer<typeof SyncPointSchema>
export type HeroConfig = z.infer<typeof HeroConfigSchema>

export type TextEntryQuestion = z.infer<typeof TextEntryQuestionSchema>
export type OneOfManyQuestion = z.infer<typeof OneOfManyQuestionSchema>
export type ManyOfManyQuestion = z.infer<typeof ManyOfManyQuestionSchema>
export type Question = z.infer<typeof QuestionSchema>

export type CheckpointQuiz = z.infer<typeof CheckpointQuizSchema>
export type Screen = z.infer<typeof ScreenSchema>

export type QuizConfig = z.infer<typeof QuizConfigSchema>
export type Lesson = z.infer<typeof LessonSchema>
export type Level = z.infer<typeof LevelSchema>
export type Milestone = z.infer<typeof MilestoneSchema>
export type Curriculum = z.infer<typeof CurriculumSchema>

export type ContentManifest = z.infer<typeof ContentManifestSchema>

// ============================================================================
// Progress Types
// ============================================================================

export interface LessonResult {
  lessonKey: string
  score: number
  passed: boolean
  attempts: number
  bestScore: number
  completedAt: string
}

export interface ScreenProgress {
  screenKey: string
  completed: boolean
  completedAt?: string
}

export interface ProgressState {
  completedScreens: Record<string, boolean>
  lessonResults: Record<string, LessonResult>
  lastAccessedLesson?: string
  lastAccessedAt?: string
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface QuestionResult {
  questionId: string
  correct: boolean
  partial: boolean
  pointsEarned: number
  pointsPossible: number
  userAnswer: unknown
  correctAnswer: unknown
  feedback: string
}

export interface AssessmentResult {
  score: number
  passed: boolean
  totalPoints: number
  pointsEarned: number
  breakdown: {
    correct: number
    partial: number
    incorrect: number
  }
  questionResults: QuestionResult[]
}
