# Production Deployment Guide

## Issue: ERR_CONNECTION_REFUSED in Production

The frontend is trying to connect to `http://localhost:3001` in production, which doesn't exist.

## Root Cause

The `.env` file has `VITE_API_ORIGIN=http://localhost:3001` which is baked into the production build.

## Solution

### 1. Environment Variables for Production

In your Vercel dashboard, set these environment variables:

**DO NOT SET** `VITE_API_ORIGIN` in production - this will make API calls go to the same domain.

**Required Production Environment Variables:**

```bash
# Clerk Authentication
CLERK_FRONTEND_API_URL=https://sharp-raven-97.clerk.accounts.dev
CLERK_BACKEND_API_URL=https://api.clerk.com
VITE_CLERK_PUBLISHABLE_KEY=pk_test_c2hhcnAtcmF2ZW4tOTcuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_NX49Uj6cPJT3edNjKmMAMyJonTTJIB2WqVWa0F6qot

# Database (Use Turso for production, not SQLite)
DATABASE=turso
DATABASE_TURSO_AUTH_TOKEN=your_turso_token_here
DATABASE_TURSO_DATABASE_URL=libsql://avacado-growthschool.aws-ap-south-1.turso.io

# AI APIs
GEMINI_API_KEY=your_key_here
OPENROUTER_API_KEY=your_key_here
AI_MODEL_MAX_INPUT_PRICE_PER_MTOK=1.00
AI_MODEL_MAX_OUTPUT_PRICE_PER_MTOK=2.5

# Storage
TTS_STORAGE=r2
TTS_PROVIDER=gemini
TTS_VOICE=Fenrir
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=avacado-app
R2_PUBLIC_URL=https://media.avacado.xperiments.app
R2_S3_PUBLIC_URL=https://your_r2_url.r2.cloudflarestorage.com
```

### 2. Update .env for Local Development

Keep `VITE_API_ORIGIN=http://localhost:3001` ONLY in your local `.env` file.

### 3. Deploy to Vercel

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Deploy
vercel --prod
```

## How It Works

### Development (Local)
- `VITE_API_ORIGIN=http://localhost:3001` → API calls go to local backend
- Frontend: `http://localhost:5174`
- Backend: `http://localhost:3001`

### Production (Vercel)
- No `VITE_API_ORIGIN` set → API calls go to same domain
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-app.vercel.app/api/*` (Vercel Serverless Functions)

## API Route Structure

Vercel will automatically convert your `api/` folder into serverless functions:

```
api/users/me.ts → https://your-app.vercel.app/api/users/me
api/users/onboarding.ts → https://your-app.vercel.app/api/users/onboarding
api/chat/index.ts → https://your-app.vercel.app/api/chat
```

## Verification Steps

After deployment:

1. Check Vercel deployment logs for errors
2. Visit your production URL
3. Try logging in
4. Check browser console - should see API calls to `/api/*` (not `localhost:3001`)

## Troubleshooting

### Still seeing localhost:3001 errors?
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check Vercel environment variables are set correctly
- Redeploy after fixing environment variables

### Database errors in production?
- Make sure `DATABASE=turso` in production
- SQLite doesn't work on Vercel (read-only filesystem)
- Use Turso (serverless SQLite) for production

### 401 Unauthorized in production?
- Verify `CLERK_SECRET_KEY` is set in Vercel
- Check Clerk dashboard that keys match your instance
