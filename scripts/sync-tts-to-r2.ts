/**
 * Upload local public/tts/* files to R2 if they are not already there, then rewrite
 * public/tts-manifest.json to use R2 public URLs so the deployed app (e.g. Vercel) loads
 * audio from R2.
 *
 * Run: bun run sync tts --storage r2
 * (Or directly: bun run scripts/sync-tts-to-r2.ts)
 *
 * Flow for prod:
 *   1. Locally: bun run generate  → public/tts/* + manifest with /tts/ URLs
 *   2. bun run sync tts --storage r2  → uploads missing files to R2, overwrites manifest with R2 URLs
 *   3. Commit public/tts-manifest.json (and optionally public/tts/* if you want them in repo)
 *   4. Vercel build: vite build copies manifest; app fetches audio from R2
 */

import * as fs from 'fs'
import * as path from 'path'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

loadEnvFiles()

const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
const TTS_MANIFEST_PATH = path.join(PUBLIC_DIR, 'tts-manifest.json')
const TTS_DIR = path.join(PUBLIC_DIR, 'tts')

function loadEnvFiles(): void {
  const cwd = process.cwd()
  for (const name of ['.env', '.env.local']) {
    const p = path.join(cwd, name)
    if (!fs.existsSync(p)) continue
    const content = fs.readFileSync(p, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let val = trimmed.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1)
      process.env[key] = val
    }
  }
}

const R2_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? ''
const R2_ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? ''
const R2_SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? ''
const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

function r2Endpoint(): string {
  return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
}

function getS3Client(): S3Client {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error(
      'R2 env required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME'
    )
  }
  return new S3Client({
    region: 'auto',
    endpoint: r2Endpoint(),
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  })
}

async function existsInR2(client: S3Client, objectKey: string): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: objectKey }))
    return true
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'name' in e && (e as { name: string }).name === 'NotFound') {
      return false
    }
    throw e
  }
}

async function uploadToR2(
  client: S3Client,
  objectKey: string,
  localPath: string,
  mimeType: string
): Promise<void> {
  const body = fs.readFileSync(localPath)
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      Body: body,
      ContentType: mimeType,
    })
  )
}

function mimeForExt(ext: string): string {
  if (ext === '.mp3') return 'audio/mpeg'
  return 'audio/wav'
}

async function main(): Promise<void> {
  if (!R2_PUBLIC_URL) {
    throw new Error('R2_PUBLIC_URL is required (base URL for the R2 bucket)')
  }

  if (!fs.existsSync(TTS_MANIFEST_PATH)) {
    console.log('[sync-tts-to-r2] No tts-manifest.json found; run "bun run generate" first.')
    process.exit(0)
  }

  const manifest: Record<string, string> = JSON.parse(
    fs.readFileSync(TTS_MANIFEST_PATH, 'utf-8')
  )
  const entries = Object.entries(manifest)
  if (entries.length === 0) {
    console.log('[sync-tts-to-r2] Manifest is empty; nothing to sync.')
    process.exit(0)
  }

  const client = getS3Client()
  const newManifest: Record<string, string> = {}

  for (const [screenKey, url] of entries) {
    const isLocal = url.startsWith('/tts/')
    const basename = isLocal ? url.replace(/^\/tts\//, '') : path.basename(new URL(url).pathname)
    const objectKey = `tts/${basename}`
    const r2Url = `${R2_PUBLIC_URL}/${objectKey}`

    if (isLocal) {
      const localPath = path.join(PUBLIC_DIR, url)
      if (!fs.existsSync(localPath)) {
        console.warn('[sync-tts-to-r2] Local file missing:', localPath, '- skipping')
        newManifest[screenKey] = r2Url
        continue
      }
      const exists = await existsInR2(client, objectKey)
      if (!exists) {
        const ext = path.extname(basename)
        await uploadToR2(client, objectKey, localPath, mimeForExt(ext))
        console.log('[sync-tts-to-r2] Uploaded:', basename)
      } else {
        console.log('[sync-tts-to-r2] Exists in R2:', basename)
      }
    } else {
      console.log('[sync-tts-to-r2] Already R2 URL:', screenKey)
    }
    newManifest[screenKey] = r2Url
  }

  fs.writeFileSync(TTS_MANIFEST_PATH, JSON.stringify(newManifest, null, 2))
  console.log('[sync-tts-to-r2] Wrote', TTS_MANIFEST_PATH, 'with R2 URLs')
}

export async function syncTtsToR2(): Promise<void> {
  try {
    await main()
  } catch (e) {
    handleSyncError(e)
  }
}

function isConnectionRefused(e: unknown): boolean {
  const code = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : ''
  const err = e as Error & { code?: string }
  return err?.code === 'ECONNREFUSED' || code === 'ECONNREFUSED' || err?.message?.includes('ECONNREFUSED')
}

function handleSyncError(e: unknown): void {
  if (isConnectionRefused(e)) {
    console.error('[sync-tts-to-r2] Connection refused to R2.')
    console.error('  Endpoint:', R2_ACCOUNT_ID ? r2Endpoint() : '(missing CLOUDFLARE_ACCOUNT_ID)')
    console.error('  Check .env.local has CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL')
    console.error('  If behind a proxy/firewall, ensure r2.cloudflarestorage.com is allowed.')
  } else {
    console.error(e)
  }
  process.exit(1)
}

if (import.meta.main) {
  main().catch(handleSyncError)
}
