# Skill: Quiz Generation

## Trigger
Activated when the user asks to implement quiz creation, question generation, or the quiz setup flow.

## Context to Load
- `rules/ai-usage.md`
- `rules/database.md`
- `types/quiz.ts`
- `lib/ai/prompts/quiz-generator.ts` (if exists)
- `lib/ai/schemas/` (if exists)

## Workflow

### Step 1 — Input Collection
The `QuizSetup` component collects:
- **Title Area** — the subject (e.g. "AWS Lambda", "React Hooks")
- **Topics** — bullet list of what the user studied that day
- If topics are empty, prompt AI to suggest likely beginner/intermediate topics for the given title area

### Step 2 — Quiz Generation (Server Action)
Call `createQuiz` server action which:
1. Validates input with Zod
2. Creates a `quiz_sessions` record in Supabase (status: `in_progress`)
3. Calls AI with `claude-haiku-4-5` using the cached system prompt
4. Validates AI response against the question schema
5. Saves all questions to `quiz_questions` table
6. Returns the session ID to the client

### Step 3 — Question Mix
- Calculate total questions: default is 10
- Multiple choice: `Math.round(total * 0.7)` = 7
- Descriptive: `total - mc_count` = 3
- Shuffle question order before saving

### Step 4 — Session Routing
After creation, redirect to `/quiz/[session_id]` where the quiz UI renders server-side on first load.

## Prompt Template
```
You are a quiz generator for a software engineer studying {titleArea}.

Today they studied the following topics:
{topics}

Generate exactly {totalQuestions} quiz questions:
- {mcCount} multiple choice questions (4 options each, exactly one correct)
- {descriptiveCount} descriptive questions (require a written explanation)

Rules:
- Questions must be specific to the topics provided, not generic
- Multiple choice: plausible wrong answers, not obviously incorrect
- Descriptive: ask for explanation of a concept or comparison between two things
- Vary difficulty: mix beginner and intermediate questions
- Return ONLY valid JSON, no markdown, no preamble

JSON format:
{
  "questions": [
    {
      "id": "q1",
      "type": "multiple-choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}
```

## Error Cases
- AI returns invalid JSON → retry once with stricter prompt, then return 500 with user message
- Topics are empty → use AI to generate 5 suggested topics for the title area first
- Supabase insert fails → rollback and return error to client
