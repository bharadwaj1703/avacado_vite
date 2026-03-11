#!/bin/bash

# Always run from repo root (directory containing this script)
cd "$(dirname "$0")" || exit 1

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Avacado Production Environment${NC}"
echo -e "${BLUE}=========================================${NC}"

# Increase Node/Bun heap limit to avoid "JavaScript heap out of memory" during build/start
if [[ "$NODE_OPTIONS" != *"max-old-space-size"* ]]; then
  export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=4096"
fi

# Check if we're in production mode
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}Warning: NODE_ENV is not set to 'production'${NC}"
    echo -e "${YELLOW}Setting NODE_ENV=production${NC}"
    export NODE_ENV=production
fi

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${GREEN}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap CTRL+C and call cleanup
trap cleanup INT TERM

# Check if backend is built
if [ ! -d "backend/dist" ]; then
    echo -e "${YELLOW}Backend not built. Building now...${NC}"
    cd backend && bun run build && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}Backend build failed!${NC}"
        exit 1
    fi
fi

# Check if frontend is built
if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}Frontend not built. Building now...${NC}"
    cd frontend && bun run build && cd ..
    if [ $? -ne 0 ]; then
        echo -e "${RED}Frontend build failed!${NC}"
        exit 1
    fi
fi

# Start backend
echo -e "${BLUE}Starting Backend Server...${NC}"
cd backend && bun run start &
BACKEND_PID=$!

echo -e "\n${GREEN}Backend is running!${NC}"
echo -e "${BLUE}Backend PID: ${BACKEND_PID}${NC}"
echo -e "${BLUE}Backend URL: http://localhost:${API_PORT:-3001}${NC}"
echo -e "\n${GREEN}Frontend static files are in: frontend/dist${NC}"
echo -e "${YELLOW}Serve frontend with a static file server (nginx, caddy, etc.)${NC}"
echo -e "\n${GREEN}Press CTRL+C to stop the backend${NC}\n"

# Wait for backend process
wait $BACKEND_PID
