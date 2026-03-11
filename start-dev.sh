#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Avacado Development Environment${NC}"
echo -e "${BLUE}=========================================${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${GREEN}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap CTRL+C and call cleanup
trap cleanup INT TERM

# Start backend
echo -e "${BLUE}Starting Backend...${NC}"
cd backend && bun run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "${BLUE}Starting Frontend...${NC}"
cd ../frontend && bun run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}Both services are running!${NC}"
echo -e "${BLUE}Backend PID: ${BACKEND_PID}${NC}"
echo -e "${BLUE}Frontend PID: ${FRONTEND_PID}${NC}"
echo -e "\n${GREEN}Press CTRL+C to stop all services${NC}\n"

# Wait for all background processes
wait
