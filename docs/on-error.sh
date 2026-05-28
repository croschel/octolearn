#!/bin/bash
# Hook: on-error
# Triggered when Claude Code encounters an error during a task

echo ""
echo "🐙 OctoLearn error handler"
echo "==========================="
echo "Error occurred during: $TASK_NAME"
echo "Error message: $ERROR_MESSAGE"
echo ""
echo "Common fixes:"
echo "  - TypeScript error → check rules/typescript.md"
echo "  - AI response invalid → check rules/ai-usage.md schema validation section"
echo "  - Supabase error → check rules/database.md, verify RLS policies"
echo "  - MCP connection error → check .mcp.json and verify env vars are set"
echo "  - Build error → run: npx tsc --noEmit for details"
echo ""
