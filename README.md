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

```bash
bun run dev
```

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
