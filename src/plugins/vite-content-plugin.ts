import type { Plugin, ViteDevServer } from 'vite'
import yaml from 'js-yaml'
import type { ZodSchema } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import {
  CurriculumSchema,
  MilestoneSchema,
  LevelSchema,
  LessonSchema,
  ScreenSchema,
  QuestionSchema,
  type ContentManifest,
} from '../types/content'

const VIRTUAL_MODULE_ID = 'virtual:content-manifest'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

interface ContentFile {
  path: string
  content: unknown
  type: 'curriculum' | 'milestone' | 'level' | 'lesson' | 'screen' | 'question'
}

interface ValidationError {
  file: string
  error: string
}

// ============================================================================
// File Type Detection
// ============================================================================

function detectFileType(filePath: string): ContentFile['type'] | null {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
  const filename = parts[parts.length - 1]

  if (filename === 'curriculum.yaml') return 'curriculum'
  if (filename === 'milestone.yaml') return 'milestone'
  if (filename === 'level.yaml') return 'level'
  if (filename === 'lesson.yaml') return 'lesson'
  if (parts.includes('screens')) return 'screen'
  if (parts.includes('questions')) return 'question'

  return null
}

function getSchemaForType(type: ContentFile['type']): ZodSchema {
  switch (type) {
    case 'curriculum':
      return CurriculumSchema
    case 'milestone':
      return MilestoneSchema
    case 'level':
      return LevelSchema
    case 'lesson':
      return LessonSchema
    case 'screen':
      return ScreenSchema
    case 'question':
      return QuestionSchema
    default:
      throw new Error(`Unknown content type: ${type}`)
  }
}

function generateKey(filePath: string, content: unknown, type: ContentFile['type']): string {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')

  switch (type) {
    case 'curriculum':
      return 'curriculum'
    case 'milestone': {
      const milestoneId = parts.find((p) => p.match(/^\d+-/))?.replace(/\.yaml$/, '')
      return milestoneId || (content as { id: string }).id
    }
    case 'level': {
      const milestoneId = parts.find((p) => p.match(/^\d+-/))
      const levelId = parts
        .slice(parts.indexOf('levels') + 1)
        .find((p) => p.match(/^\d+-/))
        ?.replace(/\.yaml$/, '')
      return `${milestoneId}/${levelId}`
    }
    case 'lesson': {
      const milestoneId = parts.find((p) => p.match(/^\d+-/))
      const levelId = parts
        .slice(parts.indexOf('levels') + 1)
        .find((p) => p.match(/^\d+-/))
      const lessonId = parts
        .slice(parts.indexOf('lessons') + 1)
        .find((p) => p.match(/^\d+-/))
        ?.replace(/\.yaml$/, '')
      return `${milestoneId}/${levelId}/${lessonId}`
    }
    case 'screen': {
      const milestoneId = parts.find((p) => p.match(/^\d+-/))
      const levelId = parts
        .slice(parts.indexOf('levels') + 1)
        .find((p) => p.match(/^\d+-/))
      const lessonId = parts
        .slice(parts.indexOf('lessons') + 1)
        .find((p) => p.match(/^\d+-/))
      const screenId = parts[parts.length - 1].replace(/\.yaml$/, '')
      return `${milestoneId}/${levelId}/${lessonId}/${screenId}`
    }
    case 'question': {
      const milestoneId = parts.find((p) => p.match(/^\d+-/))
      const levelId = parts
        .slice(parts.indexOf('levels') + 1)
        .find((p) => p.match(/^\d+-/))
      const lessonId = parts
        .slice(parts.indexOf('lessons') + 1)
        .find((p) => p.match(/^\d+-/))
      const questionId = parts[parts.length - 1].replace(/\.yaml$/, '')
      return `${milestoneId}/${levelId}/${lessonId}/${questionId}`
    }
    default:
      return filePath
  }
}

// ============================================================================
// File Loading & Validation
// ============================================================================

function loadContentFiles(contentDir: string): { files: ContentFile[]; errors: ValidationError[] } {
  const files: ContentFile[] = []
  const errors: ValidationError[] = []

  function traverse(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        traverse(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        try {
          const content = yaml.load(fs.readFileSync(fullPath, 'utf-8'))
          const type = detectFileType(fullPath)

          if (!type) {
            errors.push({ file: fullPath, error: 'Could not determine content type' })
            continue
          }

          files.push({ path: fullPath, content, type })
        } catch (e) {
          errors.push({
            file: fullPath,
            error: e instanceof Error ? e.message : 'Unknown parse error',
          })
        }
      }
    }
  }

  if (fs.existsSync(contentDir)) {
    traverse(contentDir)
  }

  return { files, errors }
}

function validateContent(files: ContentFile[]): { valid: ContentFile[]; errors: ValidationError[] } {
  const valid: ContentFile[] = []
  const errors: ValidationError[] = []

  for (const file of files) {
    const schema = getSchemaForType(file.type)
    const result = schema.safeParse(file.content)

    if (result.success) {
      valid.push({ ...file, content: result.data })
    } else {
      const errorMessages = result.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')
      errors.push({ file: file.path, error: errorMessages })
    }
  }

  return { valid, errors }
}

// ============================================================================
// Reference Validation
// ============================================================================

function validateReferences(
  files: ContentFile[],
  contentDir: string
): ValidationError[] {
  const errors: ValidationError[] = []
  const filePaths = new Set(files.map((f) => f.path.replace(/\\/g, '/')))

  for (const file of files) {
    const data = file.content as Record<string, unknown>
    const dir = path.dirname(file.path)

    // Check milestone_refs in curriculum
    if (file.type === 'curriculum' && Array.isArray(data.milestone_refs)) {
      for (const ref of data.milestone_refs) {
        const resolved = path.resolve(contentDir, ref)
        if (!filePaths.has(resolved.replace(/\\/g, '/'))) {
          errors.push({ file: file.path, error: `Missing milestone ref: ${ref}` })
        }
      }
    }

    // Check level_refs in milestone
    if (file.type === 'milestone' && Array.isArray(data.level_refs)) {
      for (const ref of data.level_refs) {
        const resolved = path.resolve(dir, ref)
        if (!filePaths.has(resolved.replace(/\\/g, '/'))) {
          errors.push({ file: file.path, error: `Missing level ref: ${ref}` })
        }
      }
    }

    // Check lesson_refs in level
    if (file.type === 'level' && Array.isArray(data.lesson_refs)) {
      for (const ref of data.lesson_refs) {
        const resolved = path.resolve(dir, ref)
        if (!filePaths.has(resolved.replace(/\\/g, '/'))) {
          errors.push({ file: file.path, error: `Missing lesson ref: ${ref}` })
        }
      }
    }

    // Check screen_refs in lesson
    if (file.type === 'lesson' && Array.isArray(data.screen_refs)) {
      for (const ref of data.screen_refs) {
        const resolved = path.resolve(dir, ref)
        if (!filePaths.has(resolved.replace(/\\/g, '/'))) {
          errors.push({ file: file.path, error: `Missing screen ref: ${ref}` })
        }
      }
    }

    // Check question_refs in quiz
    if (file.type === 'lesson' && data.quiz && typeof data.quiz === 'object') {
      const quiz = data.quiz as { question_refs?: string[] }
      if (Array.isArray(quiz.question_refs)) {
        for (const ref of quiz.question_refs) {
          const resolved = path.resolve(dir, ref)
          if (!filePaths.has(resolved.replace(/\\/g, '/'))) {
            errors.push({ file: file.path, error: `Missing question ref: ${ref}` })
          }
        }
      }
    }
  }

  return errors
}

// ============================================================================
// Manifest Generation
// ============================================================================

/**
 * Build a mapping from absolute file paths → manifest keys.
 * Used to rewrite *_refs from relative YAML paths into compact manifest keys.
 */
function buildPathToKeyMap(files: ContentFile[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const file of files) {
    const key = generateKey(file.path, file.content, file.type)
    map.set(file.path.replace(/\\/g, '/'), key)
  }
  return map
}

/**
 * Resolve a relative ref (from a YAML file) to its manifest key.
 * `sourceDir` is the directory of the YAML file containing the ref.
 */
function resolveRefToKey(
  ref: string,
  sourceDir: string,
  pathToKey: Map<string, string>
): string {
  const resolved = path.resolve(sourceDir, ref).replace(/\\/g, '/')
  return pathToKey.get(resolved) ?? ref
}

function generateManifest(files: ContentFile[], contentDir: string): ContentManifest {
  const pathToKey = buildPathToKeyMap(files)

  const manifest: ContentManifest = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    curriculum: {} as ContentManifest['curriculum'],
    milestones: {},
    levels: {},
    lessons: {},
    screens: {},
    questions: {},
  }

  for (const file of files) {
    const key = generateKey(file.path, file.content, file.type)
    const data = file.content as Record<string, unknown>
    const dir = path.dirname(file.path)

    switch (file.type) {
      case 'curriculum': {
        const curriculum = { ...data } as ContentManifest['curriculum']
        if (Array.isArray(curriculum.milestone_refs)) {
          curriculum.milestone_refs = curriculum.milestone_refs.map(
            (ref) => resolveRefToKey(ref, contentDir, pathToKey)
          )
        }
        manifest.curriculum = curriculum
        break
      }
      case 'milestone': {
        const milestone = { ...data } as ContentManifest['milestones'][string]
        if (Array.isArray(milestone.level_refs)) {
          milestone.level_refs = milestone.level_refs.map(
            (ref) => resolveRefToKey(ref, dir, pathToKey)
          )
        }
        manifest.milestones[key] = milestone
        break
      }
      case 'level': {
        const level = { ...data } as ContentManifest['levels'][string]
        if (Array.isArray(level.lesson_refs)) {
          level.lesson_refs = level.lesson_refs.map(
            (ref) => resolveRefToKey(ref, dir, pathToKey)
          )
        }
        manifest.levels[key] = level
        break
      }
      case 'lesson': {
        const lesson = { ...data } as ContentManifest['lessons'][string]
        if (Array.isArray(lesson.screen_refs)) {
          lesson.screen_refs = lesson.screen_refs.map(
            (ref) => resolveRefToKey(ref, dir, pathToKey)
          )
        }
        if (lesson.quiz && Array.isArray(lesson.quiz.question_refs)) {
          lesson.quiz = {
            ...lesson.quiz,
            question_refs: lesson.quiz.question_refs.map(
              (ref) => resolveRefToKey(ref, dir, pathToKey)
            ),
          }
        }
        manifest.lessons[key] = lesson
        break
      }
      case 'screen': {
        const screen = { ...data } as ContentManifest['screens'][string]
        if (screen.checkpoint_quiz?.question_ref) {
          // Resolve relative to the lesson directory (parent of screens/)
          const lessonDir = path.dirname(dir)
          screen.checkpoint_quiz = {
            ...screen.checkpoint_quiz,
            question_ref: resolveRefToKey(screen.checkpoint_quiz.question_ref, lessonDir, pathToKey),
          }
        }
        manifest.screens[key] = screen
        break
      }
      case 'question':
        manifest.questions[key] = data as ContentManifest['questions'][string]
        break
    }
  }

  return manifest
}

// ============================================================================
// Vite Plugin
// ============================================================================

export function contentPlugin(options: { contentDir?: string } = {}): Plugin {
  const contentDir = options.contentDir || path.resolve(process.cwd(), 'content')
  let manifest: ContentManifest | null = null
  let manifestHash: string = ''
  let server: ViteDevServer | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function buildManifest(): { manifest: ContentManifest | null; errors: ValidationError[] } {
    const { files: loadedFiles, errors: loadErrors } = loadContentFiles(contentDir)
    const { valid, errors: validationErrors } = validateContent(loadedFiles)
    const referenceErrors = validateReferences(valid, contentDir)

    const allErrors = [...loadErrors, ...validationErrors, ...referenceErrors]

    if (allErrors.length > 0) {
      return { manifest: null, errors: allErrors }
    }

    return { manifest: generateManifest(valid, contentDir), errors: [] }
  }

  return {
    name: 'vite-plugin-content',
    enforce: 'pre',

    configureServer(viteServer) {
      server = viteServer

      // Watch for changes in content directory (debounced to avoid HMR loops)
      viteServer.watcher.add(contentDir)
      viteServer.watcher.on('change', (filePath) => {
        if (!filePath.endsWith('.yaml') || !filePath.includes('content')) return

        // Debounce: wait 600ms for rapid changes to settle (avoids reload storms)
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
          console.log(`[content] File changed: ${filePath}`)
          const result = buildManifest()
          if (result.errors.length > 0) {
            console.error('[content] Validation errors:')
            result.errors.forEach((e) => console.error(`  ${e.file}: ${e.error}`))
            return
          }

          // Only trigger HMR if manifest content actually changed
          const newHash = JSON.stringify(result.manifest)
          if (newHash === manifestHash) {
            console.log('[content] No content changes detected, skipping HMR')
            return
          }

          manifest = result.manifest
          manifestHash = newHash
          const module = server?.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
          if (module) {
            server?.reloadModule(module)
          }
        }, 300)
      })
    },

    buildStart() {
      const result = buildManifest()
      if (result.errors.length > 0) {
        const errorMessage = result.errors
          .map((e) => `${e.file}: ${e.error}`)
          .join('\n')
        throw new Error(`Content validation failed:\n${errorMessage}`)
      }
      manifest = result.manifest
      manifestHash = JSON.stringify(manifest)
      console.log('[content] Manifest generated successfully')
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
      return null
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        if (!manifest) {
          const result = buildManifest()
          if (result.errors.length > 0) {
            throw new Error('Content manifest not available')
          }
          manifest = result.manifest
        }
        return `export default ${JSON.stringify(manifest)}`
      }
      return null
    },
  }
}

export default contentPlugin
