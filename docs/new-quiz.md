# Command: /new-quiz

## Description
Scaffold a new quiz session server action + associated types when adding a new quiz variant or modifying the quiz flow.

## Usage
```
/new-quiz [title-area] [topic-count]
```

## Example
```
/new-quiz "AWS Lambda" 10
```

## What This Does
1. Verifies `lib/ai/prompts/quiz-generator.ts` exists — creates it if not
2. Verifies `lib/ai/schemas/quiz.ts` exists — creates it if not
3. Creates or updates `actions/quiz.ts` with the `createQuiz` server action
4. Generates a typed fixture in `__mocks__/ai/quiz-fixture.ts` for testing
5. Outputs a checklist of what was created/modified

## Rules Applied
- `rules/typescript.md`
- `rules/ai-usage.md`
- `rules/database.md`

## Shell Steps
```bash
# Verify types directory
ls types/quiz.ts || echo "MISSING: types/quiz.ts needs to be created first"

# Check if actions file exists
ls actions/quiz.ts && echo "EXISTS: will update" || echo "NEW: will create"
```
