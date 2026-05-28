# Rule: Testing

## Stack
- **Unit & Integration:** Vitest
- **Component:** React Testing Library
- **E2E:** Playwright (only for critical flows)

## What to Test

### Always test:
- All Server Actions — especially `createQuiz`, `submitAnswer`, `finishQuiz`, `saveReport`
- AI output schema validation (mock the AI response, test the Zod parsing)
- Quiz scoring logic (correct/incorrect counting, 3-failure detection)
- Report generation logic

### Test when feasible:
- React components with meaningful interaction (QuizQuestion, QuizSetup)
- Custom hooks (useQuizSession, useReport)

### Don't bother testing:
- shadcn/ui primitives
- Simple presentational components with no logic
- Next.js routing

## Mocking AI
- Never call real AI APIs in tests — always mock via `vi.mock`
- Keep mock AI responses in `__mocks__/ai/` as typed fixtures
- Test the happy path AND the failure path (invalid JSON, timeout, quota error)

## File Naming
- Test files: `*.test.ts` or `*.test.tsx` co-located with source
- E2E tests: `e2e/*.spec.ts`

## Coverage Goals
- Server Actions: 80%+
- AI prompt/schema layer: 90%+
- UI components: 50%+ (focus on logic, not rendering)
