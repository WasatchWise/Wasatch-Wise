#!/bin/bash

# Pre-commit hook to run checks before committing
# Install: ln -s ../../scripts/pre-commit-check.sh .git/hooks/pre-commit

set -e

echo "🔍 Running pre-commit checks..."

# Run TypeScript check
echo "📘 Checking TypeScript..."
npm run build --dry-run 2>&1 | grep -q "error TS" && {
  echo "❌ TypeScript errors found!"
  exit 1
} || true

# Run ESLint
echo "🔧 Running ESLint..."
npm run lint || {
  echo "❌ ESLint errors found!"
  exit 1
}

# Run code health check
echo "🏥 Running code health check..."
node scripts/check-code-health.mjs || {
  echo "❌ Code health issues found!"
  exit 1
}

echo "✅ All checks passed!"
exit 0

