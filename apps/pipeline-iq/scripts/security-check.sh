#!/bin/bash

# =====================================
# GrooveLeads Pro - Security Check Script
# =====================================
# Run this before committing to GitHub
# Usage: bash scripts/security-check.sh

set -e

echo "🔒 GrooveLeads Pro - Security Check"
echo "===================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check 1: Verify .env.local is in .gitignore
echo "📋 Check 1: Verifying .gitignore..."
if grep -q ".env.local" .gitignore; then
    echo -e "${GREEN}✅ .env.local is in .gitignore${NC}"
else
    echo -e "${RED}❌ ERROR: .env.local is NOT in .gitignore!${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 2: Verify .env.local is not tracked by git
echo ""
echo "📋 Check 2: Verifying .env.local is not tracked..."
if git ls-files | grep -q ".env.local"; then
    echo -e "${RED}❌ ERROR: .env.local is tracked by git!${NC}"
    echo "   Run: git rm --cached .env.local"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ .env.local is not tracked by git${NC}"
fi

# Check 3: Verify .env.example exists
echo ""
echo "📋 Check 3: Verifying .env.example exists..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: .env.example not found${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# Check 4: Search for potential secrets in staged files
echo ""
echo "📋 Check 4: Scanning for secrets in staged files..."
SECRET_PATTERNS=(
    "sk-[a-zA-Z0-9]{48}"
    "eyJhbG[a-zA-Z0-9_-]{40,}"
    "AKIA[0-9A-Z]{16}"
)

FOUND_SECRETS=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if git diff --cached | grep -qE "$pattern"; then
        echo -e "${RED}❌ ERROR: Potential secret found matching pattern: $pattern${NC}"
        FOUND_SECRETS=1
        ERRORS=$((ERRORS+1))
    fi
done

if [ $FOUND_SECRETS -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious secrets found in staged files${NC}"
fi

# Check 5: Search for hardcoded credentials in source files
echo ""
echo "📋 Check 5: Scanning source files for hardcoded credentials..."
CREDENTIAL_FILES=$(grep -r "password\s*=\s*['\"]" app/ lib/ components/ 2>/dev/null | grep -v "process.env" | grep -v ".next" | grep -v "node_modules" || true)

if [ -z "$CREDENTIAL_FILES" ]; then
    echo -e "${GREEN}✅ No hardcoded passwords found${NC}"
else
    echo -e "${RED}❌ ERROR: Potential hardcoded credentials found:${NC}"
    echo "$CREDENTIAL_FILES"
    ERRORS=$((ERRORS+1))
fi

# Check 6: Verify environment variables are used properly
echo ""
echo "📋 Check 6: Verifying environment variable usage..."
API_KEY_FILES=$(grep -r "process.env\." app/ lib/ 2>/dev/null | wc -l || true)

if [ "$API_KEY_FILES" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $API_KEY_FILES uses of process.env (environment variables)${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: No environment variables found. Are you using .env?${NC}"
    WARNINGS=$((WARNINGS+1))
fi

# Check 7: Verify Supabase migrations don't contain secrets
echo ""
echo "📋 Check 7: Checking Supabase migrations for secrets..."
if grep -r "sk-\|password.*=.*['\"][^']" supabase/migrations/ 2>/dev/null | grep -v "SET PASSWORD" | grep -v "CONSTRUCTION_WIRE_PASSWORD"; then
    echo -e "${RED}❌ ERROR: Potential secrets in migration files!${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✅ Supabase migrations look clean${NC}"
fi

# Check 8: Verify important files exist
echo ""
echo "📋 Check 8: Verifying important files exist..."
IMPORTANT_FILES=(
    "README.md"
    "package.json"
    ".gitignore"
    "SUPABASE_SETUP.md"
    "GITHUB_SECURITY.md"
)

for file in "${IMPORTANT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${YELLOW}⚠️  WARNING: $file not found${NC}"
        WARNINGS=$((WARNINGS+1))
    fi
done

# Check 9: Verify node_modules is ignored
echo ""
echo "📋 Check 9: Verifying node_modules is ignored..."
if grep -q "node_modules" .gitignore; then
    echo -e "${GREEN}✅ node_modules is in .gitignore${NC}"
else
    echo -e "${RED}❌ ERROR: node_modules is NOT in .gitignore!${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check 10: Search for email addresses in code
echo ""
echo "📋 Check 10: Checking for hardcoded email addresses..."
EMAIL_COUNT=$(grep -r "@getgrooven.com" app/ lib/ components/ 2>/dev/null | grep -v "process.env" | grep -v "example" | grep -v "template" | grep -v "node_modules" | wc -l || true)

if [ "$EMAIL_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found $EMAIL_COUNT instances of @getgrooven.com in code${NC}"
    echo "   (This may be intentional, but review to ensure no sensitive data)"
    WARNINGS=$((WARNINGS+1))
else
    echo -e "${GREEN}✅ No hardcoded email addresses found${NC}"
fi

# Summary
echo ""
echo "===================================="
echo "🔒 Security Check Summary"
echo "===================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo ""
    echo "Your code is ready to commit to GitHub! 🚀"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Your message'"
    echo "3. git push origin main"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "You can commit, but please review the warnings above."
    exit 0
else
    echo -e "${RED}❌ FAILED - PLEASE FIX ERRORS BEFORE COMMITTING${NC}"
    echo ""
    echo "Errors: $ERRORS"
    echo "Warnings: $WARNINGS"
    echo ""
    echo "Please fix the errors above before committing to GitHub."
    echo ""
    echo "For help, see:"
    echo "- GITHUB_SECURITY.md"
    echo "- SECURITY_AUDIT.md"
    exit 1
fi

