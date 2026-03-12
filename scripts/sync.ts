/**
 * CLI: bun run sync tts --storage r2
 * Syncs local TTS to R2 and rewrites manifest. See scripts/sync-tts-to-r2.ts.
 */

const args = process.argv.slice(2)
const subcommand = args[0]
const storageIdx = args.indexOf('--storage')
const storage = storageIdx >= 0 ? args[storageIdx + 1] : undefined

if (subcommand === 'tts' && storage === 'r2') {
  const { syncTtsToR2 } = await import('./sync-tts-to-r2')
  await syncTtsToR2()
} else {
  console.log('Usage: bun run sync tts --storage r2')
  console.log('  Uploads local public/tts/* to R2 and rewrites tts-manifest.json with R2 URLs.')
  process.exit(subcommand === 'tts' || subcommand === '--help' || subcommand === '-h' ? 0 : 1)
}
