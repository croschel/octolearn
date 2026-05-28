# Rule: TypeScript & Code Style

## TypeScript
- Strict mode is always on — no `any`, use `unknown` with type guards
- Prefer `interface` over `type` for object shapes; use `type` for unions and primitives
- All function parameters and return types must be explicitly typed
- Use `const` by default; only use `let` when reassignment is required
- Never use non-null assertion (`!`) — handle nullability explicitly

## Naming Conventions
- Components: `PascalCase` (e.g. `QuizQuestion.tsx`)
- Hooks: `camelCase` prefixed with `use` (e.g. `useQuizSession.ts`)
- Server Actions: `camelCase` verbs (e.g. `createQuiz`, `submitAnswer`)
- Types/Interfaces: `PascalCase` (e.g. `QuizSession`, `QuizReport`)
- Constants: `UPPER_SNAKE_CASE`
- Files: `kebab-case` for non-component files, `PascalCase` for components

## Imports
- Use absolute imports via `@/` alias (configured in tsconfig)
- Group imports: external libs → internal `@/lib` → internal `@/components` → types
- No barrel exports (no `index.ts` re-exports) — import directly from source files

## Components
- Functional components only — no class components
- Keep components small and focused — if JSX exceeds ~80 lines, split it
- Server Components by default; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Never call AI or DB directly from a component — use Server Actions or custom hooks

## Error Handling

Never write raw `try/catch` blocks in Server Actions, AI calls, or DB queries. Always use the `tryCatch` utility from `lib/utils/try-catch.ts`.

### The `tryCatch` Wrapper

```ts
// lib/utils/try-catch.ts

export type Result<T> =
  | { data: T; error: null }
  | { data: null; error: AppError }

export interface AppError {
  message: string
  code: string
  cause?: unknown
}

export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorCode = 'UNKNOWN_ERROR'
): Promise<Result<T>> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : 'An unexpected error occurred'
    return {
      data: null,
      error: { message, code: errorCode, cause },
    }
  }
}
```

### Usage in Server Actions

```ts
// actions/quiz.ts
export async function createQuiz(input: CreateQuizInput) {
  const { data, error } = await tryCatch(
    () => generateQuizQuestions(input),
    'QUIZ_GENERATION_FAILED'
  )

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
```

### Rules
- Every Server Action must return `{ data, error }` — never throw to the client
- Every AI call must be wrapped in `tryCatch` with a specific `errorCode`
- Every DB query function must be wrapped in `tryCatch`
- Error codes use `UPPER_SNAKE_CASE` and describe the operation that failed
- Log the `cause` in development: `console.error('[errorCode]', error.cause)`

## Formatting & Linting Enforcement

Prettier and ESLint are **non-negotiable** — every file Claude Code writes or modifies must pass both before the task is considered done.

- Prettier config (`.prettierrc`):
  ```json
  {
    "semi": false,
    "singleQuote": true,
    "trailingComma": "all",
    "printWidth": 100,
    "tabWidth": 2
  }
  ```
- ESLint extends `next/core-web-vitals` + `@typescript-eslint/recommended`
- `@typescript-eslint/no-explicit-any` is set to `error` — not warn
- After every code generation task, Claude Code must mentally verify the output would pass `npx eslint` and `npx prettier --check` before presenting it
- The pre-commit hook enforces both — a commit that fails lint or formatting will be blocked
