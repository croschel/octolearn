#!/bin/bash
# Hook: post-task
# Runs after Claude Code completes a task — summarizes changes and suggests next steps

set -e

echo ""
echo "🐙 OctoLearn post-task summary"
echo "================================"

# Show what files were changed
echo "→ Changed files:"
git diff --name-only 2>/dev/null || echo "  (git not initialized)"

# Remind about tests
echo ""
echo "→ Reminders:"
echo "  - Did you add or update tests for the changed logic?"
echo "  - If you modified an AI prompt, check token limits in rules/ai-usage.md"
echo "  - If you added a new Server Action, make sure it has try/catch"
echo "  - If you added a new DB query, make sure it filters by user_id"

echo ""
echo "→ Run tests with: npm test"
echo "→ Run dev with: npm run dev"
echo ""
