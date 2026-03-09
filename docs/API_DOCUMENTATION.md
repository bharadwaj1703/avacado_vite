# Avacado API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
  - [Health](#health)
  - [Users](#users)
  - [Activities](#activities)
  - [Chats](#chats)
  - [Chat Messages](#chat-messages)
  - [Webhooks](#webhooks)

---

## Authentication

All API endpoints (except `/api/health`) require Clerk authentication. Authentication is done via:

1. **Bearer Token**: `Authorization: Bearer <clerk_jwt_token>` header
2. **Cookie**: `__session` cookie (for browser-based requests)

The API validates the token using Clerk's `verifyToken()` function.

---

## Database Schema

### Table: `users`

Stores user profile and onboarding information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `clerk_user_id` | TEXT | NOT NULL, UNIQUE | Clerk user identifier |
| `lead_id` | TEXT | NULL | Optional lead tracking ID |
| `display_name` | TEXT | NULL | User's display name |
| `profession` | TEXT | NULL | One of: `student`, `freelancer`, `founder`, `business_owner`, `working_professional`, `others` |
| `self_reported_ai_knowledge` | INTEGER | NULL | 0-4 scale (0=beginner, 4=expert) |
| `company_website` | TEXT | NULL | User's company website URL |
| `extracted_company_details` | TEXT | NULL | JSON string of extracted company info |
| `job_title` | TEXT | NULL | User's job title |
| `time_commitment_span` | INTEGER | NULL | Minutes: `5`, `10`, `15`, `20`, `30` |
| `time_commitment_frequency` | TEXT | NULL | One of: `daily`, `weekly`, `weekend`, `monthly` |
| `preferred_timing` | TEXT | NULL | One of: `morning`, `lunch`, `evening`, `night` |
| `timezone` | TEXT | NULL | IANA timezone string |
| `onboarding_completed_at` | TEXT | NULL | ISO 8601 timestamp |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Indexes:**
- `clerk_user_id` (UNIQUE)

---

### Table: `activities`

Tracks user learning activities (lessons watched, quiz results).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `user_id` | TEXT | NOT NULL, FK → users.id | References users table |
| `action_kind` | TEXT | NOT NULL | One of: `lesson_watched`, `quiz_answered_correctly`, `quiz_answered_incorrectly` |
| `slug` | TEXT | NOT NULL | Content identifier (lesson/quiz slug) |
| `entity` | TEXT | NOT NULL | One of: `lesson`, `quiz` |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Indexes:**
- `user_id` (for faster lookups)

---

### Table: `chats`

Stores chat sessions between users and AI.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `user_id` | TEXT | NOT NULL, FK → users.id | References users table |
| `title` | TEXT | NULL | Chat title (auto-generated or user-provided) |
| `status` | TEXT | NOT NULL | One of: `awaiting_user`, `awaiting_llm`, `streaming`, `errored`, `ready` |
| `deleted_at` | TEXT | NULL | ISO 8601 timestamp (soft delete) |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Constraints:**
- Max 50 chats per user
- Soft delete via `deleted_at`

**Indexes:**
- `user_id` (for faster lookups)
- `deleted_at` (for filtering active chats)

---

### Table: `chat_models`

Links chats to AI models.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `chat_id` | TEXT | PRIMARY KEY, FK → chats.id | References chats table |
| `model_id` | TEXT | NOT NULL | OpenRouter model identifier |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp |

---

### Table: `messages`

Stores individual messages within chats.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `chat_id` | TEXT | NOT NULL, FK → chats.id | References chats table |
| `role` | TEXT | NOT NULL | One of: `system`, `user`, `assistant`, `developer`, `tool` |
| `content` | TEXT | NOT NULL | JSON string of UIMessage format |
| `usage` | TEXT | NULL | JSON string with token usage: `{promptTokens, completionTokens, totalTokens}` |
| `stop_reason` | TEXT | NULL | Reason message stopped (e.g., `stop`, `length`, `content_filter`) |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Constraints:**
- Max 10 messages per chat (excluding system messages)
- Content stored as JSON string following AI SDK `UIMessage` format

**Indexes:**
- `chat_id` (for faster lookups)

---

## API Endpoints

### Health

#### `GET /api/health`

Check API server and database health.

**Authentication:** None required

**Response:**
```json
{
  "provider": "sqlite" | "d1" | "turso",
  "ok": true
}
```

**Status Codes:**
- `200` - Success
- `500` - Database connection failed

---

### Users

#### `GET /api/users/me`

Get current user profile.

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid",
  "clerkUserId": "user_xxx",
  "displayName": "John Doe" | null,
  "onboardingCompletedAt": "2024-01-01T00:00:00.000Z" | null
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (invalid/missing token)
- `500` - Database error
- `503` - Database locked (SQLite concurrency issue)

**Notes:**
- Automatically creates user if not found in database
- Uses read-first strategy to avoid write-lock churn

---

#### `POST /api/users/sync`

Sync user data from Clerk (called by frontend after login).

**Authentication:** Required

**Request Body:**
```json
{
  "leadId": "optional_lead_id",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "userId": "uuid"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Database error

---

#### `POST /api/users/onboarding`

Update user onboarding data.

**Authentication:** Required

**Request Body:**
```json
{
  "profession": "student" | "freelancer" | "founder" | "business_owner" | "working_professional" | "others",
  "selfReportedAiKnowledge": 0 | 1 | 2 | 3 | 4,
  "companyWebsite": "https://example.com",
  "extractedCompanyDetails": "{\"name\": \"Example Inc\"}",
  "jobTitle": "Software Engineer",
  "timeCommitmentSpan": 5 | 10 | 15 | 20 | 30,
  "timeCommitmentFrequency": "daily" | "weekly" | "weekend" | "monthly",
  "preferredTiming": "morning" | "lunch" | "evening" | "night",
  "timezone": "America/New_York",
  "completed": true
}
```

**Response:**
```json
{
  "userId": "uuid",
  "onboardingCompletedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload (missing `completed` boolean)
- `401` - Unauthorized
- `500` - Database error

**Notes:**
- All fields except `completed` are optional
- Setting `completed: true` sets `onboarding_completed_at` timestamp
- Setting `completed: false` does not clear existing `onboarding_completed_at`

---

### Activities

#### `POST /api/activities`

Record a user activity (lesson watched, quiz answered).

**Authentication:** Required

**Request Body:**
```json
{
  "actionKind": "lesson_watched" | "quiz_answered_correctly" | "quiz_answered_incorrectly",
  "slug": "lesson-slug-or-quiz-id",
  "entity": "lesson" | "quiz"
}
```

**Response:**
```json
{
  "activityId": "uuid"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid payload (invalid actionKind, entity, or missing slug)
- `401` - Unauthorized
- `404` - User not found

**Valid Values:**
- `actionKind`: `lesson_watched`, `quiz_answered_correctly`, `quiz_answered_incorrectly`
- `entity`: `lesson`, `quiz`

---

### Chats

#### `GET /api/chats`

List all chats for the current user.

**Authentication:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Chat Title" | null,
      "model_id": "openai/gpt-4",
      "deleted_at": null,
      "status": "ready" | "awaiting_user" | "awaiting_llm" | "streaming" | "errored",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found

**Notes:**
- Returns up to 50 chats (most recent first)
- Only returns non-deleted chats (`deleted_at IS NULL`)

---

#### `POST /api/chats`

Create a new chat.

**Authentication:** Required

**Request Body:**
```json
{
  "title": "Optional Chat Title" | null,
  "modelId": "openai/gpt-4"
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Chat Title" | null,
  "model_id": "openai/gpt-4",
  "deleted_at": null,
  "status": "awaiting_user",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing modelId, model not allowed, or max chats reached (50)
- `401` - Unauthorized
- `404` - User not found
- `409` - User has active chat (streaming/awaiting_llm)

**Constraints:**
- Max 50 chats per user
- Cannot create new chat if user has active chat (`streaming` or `awaiting_llm` status)
- Model must be in allowed models list (filtered by price limits)

---

#### `GET /api/chats/:id`

Get a specific chat with all messages.

**Authentication:** Required

**Response:**
```json
{
  "chat": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Chat Title" | null,
    "model_id": "openai/gpt-4",
    "deleted_at": null,
    "status": "ready",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "messages": [
    {
      "id": "uuid",
      "chat_id": "uuid",
      "role": "system" | "user" | "assistant" | "developer" | "tool",
      "content": "{\"id\":\"msg_xxx\",\"role\":\"user\",\"parts\":[{\"type\":\"text\",\"text\":\"Hello\"}]}",
      "usage": "{\"promptTokens\":10,\"completionTokens\":20,\"totalTokens\":30}" | null,
      "stop_reason": "stop" | null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Chat not found or not owned by user

**Notes:**
- Messages are ordered by `created_at` ascending
- Content is stored as JSON string (AI SDK `UIMessage` format)

---

#### `DELETE /api/chats/:id`

Soft delete a chat.

**Authentication:** Required

**Response:**
```json
{
  "ok": true
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Chat not found or not owned by user

**Notes:**
- Performs soft delete (sets `deleted_at` timestamp)
- Chat is not physically removed from database

---

### Chat Messages

#### `POST /api/chat`

Send a message to a chat and stream AI response.

**Authentication:** Required

**Request Body:**
```json
{
  "id": "chat_uuid",
  "message": {
    "id": "msg_xxx",
    "role": "user",
    "parts": [
      {
        "type": "text",
        "text": "Hello, how are you?"
      }
    ]
  }
}
```

**Response:** Server-Sent Events (SSE) stream

**Status Codes:**
- `200` - Success (streaming)
- `400` - Invalid JSON, missing id/message, message too long, max messages reached, model not allowed
- `401` - Unauthorized
- `404` - User or chat not found
- `409` - User has active chat
- `500` - Streaming error

**Constraints:**
- Max 15,000 characters per user message
- Max 10 messages per chat (excluding system messages)
- Cannot send if user has another active chat
- Only `user` role messages can be sent
- System message is automatically added on first user message

**Stream Format:**
Uses AI SDK's `pipeUIMessageStreamToResponse()` - streams incremental text updates.

**Notes:**
- Chat status transitions: `awaiting_user` → `awaiting_llm` → `streaming` → `ready` (or `errored`)
- Assistant message is saved after stream completes
- Token usage and stop reason are recorded

---

#### `GET /api/chat/models`

Get list of available AI models (filtered by price limits).

**Authentication:** Required

**Response:**
```json
{
  "data": [
    {
      "id": "openai/gpt-4",
      "name": "GPT-4",
      "context_length": 8192,
      "pricing": {
        "prompt": "0.03",
        "completion": "0.06"
      }
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Failed to fetch models

**Notes:**
- Models are filtered by `AI_MODEL_MAX_INPUT_PRICE_PER_MTOK` and `AI_MODEL_MAX_OUTPUT_PRICE_PER_MTOK` env vars
- Fetched from OpenRouter API
- Returns empty array if no models match price criteria

---

### Webhooks

#### `POST /api/webhooks/clerk`

Handle Clerk webhook events (user creation/updates).

**Authentication:** Svix webhook signature verification

**Request Headers:**
- `svix-id`: Webhook event ID
- `svix-timestamp`: Event timestamp
- `svix-signature`: HMAC signature

**Request Body:**
```json
{
  "type": "user.created" | "user.updated",
  "data": {
    "id": "user_xxx",
    "first_name": "John" | null,
    "last_name": "Doe" | null,
    "username": "johndoe" | null
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

**Status Codes:**
- `200` - Success (or event type ignored)
- `400` - Missing user id in payload
- `401` - Invalid webhook signature

**Supported Events:**
- `user.created` - Creates user in database
- `user.updated` - Updates user display name
- Other events are ignored (return 200)

**Notes:**
- Display name is extracted from `first_name` + `last_name`, or falls back to `username`
- Uses Svix signature verification for security

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

### Common Status Codes

- `200` - Success
- `400` - Bad Request (invalid payload, validation failed)
- `401` - Unauthorized (missing/invalid auth token)
- `404` - Not Found (resource doesn't exist or user doesn't have access)
- `409` - Conflict (e.g., active chat exists, max chats reached)
- `500` - Internal Server Error
- `503` - Service Unavailable (database locked - SQLite concurrency issue)

---

## Rate Limits & Constraints

### Chat Limits
- **Max 50 chats per user**
- **Max 10 messages per chat** (excluding system messages)
- **Max 15,000 characters per user message**
- Only one active chat per user at a time (`streaming` or `awaiting_llm` status)

### Model Limits
- Models filtered by price per million tokens:
  - Input: Max `AI_MODEL_MAX_INPUT_PRICE_PER_MTOK` (default: $1.00)
  - Output: Max `AI_MODEL_MAX_OUTPUT_PRICE_PER_MTOK` (default: $2.50)

---

## Environment Variables

Required for API server:

```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_xxx
CLERK_FRONTEND_API_URL=https://xxx.clerk.accounts.dev

# Database (choose one)
DATABASE=sqlite  # or "turso" or "d1"
SQLITE_DB_PATH=./.data/avacado.sqlite
# OR
DATABASE_TURSO_DATABASE_URL=libsql://xxx.turso.io
DATABASE_TURSO_AUTH_TOKEN=xxx
# OR
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_D1_DATABASE_ID=xxx
CLOUDFLARE_API_TOKEN=xxx

# OpenRouter (for chat)
OPENROUTER_API_KEY=sk-or-xxx
AI_MODEL_MAX_INPUT_PRICE_PER_MTOK=1.00
AI_MODEL_MAX_OUTPUT_PRICE_PER_MTOK=2.50

# Clerk Webhooks (optional)
CLERK_WEBHOOK_SECRET=whsec_xxx
```

---

## Database Migrations

Run migrations with:
```bash
bun run migrate
```

Migrations are automatically run during `bun run build`.

Migration files:
- `0001_create_users.ts` - Creates users table
- `0002_create_activities.ts` - Creates activities table
- `0003_create_chats.ts` - Creates chats table
- `0004_create_messages.ts` - Creates messages table
- `0005_create_indexes.ts` - Creates performance indexes
- `0006_create_chat_models.ts` - Creates chat_models table
- `0007_add_chats_deleted_at.ts` - Adds soft delete support

---

## Development

### Local API Server

Start API server:
```bash
bun run dev:api
```

Runs on `http://localhost:3001` (configurable via `API_DEV_PORT`).

### CORS

API server allows requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:5174`
- `http://localhost:3000`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:5174`

Credentials are supported (`Access-Control-Allow-Credentials: true`).

---

## Notes

- All timestamps are ISO 8601 strings (UTC)
- UUIDs are v4 format
- JSON strings in database (like `content`, `usage`) should be parsed before use
- Soft deletes are used for chats (not physically removed)
- Database provider is abstracted - same API works with SQLite, Turso, or Cloudflare D1
