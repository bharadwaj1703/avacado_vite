# Use Bun's official image
FROM oven/bun:1 as base
WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all source code
COPY . .

# Build frontend (API will be on same origin, so use empty string or relative path)
WORKDIR /app/frontend
ENV VITE_API_ORIGIN=""
RUN bun run build

# Build backend
WORKDIR /app/backend
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy backend files
COPY --from=base /app/backend/package.json ./backend/
COPY --from=base /app/backend/node_modules ./backend/node_modules
COPY --from=base /app/backend/src ./backend/src
COPY --from=base /app/backend/scripts ./backend/scripts
COPY --from=base /app/backend/tsconfig.json ./backend/

# Copy frontend build
COPY --from=base /app/frontend/dist ./frontend/dist

# Create data directory for SQLite
RUN mkdir -p /data

WORKDIR /app/backend

# Expose the port (Render will override with PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD bun run -e "fetch('http://localhost:' + (process.env.PORT || process.env.API_PORT || 3001) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the server (serves both API and frontend)
CMD ["bun", "run", "start"]
