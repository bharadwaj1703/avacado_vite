#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Deployment Readiness Check${NC}"
echo -e "${BLUE}=========================================${NC}\n"

ERRORS=0
WARNINGS=0

# Check if we're in a git repository
echo -e "${BLUE}Checking Git repository...${NC}"
if [ -d .git ]; then
    echo -e "${GREEN}✓ Git repository found${NC}"
    
    # Check if there are uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠ Warning: Uncommitted changes found${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ No uncommitted changes${NC}"
    fi
    
    # Check if remote is set
    if git remote -v | grep -q origin; then
        echo -e "${GREEN}✓ Remote repository configured${NC}"
    else
        echo -e "${RED}✗ No remote repository configured${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}✗ Not a git repository${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check for required files
echo -e "${BLUE}Checking deployment files...${NC}"
REQUIRED_FILES=(
    "render.yaml"
    "Dockerfile"
    ".dockerignore"
    "backend/scripts/start-prod.ts"
    "backend/package.json"
    "frontend/package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Check for sensitive files that shouldn't be committed
echo -e "${BLUE}Checking for sensitive files...${NC}"
SENSITIVE_FILES=(
    ".env"
    "backend/.env"
    "frontend/.env"
    ".env.local"
    "backend/.env.local"
    "frontend/.env.local"
)

FOUND_SENSITIVE=false
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "$file" ] && git ls-files --error-unmatch "$file" 2>/dev/null; then
        echo -e "${RED}✗ $file is tracked by git (should be in .gitignore)${NC}"
        ERRORS=$((ERRORS + 1))
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = false ]; then
    echo -e "${GREEN}✓ No sensitive files tracked by git${NC}"
fi

echo ""

# Check package.json scripts
echo -e "${BLUE}Checking package.json scripts...${NC}"

if grep -q '"start":' backend/package.json; then
    echo -e "${GREEN}✓ Backend has start script${NC}"
else
    echo -e "${RED}✗ Backend missing start script${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"build":' backend/package.json; then
    echo -e "${GREEN}✓ Backend has build script${NC}"
else
    echo -e "${RED}✗ Backend missing build script${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q '"build":' frontend/package.json; then
    echo -e "${GREEN}✓ Frontend has build script${NC}"
else
    echo -e "${RED}✗ Frontend missing build script${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Check for documentation
echo -e "${BLUE}Checking documentation...${NC}"
DOC_FILES=(
    "RENDER_DEPLOYMENT.md"
    "DEPLOYMENT.md"
    "ENV_VARIABLES_REFERENCE.md"
    ".env.production.example"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file exists${NC}"
    else
        echo -e "${YELLOW}⚠ $file missing (optional but recommended)${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
done

echo ""

# Check if Bun is installed (for local testing)
echo -e "${BLUE}Checking local environment...${NC}"
if command -v bun &> /dev/null; then
    BUN_VERSION=$(bun --version)
    echo -e "${GREEN}✓ Bun installed (version $BUN_VERSION)${NC}"
else
    echo -e "${YELLOW}⚠ Bun not installed (needed for local development only)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Summary
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}=========================================${NC}\n"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Commit and push your changes"
    echo -e "  2. Follow RENDER_DEPLOYMENT.md for deployment"
    echo -e "  3. Use DEPLOYMENT_CHECKLIST.md during deployment\n"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    echo -e "${GREEN}✓ No critical errors - you can proceed with deployment${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. Review warnings above"
    echo -e "  2. Commit and push your changes"
    echo -e "  3. Follow RENDER_DEPLOYMENT.md for deployment\n"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s) found${NC}"
    fi
    echo -e "\n${RED}Please fix the errors above before deploying.${NC}\n"
    exit 1
fi
