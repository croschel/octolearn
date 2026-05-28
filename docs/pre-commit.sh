#!/bin/bash
# Hook: pre-commit
# Runs before every git commit — enforces code quality gates

set -e

echo "🐙 OctoLearn pre-commit checks..."

# 1. Type check
echo "→ TypeScript check..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found. Fix before committing."
  exit 1
fi

# 2. Lint
echo "→ ESLint..."
npx eslint . --ext .ts,.tsx --max-warnings 0
if [ $? -ne 0 ]; then
  echo "❌ Lint errors found. Fix before committing."
  exit 1
fi

# 3. Format check
echo "→ Prettier..."
npx prettier --check .
if [ $? -ne 0 ]; then
  echo "❌ Formatting issues found. Run: npx prettier --write ."
  exit 1
fi

# 4. Ensure no .env files are staged
if git diff --cached --name-only | grep -E "^\.env"; then
  echo "❌ .env file detected in staged files. Remove it before committing."
  exit 1
fi

echo "✅ All pre-commit checks passed."
