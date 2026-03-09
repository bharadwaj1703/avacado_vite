/**
 * TTS generation script: for each screen with a transcript, check if audio exists
 * (local file or R2); if not, generate via TTS_PROVIDER and write to local or upload to R2.
 * Writes public/tts-manifest.json for the app to consume.
 *
 * Run: bun run generate          # skip screens that already have audio
 * Run: bun run generate --force  # regenerate all (overwrite existing)
 *
 * "Already done" = output asset exists: local public/tts/<key>.(mp3|wav) or R2 object tts/<key>.(mp3|wav).
 * We do not hash transcript content; same screen key = same path. Use --force to regenerate after transcript changes.
 *
 * Env: TTS_PROVIDER=gemini|openai|elevenlabs, TTS_VOICE=<provider-specific>, TTS_STORAGE=local|r2, and provider API key + R2_* when r2.
 */

import * as fs from 'fs'
import * as path from 'path'
import yaml from 'js-yaml'
import { GoogleGenAI, Modality } from '@google/genai'
import { experimental_generateSpeech as generateSpeech } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createElevenLabs } from '@ai-sdk/elevenlabs'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { ScreenSchema, type Screen } from '../src/types/content'

// ---------------------------------------------------------------------------
// Config from env
// ---------------------------------------------------------------------------

const CONTENT_DIR = path.resolve(process.cwd(), 'content')
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const TTS_DIR = path.join(PUBLIC_DIR, 'tts')
const TTS_MANIFEST_PATH = path.join(PUBLIC_DIR, 'tts-manifest.json')

const TTS_STORAGE = (process.env.TTS_STORAGE ?? 'local').toLowerCase() as 'local' | 'r2'
const TTS_PROVIDER = (process.env.TTS_PROVIDER ?? 'gemini').toLowerCase() as 'gemini' | 'openai' | 'elevenlabs'
const TTS_VOICE = process.env.TTS_VOICE ?? defaultVoiceForProvider(TTS_PROVIDER)

function defaultVoiceForProvider(provider: string): string {
  switch (provider) {
    case 'gemini':
      return 'Kore'
    case 'openai':
      return 'alloy'
    case 'elevenlabs':
      return '21m00SmcmTJdgnFX2o86' // default ElevenLabs voice id
    default:
      return 'Kore'
  }
}

const GEMINI_API_KEY =
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? ''

// Optional provider-specific model overrides
const GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts'
const OPENAI_TTS_MODEL = process.env.OPENAI_TTS_MODEL ?? 'tts-1'
const ELEVENLABS_TTS_MODEL = process.env.ELEVENLABS_TTS_MODEL ?? 'eleven_multilingual_v2'

// R2 (S3-compatible)
const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? ''
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? ''
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

const FORCE = process.argv.includes('--force')

// ---------------------------------------------------------------------------
// Content loading (screen key = same as vite content plugin)
// ---------------------------------------------------------------------------

function screenKeyFromPath(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/')
  const parts = normalized.split('/')
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

function listScreensWithTranscripts(): { key: string; screen: Screen }[] {
  const out: { key: string; screen: Screen }[] = []

  function traverse(dir: string) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        traverse(full)
      } else if (entry.isFile() && entry.name.endsWith('.yaml')) {
        const relative = path.relative(CONTENT_DIR, full)
        if (!relative.includes('screens')) continue
        try {
          const raw = yaml.load(fs.readFileSync(full, 'utf-8'))
          const parsed = ScreenSchema.safeParse(raw)
          if (!parsed.success) continue
          const screen = parsed.data
          if (!screen.transcript?.trim()) continue
          const key = screenKeyFromPath(full)
          out.push({ key, screen })
        } catch {
          // skip invalid files
        }
      }
    }
  }

  traverse(CONTENT_DIR)
  return out
}

/** Object key and file name: no slashes */
function normalizedKey(screenKey: string): string {
  return screenKey.replace(/\//g, '-')
}

// ---------------------------------------------------------------------------
// Exists check
// ---------------------------------------------------------------------------

async function existsLocal(normalized: string): Promise<boolean> {
  for (const ext of ['.mp3', '.wav']) {
    if (fs.existsSync(path.join(TTS_DIR, normalized + ext))) return true
  }
  return false
}

let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      throw new Error(
        'R2 env required when TTS_STORAGE=r2: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME'
      )
    }
    s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    })
  }
  return s3Client
}

async function existsR2(objectKey: string): Promise<boolean> {
  const client = getS3Client()
  try {
    await client.send(
      new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: objectKey })
    )
    return true
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'NotFound') {
      return false
    }
    throw e
  }
}

// ---------------------------------------------------------------------------
// WAV header for raw PCM (Gemini returns PCM, not WAV)
// ---------------------------------------------------------------------------

const GEMINI_TTS_SAMPLE_RATE = 24_000
const GEMINI_TTS_CHANNELS = 1
const GEMINI_TTS_BITS_PER_SAMPLE = 16

function pcmToWav(
  pcm: Uint8Array,
  sampleRate = GEMINI_TTS_SAMPLE_RATE,
  numChannels = GEMINI_TTS_CHANNELS,
  bitsPerSample = GEMINI_TTS_BITS_PER_SAMPLE
): Uint8Array {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcm.length
  const headerSize = 44
  const buf = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(buf)
  let offset = 0
  function writeStr(s: string) {
    for (let i = 0; i < s.length; i++) view.setUint8(offset++, s.charCodeAt(i))
  }
  function writeU32(v: number) {
    view.setUint32(offset, v, true)
    offset += 4
  }
  function writeU16(v: number) {
    view.setUint16(offset, v, true)
    offset += 2
  }
  writeStr('RIFF')
  writeU32(36 + dataSize)
  writeStr('WAVE')
  writeStr('fmt ')
  writeU32(16)
  writeU16(1)
  writeU16(numChannels)
  writeU32(sampleRate)
  writeU32(byteRate)
  writeU16(blockAlign)
  writeU16(bitsPerSample)
  writeStr('data')
  writeU32(dataSize)
  new Uint8Array(buf).set(pcm, headerSize)
  return new Uint8Array(buf)
}

// ---------------------------------------------------------------------------
// TTS by provider
// ---------------------------------------------------------------------------

async function generateWithGemini(text: string): Promise<{ data: Uint8Array; mimeType: string }> {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY! })
  const response = await ai.models.generateContent({
    model: GEMINI_TTS_MODEL,
    contents: text,
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: TTS_VOICE },
        },
      },
    },
  })
  const dataBase64 = response.data
  if (!dataBase64 || typeof dataBase64 !== 'string') {
    throw new Error('Gemini TTS returned no audio data')
  }
  const pcm = new Uint8Array(Buffer.from(dataBase64, 'base64'))
  const wav = pcmToWav(pcm)
  return { data: wav, mimeType: 'audio/wav' }
}

async function generateWithOpenAI(text: string): Promise<{ data: Uint8Array; mimeType: string }> {
  const openai = createOpenAI({ apiKey: OPENAI_API_KEY! })
  const result = await generateSpeech({
    model: openai.speech(OPENAI_TTS_MODEL as 'tts-1'),
    text,
    voice: TTS_VOICE,
    outputFormat: 'mp3',
  })
  const data = result.audio.uint8Array
  const mimeType = result.audio.mediaType ?? 'audio/mpeg'
  return { data, mimeType }
}

async function generateWithElevenLabs(text: string): Promise<{ data: Uint8Array; mimeType: string }> {
  const elevenlabs = createElevenLabs({ apiKey: ELEVENLABS_API_KEY! })
  const result = await generateSpeech({
    model: elevenlabs.speech(ELEVENLABS_TTS_MODEL as 'eleven_multilingual_v2'),
    text,
    voice: TTS_VOICE,
    outputFormat: 'mp3',
  })
  const data = result.audio.uint8Array
  const mimeType = result.audio.mediaType ?? 'audio/mpeg'
  return { data, mimeType }
}

async function generateSpeechForProvider(text: string): Promise<{ data: Uint8Array; mimeType: string }> {
  switch (TTS_PROVIDER) {
    case 'gemini':
      return generateWithGemini(text)
    case 'openai':
      return generateWithOpenAI(text)
    case 'elevenlabs':
      return generateWithElevenLabs(text)
    default:
      throw new Error(`Unknown TTS_PROVIDER: ${TTS_PROVIDER}. Use gemini, openai, or elevenlabs.`)
  }
}

function getApiKeyForProvider(): string | null {
  switch (TTS_PROVIDER) {
    case 'gemini':
      return GEMINI_API_KEY || null
    case 'openai':
      return OPENAI_API_KEY || null
    case 'elevenlabs':
      return ELEVENLABS_API_KEY || null
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Write local or upload R2
// ---------------------------------------------------------------------------

function extFromMime(mime: string): string {
  if (mime.includes('mp3') || mime === 'audio/mpeg') return '.mp3'
  return '.wav'
}

async function saveLocal(normalized: string, data: Uint8Array, mimeType: string): Promise<string> {
  fs.mkdirSync(TTS_DIR, { recursive: true })
  const ext = extFromMime(mimeType)
  const filePath = path.join(TTS_DIR, normalized + ext)
  fs.writeFileSync(filePath, data)
  return `/tts/${normalized}${ext}`
}

async function saveR2(objectKey: string, data: Uint8Array, mimeType: string): Promise<string> {
  const client = getS3Client()
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Body: data,
      ContentType: mimeType,
    })
  )
  if (!R2_PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL is required when TTS_STORAGE=r2 (base URL for the bucket)')
  }
  return `${R2_PUBLIC_URL}/${objectKey}`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('[generate-tts] TTS_PROVIDER =', TTS_PROVIDER, 'TTS_VOICE =', TTS_VOICE)
  console.log('[generate-tts] TTS_STORAGE =', TTS_STORAGE)

  if (TTS_STORAGE === 'r2' && (!R2_PUBLIC_URL || !R2_BUCKET_NAME)) {
    console.warn('[generate-tts] TTS_STORAGE=r2 but R2_PUBLIC_URL or R2_BUCKET_NAME missing; skipping R2 upload')
  }

  const screens = listScreensWithTranscripts()
  if (screens.length === 0) {
    console.log('[generate-tts] No screens with transcripts found')
    fs.mkdirSync(PUBLIC_DIR, { recursive: true })
    fs.writeFileSync(TTS_MANIFEST_PATH, JSON.stringify({}, null, 2))
    return
  }

  console.log('[generate-tts] Found', screens.length, 'screens with transcripts')
  if (FORCE) console.log('[generate-tts] --force: regenerating all')

  const manifest: Record<string, string> = {}

  for (const { key, screen } of screens) {
    const norm = normalizedKey(key)
    let exists = false
    let existingUrl: string | null = null

    if (!FORCE) {
      if (TTS_STORAGE === 'local') {
        exists = await existsLocal(norm)
        if (exists) {
          for (const ext of ['.mp3', '.wav']) {
            if (fs.existsSync(path.join(TTS_DIR, norm + ext))) {
              existingUrl = `/tts/${norm}${ext}`
              break
            }
          }
        }
      } else {
        for (const ext of ['.mp3', '.wav']) {
          const objectKey = `tts/${norm}${ext}`
          if (await existsR2(objectKey)) {
            exists = true
            existingUrl = `${R2_PUBLIC_URL}/${objectKey}`
            break
          }
        }
      }
    }

    if (!FORCE && exists && existingUrl) {
      manifest[key] = existingUrl
      console.log('[generate-tts] Skip (exists):', key)
      continue
    }

    const apiKey = getApiKeyForProvider()
    if (!apiKey) {
      console.warn(
        `[generate-tts] No API key for TTS_PROVIDER=${TTS_PROVIDER}; skipping generation for`,
        key
      )
      continue
    }

    try {
      const { data, mimeType } = await generateSpeechForProvider(screen.transcript)
      const ext = extFromMime(mimeType)
      let url: string
      if (TTS_STORAGE === 'local') {
        url = await saveLocal(norm, data, mimeType)
      } else {
        const r2Key = `tts/${norm}${ext}`
        url = await saveR2(r2Key, data, mimeType)
      }
      manifest[key] = url
      console.log('[generate-tts] Generated:', key)
    } catch (e) {
      console.error('[generate-tts] Failed', key, e)
    }
  }

  fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  fs.writeFileSync(TTS_MANIFEST_PATH, JSON.stringify(manifest, null, 2))
  console.log('[generate-tts] Wrote', TTS_MANIFEST_PATH)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
