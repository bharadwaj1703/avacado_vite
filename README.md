# Avocado Style

An education-focused app for learning AI and tech concepts, built with React, TypeScript, and Vite.

## Setup

### Requirements
- **Bun** (runtime and package manager) — [Installation guide](https://bun.sh/docs/installation)
- **TypeScript** — included as a dev dependency, configured for Bun. See [Bun TypeScript docs](https://bun.sh/docs/typescript)
- Copy `sample.env` into `.env.local` and set your real values.

### Install dependencies

```bash
bun install
```

### Run the dev server

Starts Vite (frontend) and the Bun API server (port 3001) together. Vite proxies `/api/*` to the API server. **Both must run** for chat and other API features to work.

```bash
bun run dev
```

If you see `ERR_CONNECTION_REFUSED` for `/api/*`, the API server isn’t running. Restart with `bun run dev` (so both start) or run `bun run dev:api` in another terminal. You can also set `VITE_API_ORIGIN=http://localhost:3001` in `.env.local` so the app talks to the API directly; then ensure the API is running on 3001.

### Build for production

```bash
bun run build
```

### Lint

```bash
bun run lint
```

### Preview production build

```bash
bun run preview
```

## TTS (narration) – publish local files to production R2

Common approach: generate narration **locally**, then **publish** those files to **production's R2**. The app in prod reads the manifest and plays from R2; you don't need to commit the audio files.

1. **Generate** (creates `public/tts/*` and `public/tts-manifest.json` with local `/tts/` URLs):
   ```bash
   bun run generate
   ```
   Set `TTS_PROVIDER` and the matching API key in `.env.local` (see `sample.env`). Use `bun run generate --force` to regenerate all.

2. **Publish to production R2** (uploads `public/tts/*` to your **prod** R2 bucket if missing, then rewrites the manifest to use R2 URLs):
   ```bash
   bun run sync tts --storage r2
   ```
   In `.env.local` set the **production** R2 vars: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (your prod bucket's public URL). The script only uploads files that are not already in R2.

3. **Commit** the updated `public/tts-manifest.json`. You can leave `public/tts/` out of git (e.g. add `public/tts/` to `.gitignore`) so the repo stays small; production will serve audio from R2.

4. **Deploy** as usual; the deployed app loads the manifest and plays narration from the R2 URLs.

## Backend/Data

- Local/test writes use `sqlite` (`SQLITE_DB_PATH`)
- Staging/prod writes use Cloudflare `D1` through HTTP API from Vercel API functions
- Clerk user creation is tracked by webhook (`POST /api/webhooks/clerk`) with frontend fallback sync (`POST /api/users/sync`)

## Stack

- **React 19** with TypeScript
- **Vite** for dev server and bundling
- **Tailwind CSS v4** for styling
- **TanStack Router** for file-based routing
- **TanStack React Query** for data fetching
- **Radix UI + shadcn** for UI components
- **anime.js** for animations
- **Space Grotesk** font
