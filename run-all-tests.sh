#!/bin/bash

# Study Match Maker - Comprehensive Test Runner
# This script runs all backend and frontend tests

echo "=========================================="
echo "🧪 Study Match Maker - Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track results
BACKEND_RESULT=0
FRONTEND_RESULT=0

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}📦 Running Backend Tests (Spring Boot)...${NC}"
echo "----------------------------------------"
cd "$SCRIPT_DIR/backend"

if [ -f "mvnw" ]; then
    ./mvnw test -q
    BACKEND_RESULT=$?
elif command -v mvn &> /dev/null; then
    mvn test -q
    BACKEND_RESULT=$?
else
    echo -e "${YELLOW}⚠️  Maven not found. Skipping backend tests.${NC}"
    BACKEND_RESULT=-1
fi

if [ $BACKEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Backend tests PASSED${NC}"
elif [ $BACKEND_RESULT -eq -1 ]; then
    echo -e "${YELLOW}⚠️  Backend tests SKIPPED${NC}"
else
    echo -e "${RED}❌ Backend tests FAILED${NC}"
fi

echo ""
echo -e "${BLUE}🎨 Running Frontend Tests (Vitest)...${NC}"
echo "----------------------------------------"
cd "$SCRIPT_DIR/frontend"

if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        npm test 2>/dev/null
        FRONTEND_RESULT=$?
    else
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install --silent
        npm test 2>/dev/null
        FRONTEND_RESULT=$?
    fi
else
    echo -e "${YELLOW}⚠️  Frontend package.json not found. Skipping frontend tests.${NC}"
    FRONTEND_RESULT=-1
fi

if [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend tests PASSED${NC}"
elif [ $FRONTEND_RESULT -eq -1 ]; then
    echo -e "${YELLOW}⚠️  Frontend tests SKIPPED${NC}"
else
    echo -e "${RED}❌ Frontend tests FAILED${NC}"
fi

echo ""
echo "=========================================="
echo "📊 Test Summary"
echo "=========================================="

# Final summary
TOTAL_PASS=0
TOTAL_FAIL=0

if [ $BACKEND_RESULT -eq 0 ]; then
    echo -e "Backend:  ${GREEN}PASSED${NC}"
    ((TOTAL_PASS++))
elif [ $BACKEND_RESULT -ne -1 ]; then
    echo -e "Backend:  ${RED}FAILED${NC}"
    ((TOTAL_FAIL++))
else
    echo -e "Backend:  ${YELLOW}SKIPPED${NC}"
fi

if [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "Frontend: ${GREEN}PASSED${NC}"
    ((TOTAL_PASS++))
elif [ $FRONTEND_RESULT -ne -1 ]; then
    echo -e "Frontend: ${RED}FAILED${NC}"
    ((TOTAL_FAIL++))
else
    echo -e "Frontend: ${YELLOW}SKIPPED${NC}"
fi

echo "=========================================="

if [ $TOTAL_FAIL -gt 0 ]; then
    echo -e "${RED}❌ Overall: SOME TESTS FAILED${NC}"
    exit 1
elif [ $TOTAL_PASS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Overall: NO TESTS RUN${NC}"
    exit 0
else
    echo -e "${GREEN}✅ Overall: ALL TESTS PASSED${NC}"
    exit 0
fi

