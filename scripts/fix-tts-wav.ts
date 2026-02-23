/**
 * Fix existing public/tts/*.wav files: they are raw PCM (from Gemini) with wrong extension.
 * Overwrites each file with proper WAV (PCM + 44-byte header). No API calls.
 *
 * Run: bun run fix-tts-wav
 */

import * as fs from 'fs'
import * as path from 'path'

const TTS_DIR = path.resolve(process.cwd(), 'public', 'tts')
const SAMPLE_RATE = 24_000
const NUM_CHANNELS = 1
const BITS_PER_SAMPLE = 16

function pcmToWav(pcm: Uint8Array): Uint8Array {
  const byteRate = SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
  const blockAlign = NUM_CHANNELS * (BITS_PER_SAMPLE / 8)
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
  writeU16(NUM_CHANNELS)
  writeU32(SAMPLE_RATE)
  writeU32(byteRate)
  writeU16(blockAlign)
  writeU16(BITS_PER_SAMPLE)
  writeStr('data')
  writeU32(dataSize)
  new Uint8Array(buf).set(pcm, headerSize)
  return new Uint8Array(buf)
}

function main() {
  if (!fs.existsSync(TTS_DIR)) {
    console.log('[fix-tts-wav] No public/tts directory')
    return
  }
  const files = fs.readdirSync(TTS_DIR).filter((f) => f.endsWith('.wav'))
  if (files.length === 0) {
    console.log('[fix-tts-wav] No .wav files in public/tts')
    return
  }
  for (const file of files) {
    const filePath = path.join(TTS_DIR, file)
    const raw = fs.readFileSync(filePath)
    const pcm = new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength)
    const wav = pcmToWav(pcm)
    fs.writeFileSync(filePath, wav)
    console.log('[fix-tts-wav] Fixed:', file)
  }
  console.log('[fix-tts-wav] Done.')
}

main()
