# Rule: AI Usage

## Model Selection
Always use the cheapest model capable of the task. Refer to `settings.json` for the model assignment per task. Never default to Sonnet when Haiku will do.

| Task | Model | Notes |
|---|---|---|
| Quiz generation | `claude-haiku-4-5` | Structured JSON output |
| Answer evaluation | `claude-haiku-4-5` | Simple classification + short feedback |
| 3-failure explanation | `claude-sonnet-4-6` | Deeper reasoning required |
| Report generation | `claude-haiku-4-5` | Summarization task |
| MCP tool use (Notion, Drive) | `claude-haiku-4-5` | Tool calls, no reasoning needed |

## Prompt Caching
- All system prompts in quiz sessions **must** use `cache_control: { type: "ephemeral" }` on the system message
- Cache the quiz format instructions, not the user-specific content
- This reduces cost by 60–80% on active quiz sessions

## Prompt Location
- All prompts live in `lib/ai/prompts/`
- One file per purpose: `quiz-generator.ts`, `evaluator.ts`, `explainer.ts`, `report.ts`
- Prompts are functions that accept typed parameters and return a string
- Never write prompts inline in Server Actions or components

## Structured Output
- All AI responses that feed application logic must use **structured JSON output**
- Define Zod schemas in `lib/ai/schemas/` and validate every AI response before use
- If validation fails, retry once before returning a fallback error to the user

## Quiz Format Contract
The quiz generator must always return JSON matching this shape:
```ts
{
  questions: Array<{
    id: string
    type: 'multiple-choice' | 'descriptive'
    question: string
    options?: string[]       // only for multiple-choice
    correctAnswer: string
    explanation: string      // used after 3 failures
  }>
}
```
Enforce: 70% `multiple-choice`, 30% `descriptive` (round to nearest whole number).

## Streaming
- Use streaming for the explanation step (after 3 failures) — it feels more natural for longer text
- Use non-streaming for quiz generation and evaluation — we need the full structured response before rendering
- Streaming route: `app/api/quiz/stream/route.ts`

## Cost Guardrails
- Max tokens per quiz generation: 1500
- Max tokens per evaluation: 300
- Max tokens per explanation: 800
- Max tokens per report: 1200
- Log token usage in development via `console.debug`
