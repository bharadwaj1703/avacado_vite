# Vercel AI SDK + TTS (Gemini, R2 / local) — Updated Plan

## Changes from original

- **TTS separate from build**: Run via `bun run generate` (or `bun run generate:tts`). Do **not** run TTS generation as part of `vite build`. Build stays `tsc -b && vite build`; generate is on-demand.
- **Gemini TTS**: Use Google Gemini for text-to-speech (not OpenAI). Use `@google/genai` with `generateContent` and `responseModalities: ['AUDIO']` ([Gemini TTS docs](https://ai.google.dev/gemini-api/docs/speech-generation)). Vercel AI SDK can still be used later for chatbot/agents.
- **Storage by environment**:  
  - **Local**: Write audio files to **local files** (e.g. `public/tts/<screenKey>.mp3`). Manifest points to relative URLs (`/tts/...`) so the app serves them via Vite dev or built app.  
  - **Staging & production**: Upload to **Cloudflare R2**; manifest uses R2 public URLs. Script chooses behavior via env (e.g. `TTS_STORAGE=local` vs `TTS_STORAGE=r2`).
- **API keys in .env**: Provider API key (Gemini) lives in env only: `.env.local` for local, and Vercel project environment variables for staging/production. Document variable names in `sample.env`; never commit real keys.

---

## Phase 1: Build-time TTS (separate script)

### 1.1 TTS requirements and “check else generate”

- **Source**: All screens with `transcript` (content manifest / screen YAMLs). Screen key = e.g. `01-ai-foundations/01-intro-to-ai/01-what-is-ai/01-not-new`.
- **Check**: For each screen key, see if the asset already exists:
  - **Local** (`TTS_STORAGE=local`): Check if `public/tts/<normalized-key>.mp3` (or similar) exists.
  - **R2** (staging/prod): S3-compatible HEAD for object key `tts/<normalized-key>.mp3`. If 404 → generate.
- **Generate**: Call Gemini TTS (`@google/genai` → `generateContent` with `responseModalities: ['AUDIO']`, plus voice config). Convert response to MP3 (or WAV then encode), then either write to `public/tts/` or upload to R2.
- **Manifest**: Produce `tts-manifest.json`: `Record<screenKey, audioUrl>`. For local, URLs are like `/tts/01-ai-foundations-01-intro-to-ai-01-what-is-ai-01-not-new.mp3`. For R2, use `R2_PUBLIC_URL + "/" + objectKey`.

### 1.2 Script and commands

- **Script**: e.g. `scripts/generate-tts.ts` (or `scripts/generate.ts` if you want one entry for future generators).
- **Command**: In `package.json` add:
  - `"generate": "bun run scripts/generate-tts.ts"`  
  so users run **`bun run generate`** when they want to (re)generate TTS. No change to `build`; build does not run generate.
- **Env**: Script reads:
  - **Gemini**: `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY` (document in `sample.env`).
  - **Storage**: `TTS_STORAGE=local` | `r2` (default `local` if unset).
  - **R2** (when `TTS_STORAGE=r2`): `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.
  - Keys in **.env / .env.local** for local; **Vercel project env** for staging/prod. Document in `sample.env` only (no real keys).
- **Behavior**: If API key (or R2 vars when storage=r2) is missing, script should exit with a clear message or emit an empty manifest and warn — no hard crash in CI if desired.

### 1.3 Local vs R2 output

- **Local**: Write files under `public/tts/` (or a path Vite serves). Write manifest to `public/tts-manifest.json` (or `.generated/tts-manifest.json` and have a small Vite plugin expose it). Object key normalization: e.g. screen key with `/` → `-` for filenames.
- **R2**: Upload to bucket with public read (or custom domain). Same key format `tts/<normalized-key>.mp3`. Manifest holds full `R2_PUBLIC_URL + "/" + key`. For staging vs prod, use different buckets or prefixes if you need separate staging/prod assets (e.g. different `R2_BUCKET_NAME` or `R2_PUBLIC_URL` per Vercel env).

### 1.4 Frontend

- Unchanged from before: load TTS manifest (from `public/tts-manifest.json` or virtual module). Derive `screenKey` for current screen; look up `audioUrl`; optional `<audio>` + play control in `ScreenPlayer` / next to `TranscriptTyper`. No schema change to content YAML.

### 1.5 Dependencies and config

- Add **`@google/genai`** for Gemini TTS.
- Add **R2/S3 client** when using R2 (e.g. `@aws-sdk/client-s3` with R2 endpoint).
- **sample.env**: Add placeholders for `GOOGLE_GENERATIVE_AI_API_KEY` (or `GEMINI_API_KEY`), `TTS_STORAGE`, and R2 vars. Note: “Set in .env.local for local; set in Vercel for staging/production.”

---

## Phase 2 / 3 (unchanged)

- **Phase 2**: Chatbot agent with tools — Vercel AI SDK Core (agents, tools) + AI SDK UI (e.g. useChat); API route + tools; provider API keys in .env / Vercel env.
- **Phase 3**: Generative UI and live TTS — AI SDK UI patterns; on-demand `generateSpeech` or Gemini TTS for live replies.

---

## Prod deployment (Vercel) and R2

- **Option A – Commit manifest + R2:** Run `bun run generate` (local), then `bun run sync tts --storage r2` (uploads `public/tts/*` to R2 and rewrites `public/tts-manifest.json` with R2 URLs). Commit the updated manifest. Do **not** commit `public/tts/` if you want to avoid large binaries; the app will load audio from R2 using the committed manifest.
- **Option B – Sync in Vercel build:** Commit `public/tts/*` and a manifest (with `/tts/` or R2 URLs). In Vercel, set R2 env vars and add a build step that runs `bun run sync tts --storage r2` **before** `vite build`. The sync uploads any missing files to R2 and overwrites the manifest with R2 URLs; the build then bundles that manifest so the deployed app uses R2 for playback.
- **Playback:** The app fetches `/tts-manifest.json` at runtime; each screen looks up its URL (local `/tts/...` or R2 `https://...`). As long as the manifest and the referenced URLs are correct, playback works in both dev and prod.

## Summary

| Topic | Decision |
|-------|----------|
| When to run TTS | Separate: `bun run generate` (not part of `build`) |
| TTS provider | Gemini via `@google/genai` (generateContent + AUDIO) |
| Local | Local files (e.g. `public/tts/*.mp3` + `public/tts-manifest.json`) |
| Staging / prod | R2; run `bun run sync tts --storage r2` to push local files and get manifest with R2 URLs |
| API keys | .env / .env.local locally; Vercel env for staging/prod; document in sample.env only |
