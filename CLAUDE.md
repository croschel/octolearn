# OctoLearn — Claude Code Instructions

## What is OctoLearn?

OctoLearn is a web application that helps users retain knowledge through AI-generated quizzes. The user inputs a subject area and topics studied that day, and the app generates a personalized quiz, evaluates answers, provides explanations on repeated mistakes, and saves results to Notion or Google Drive.

The name and mascot (an octopus) represent studying multiple knowledge domains simultaneously — each arm is a different subject.

---

## Project Stack

| Layer                 | Technology                                          |
| --------------------- | --------------------------------------------------- |
| Framework             | Next.js 15 (App Router)                             |
| Language              | TypeScript (strict mode)                            |
| Styling               | Tailwind CSS + shadcn/ui                            |
| AI                    | Anthropic SDK via Vercel AI SDK                     |
| Auth                  | Clerk (free tier)                                   |
| Database              | Supabase (free tier) — stores quiz history, reports |
| External Integrations | Notion MCP, Google Drive MCP                        |
| Deployment            | Vercel                                              |

---

## Architecture Philosophy

- **No separate backend service.** Next.js Server Actions and Route Handlers replace a dedicated API layer. This keeps the project simple for solo use and easy to extract into a standalone backend later.
- **AI cost optimization is a first-class concern.** Use the cheapest model capable of each task. Never use a heavy model for simple structured tasks.
- **MCP for external integrations.** Notion and Google Drive are connected via MCP servers, keeping integration logic minimal and token-efficient.
- **Server Actions over API routes** for most mutations (quiz submission, report saving). Route Handlers only where streaming or webhooks are needed.

---

## AI Model Strategy

| Task                         | Model               | Reason                              |
| ---------------------------- | ------------------- | ----------------------------------- |
| Quiz generation              | `claude-haiku-4-5`  | Structured output, cheap, fast      |
| Answer evaluation            | `claude-haiku-4-5`  | Simple true/false + feedback        |
| Explanation after 3 failures | `claude-sonnet-4-6` | Needs deeper reasoning              |
| Report generation            | `claude-haiku-4-5`  | Summarization, structured           |
| Notion/Drive via MCP         | `claude-haiku-4-5`  | Tool use, no heavy reasoning needed |

Always apply **prompt caching** on system prompts for quiz sessions to reduce token cost by 60–80% on repeated structure.

---

## Project Structure

```
octolearn/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Landing page route group (unauthenticated)
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx
│   ├── (app)/                    # Authenticated app route group
│   │   ├── dashboard/            # User dashboard — subject areas overview
│   │   ├── quiz/                 # Quiz session
│   │   │   ├── new/              # Create new quiz (input title + topics)
│   │   │   └── [id]/             # Active quiz session
│   │   ├── reports/              # Quiz history and downloadable reports
│   │   └── layout.tsx            # Auth-protected layout (Clerk)
│   ├── api/
│   │   └── quiz/
│   │       └── stream/route.ts   # Streaming endpoint for quiz evaluation
│   └── layout.tsx                # Root layout
│
├── styles/
│   ├── globals.css               # Tailwind base + CSS custom properties (design tokens)
│   ├── tokens.css                # Color, spacing, radius, shadow variables
│   └── typography.css            # Font scale, line heights, letter spacing
│
├── components/
│   ├── ui/                       # shadcn/ui primitives
│   ├── quiz/                     # Quiz-specific components
│   │   ├── QuizSetup.tsx         # Title + topics input
│   │   ├── QuizQuestion.tsx      # Renders MC or descriptive question
│   │   ├── QuizProgress.tsx      # Progress bar + score
│   │   └── QuizReport.tsx        # Final report view
│   ├── dashboard/                # Dashboard components
│   └── marketing/                # Landing page sections
│
├── lib/
│   ├── ai/
│   │   ├── client.ts             # Anthropic SDK init with model constants
│   │   ├── prompts/              # All system and user prompt templates
│   │   │   ├── quiz-generator.ts
│   │   │   ├── evaluator.ts
│   │   │   ├── explainer.ts
│   │   │   └── report.ts
│   │   └── schemas/              # Zod schemas for structured AI outputs
│   ├── db/
│   │   ├── client.ts             # Supabase client
│   │   └── queries/              # Typed query functions
│   ├── integrations/
│   │   ├── notion.ts             # Notion MCP helpers
│   │   └── drive.ts              # Google Drive MCP helpers
│   └── utils.ts
│
├── actions/                      # Next.js Server Actions
│   ├── quiz.ts                   # createQuiz, submitAnswer, finishQuiz
│   ├── reports.ts                # saveReport, exportToNotion, exportToDrive
│   └── user.ts                   # updatePreferences
│
├── types/
│   ├── quiz.ts
│   ├── report.ts
│   └── user.ts
│
├── hooks/                        # React hooks (client-side)
│   ├── useQuizSession.ts
│   └── useReport.ts
│
├── CLAUDE.md                     # ← You are here
├── .mcp.json                     # MCP server config
├── settings.json                 # Claude Code permissions + model config
├── rules/                        # Modular coding rules
├── commands/                     # Custom slash commands
├── skills/                       # Auto-loaded AI workflows
├── agents/                       # Specialized subagents
└── hooks-cc/                     # Claude Code event hooks (not React hooks)
```

---

## Documentation Structure

All project documentation lives in `/docs`. Claude Code must read the relevant
doc before starting any task. Do not rely on memory — always read the file.

| Task type                   | Read this first                                        |
| --------------------------- | ------------------------------------------------------ |
| Any coding task             | `docs/rules/typescript.md`                             |
| AI prompt or model decision | `docs/rules/ai-usage.md`                               |
| Component or styling work   | `docs/rules/ui-style.md` + `docs/rules/base-styles.md` |
| Database query or schema    | `docs/rules/database.md`                               |
| Writing tests               | `docs/rules/testing.md`                                |
| Quiz generation feature     | `docs/skills/quiz-generation.md`                       |
| Report or export feature    | `docs/skills/report-export.md`                         |
| Answer evaluation logic     | `docs/agents/quiz-evaluator.md`                        |
| Notion integration          | `docs/agents/notion-integration.md`                    |
| Design reference            | `docs/DESIGN.md`                                       |

When starting a new session, always read `CLAUDE.md` + the relevant doc above
before writing a single line of code.

---

## UI Mockups

Reference mockups live in `/docs/mockups/`. Always open the relevant mockup
before implementing a screen or component.

| Mockup                | Screen                                   |
| --------------------- | ---------------------------------------- |
| `01-landing-page.png` | Marketing landing page — `/`             |
| `02-dashboard.png`    | Authenticated dashboard — `/dashboard`   |
| `03-quiz-setup.png`   | New quiz form — `/quiz/new`              |
| `04-active-quiz.png`  | Quiz session — `/quiz/[id]`              |
| `05-quiz-report.png`  | Results and report — `/quiz/[id]/report` |

When implementing any screen, open its mockup image and treat it as the
source of truth for layout, spacing, colors, and component structure.

---

## Core Domain Concepts

### Quiz Session

- User provides a **Title Area** (e.g. "AWS", "TypeScript") and **Topics** studied
- AI generates N questions: **70% multiple choice, 30% descriptive**
- Each wrong answer triggers a hint
- **3 wrong attempts on the same question** → full explanation is shown
- Session ends with a score and a generated report

### Report

- Summary of topics covered
- Score breakdown (MC vs descriptive)
- Questions where user struggled (3-attempt questions highlighted)
- Exportable as PDF, saveable to Notion or Google Drive

### Learning Resume & References

Generated at the end of every quiz session, attached to the report. Contains:

- A concise written resume of the topics covered in the session (what they are, why they matter, how they connect)
- A curated list of learning resources per topic, ordered from free to paid:
  - **Free:** official docs, YouTube channels, freeCodeCamp, roadmap.sh, dev.to articles
  - **Freemium:** Coursera (audit mode), edX (audit), GitHub repos, interactive playgrounds
  - **Paid:** Udemy courses, Pluralsight, books (O'Reilly, Manning), official certifications
- Resources must be specific (named course, named author) — never generic suggestions

### Knowledge Base (Dashboard)

- Organized by Title Area
- Shows quiz history per area
- Progress indicators per subject

---

## Environment Variables

```env
# Anthropic
ANTHROPIC_API_KEY=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Notion (if using direct API as fallback)
NOTION_API_KEY=
NOTION_ROOT_PAGE_ID=

# Google Drive (if using direct API as fallback)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Key Conventions

- All AI prompts live in `lib/ai/prompts/` — never inline in components or actions
- All Zod schemas for AI structured output live in `lib/ai/schemas/`
- Server Actions are the default for mutations — only use Route Handlers for streaming
- Components in `components/quiz/` are pure UI — no direct AI calls
- AI calls happen only in Server Actions or Route Handlers, never in client components
- Use `const` over `let`, avoid `any`, prefer `unknown` with type guards
- All try/catch logic must use the `tryCatch` wrapper from `lib/utils/try-catch.ts` — no raw try/catch blocks in Server Actions or AI calls
- All CSS custom properties (colors, spacing, radii, shadows) are defined in `styles/tokens.css` and referenced via Tailwind config — never hardcode hex values or pixel values outside the token system
