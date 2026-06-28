# OctoLearn — Technical Flow Diagram

End-to-end request flow across the OctoLearn stack: Next.js 15 (App Router) +
TypeScript, Clerk auth, Anthropic SDK / Vercel AI SDK, Supabase (Postgres), and
Notion OAuth. Single-line boxes are components / files / services. Double-line
boxes are decision points and branch conditions. Arrows are labeled with the
data or event crossing the boundary.

**Model legend** — `haiku` = `claude-haiku-4-5` · `sonnet` = `claude-sonnet-4-6`

```text
╔══════════════════════════════════════════════════════════════════════════════════════╗
║  LEGEND                                                                                 ║
║  ┌──────────┐  component / file / service       ╔══════════╗  decision / branch        ║
║  └──────────┘                                   ╚══════════╝                           ║
║  ─────►  request / call          ◄─────  response / return        · · ·►  stream       ║
╚══════════════════════════════════════════════════════════════════════════════════════╝


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 0 · AUTH LAYER  (every request)                                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

        ┌─────────────┐      HTTP request       ┌──────────────────────────┐
        │   Browser   │ ──────────────────────► │  src/middleware.ts       │
        │  (client)   │                         │  Clerk middleware        │
        └─────────────┘                         └────────────┬─────────────┘
                                                             │
                                                             ▼
                                          ╔══════════════════════════════════╗
                                          ║  Route protected?                ║
                                          ║  /dashboard  /quiz/*              ║
                                          ║  /reports    /settings           ║
                                          ╚════════╤════════════════╤════════╝
                                       authed │                │ NOT authed
                                              ▼                ▼
                                  ┌────────────────────┐   ┌──────────────────┐
                                  │ Next.js App Router │   │  redirect →       │
                                  │  (RSC + Actions)   │   │  /sign-in         │
                                  └────────────────────┘   └──────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 1 · QUIZ CREATION   /quiz/new                                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐
   │  /quiz/new       │
   │  (Client form)   │
   └───┬──────────▲───┘
       │          │
       │ subject  │ string[] topic suggestions
       │ text     │
       ▼          │
   ┌────────────────────────────┐    prompt     ┌─────────────────────────────┐
   │ suggestTopics()            │ ────────────► │  Anthropic API              │
   │ actions/quiz.ts            │               │  model: haiku               │
   │                            │ ◄──────────── │  → JSON topic array         │
   └────────────────────────────┘   JSON array  └─────────────────────────────┘

       │  user fills + submits form
       │  { title, topics[] }
       ▼
   ┌────────────────────────────┐
   │ createQuiz()               │
   │ actions/quiz.ts            │
   └───┬────────────────────────┘
       │  buildQuizGeneratorPrompt()
       │  (system prompt + PROMPT CACHING)
       ▼
   ┌─────────────────────────────┐
   │  Anthropic API              │
   │  model: haiku               │
   │  ◄── raw quiz JSON          │
   └───┬─────────────────────────┘
       │ raw JSON
       ▼
   ╔══════════════════════════════════╗
   ║  QuizResponseSchema (Zod)        ║
   ║  parse OK?                       ║
   ╚════════╤════════════════╤════════╝
       OK │                │ FAIL
          │                ▼
          │       ┌──────────────────────────┐  buildQuizRetryPrompt()
          │       │ retry → Anthropic (haiku)│ ───────────────┐
          │       └──────────────────────────┘                │
          │                ▲   re-parsed JSON                  │
          │                └───────────────────────────────────┘
          ▼
   ┌────────────────────────────┐
   │ Fisher–Yates shuffle       │
   │ (randomize question order) │
   └───┬────────────────────────┘
       │  INSERT
       ▼
   ┌─────────────────────────────────────────────┐
   │  Supabase (Postgres)                         │
   │   • quiz_sessions   (1 row)                  │
   │   • quiz_questions  (N rows)                 │
   └───┬─────────────────────────────────────────┘
       │  sessionId
       ▼
   ┌────────────────────────────┐   redirect    ┌──────────────────┐
   │  return { sessionId }      │ ────────────► │  /quiz/[id]      │
   └────────────────────────────┘               └──────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 2 · ACTIVE QUIZ SESSION   /quiz/[id]                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────┐   SELECT session + questions   ┌──────────────────┐
   │  /quiz/[id]                  │ ─────────────────────────────► │  Supabase        │
   │  Server Component            │ ◄───────────────────────────── │  quiz_sessions   │
   │                              │      rows                      │  quiz_questions  │
   └───────────────┬──────────────┘                                └──────────────────┘
                   │  props (session, questions)
                   ▼
   ┌──────────────────────────────┐
   │  <QuizSession />             │
   │  Client Component            │
   └───────────────┬──────────────┘
                   │  submit answer  { questionId, answer }
                   ▼
   ┌──────────────────────────────┐  SELECT question  ┌──────────────────┐
   │  submitAnswer()              │ ────────────────► │  Supabase        │
   │  actions/quiz.ts             │ ◄──────────────── │  quiz_questions  │
   │  + verify ownership (userId) │     question row  └──────────────────┘
   └───────────────┬──────────────┘
                   ▼
   ╔════════════════════════════════════════════════════════════════════════════╗
   ║  QUESTION TYPE ?                                                            ║
   ╚════════╤══════════════════════════════════════════════════╤════════════════╝
   MULTIPLE │ CHOICE                                            │ DESCRIPTIVE
            ▼                                                   ▼
   ╔══════════════════════╗                          ┌───────────────────────────┐
   ║  Answer correct?     ║                          │ buildDescriptiveEvalPrompt│
   ╚═══╤══════════════╤═══╝                          ├───────────────────────────┤
 YES │              │ NO                             │ Anthropic API · haiku     │
     ▼              ▼                                │ → JSON { isCorrect,       │
 ┌──────────┐  ╔════════════════════╗               │          score, feedback }│
 │ DB:      │  ║  attempt number?   ║               └────────────┬──────────────┘
 │is_correct│  ╚═══╤══════════╤═════╝                            │
 │ = true   │  1–2 │          │ 3                                ▼
 │ score=1  │      ▼          ▼                          ┌─────────────────┐
 └────┬─────┘ ┌─────────┐  ┌──────────────┐              │ parse JSON →    │
      │       │buildHint│  │ explanation  │              │ EvaluationResult│
      │       │Prompt   │  │ from DB      │              └───────┬─────────┘
      │       ├─────────┤  │ (pre-gen'd)  │                      │
      │       │Anthropic│  │ showExplan.  │                      │
      │       │ haiku   │  │  = true      │                      │
      │       │→ hint   │  └──────┬───────┘                      │
      │       └────┬────┘         │                              │
      │            │              │                              │
      └────────────┴──────────────┴──────────────────────────────┘
                   │  ALL PATHS
                   ▼
   ┌──────────────────────────────┐  UPDATE  ┌──────────────────┐
   │ updateQuestionAttempt()      │ ───────► │  Supabase        │
   │ (attempt_count, is_correct,  │          │  quiz_questions  │
   │  score)                      │          └──────────────────┘
   └───────────────┬──────────────┘
                   │  EvaluationResult
                   ▼
   ┌──────────────────────────────┐
   │  <QuizSession /> (client)    │
   │  renders hint / explanation  │
   └──────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 2b · STREAMING EXPLANATION   (3rd wrong attempt, on demand)                      │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────┐  POST { questionId }   ┌─────────────────────────────┐
   │  <QuizSession /> (client)    │ ─────────────────────► │ app/api/quiz/stream/route.ts│
   │  fetch() reader              │                        │ Route Handler               │
   │                              │                        │ buildExplainerPrompt()      │
   │                              │                        └──────────────┬──────────────┘
   │                              │                                       │ streamText()
   │                              │                                       ▼
   │                              │                        ┌─────────────────────────────┐
   │                              │                        │ Vercel AI SDK → Anthropic   │
   │                              │                        │ model: sonnet               │
   │                              │                        └──────────────┬──────────────┘
   │                              │ · · text/plain ReadableStream · · · · ◄┘
   │                              │ ◄· · · · · · · · · · · · · · · · · · · · ·
   └──────────────────────────────┘   (token-by-token explanation)


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 3 · FINISH QUIZ                                                                  │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────┐
   │  <QuizSession /> (client)    │
   │  "Finish"                    │
   └───────────────┬──────────────┘
                   │  finishQuiz(sessionId)
                   ▼
   ┌──────────────────────────────┐  SELECT scores   ┌──────────────────┐
   │  finishQuiz()                │ ───────────────► │  Supabase        │
   │  actions/quiz.ts             │ ◄─────────────── │  quiz_questions  │
   │  Σ question scores           │     scores       └──────────────────┘
   └───────────────┬──────────────┘
                   │  completeQuizSession()
                   ▼
   ┌──────────────────────────────┐  UPDATE  ┌────────────────────────────────────┐
   │ completeQuizSession()        │ ───────► │  Supabase · quiz_sessions          │
   │                              │          │  correct_answers, completed_at,    │
   │                              │          │  status = 'completed'              │
   └───────────────┬──────────────┘          └────────────────────────────────────┘
                   │  redirect
                   ▼
            ┌──────────────────────┐
            │  /quiz/[id]/report   │
            └──────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 4 · REPORT GENERATION   /quiz/[id]/report                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────────────────┐   SELECT report   ┌──────────────────┐
   │  /quiz/[id]/report           │ ────────────────► │  Supabase        │
   │  Server Component            │ ◄──────────────── │  reports         │
   └───────────────┬──────────────┘   row | null      └──────────────────┘
                   ▼
   ╔══════════════════════════════════╗
   ║  Report already exists?           ║
   ╚════════╤════════════════╤════════╝
       YES │                │ NO
           │                ▼
           │     ┌──────────────────────────────┐  SELECT session+questions
           │     │ generateReport()             │ ───────────────────────────┐
           │     │ actions/reports.ts           │                            ▼
           │     └──────────────┬───────────────┘                    ┌──────────────┐
           │                    │                                    │  Supabase    │
           │                    │  Promise.allSettled([ ... ])       └──────────────┘
           │      ┌─────────────┴─────────────────────────┐
           │      ▼                                        ▼
           │  ┌────────────────────────────┐   ┌────────────────────────────────┐
           │  │ buildReportGeneratorPrompt │   │ buildResumeGeneratorPrompt     │
           │  ├────────────────────────────┤   ├────────────────────────────────┤
           │  │ Anthropic · haiku          │   │ Anthropic · haiku              │
           │  │ → ReportSummarySchema (Zod)│   │ → ResumeResponseSchema (Zod)   │
           │  │ {summary,struggling_topics}│   │ {resume, resources[]}          │
           │  └─────────────┬──────────────┘   └───────────────┬────────────────┘
           │                │                  (non-blocking: failure ⇒ skip resume)
           │                └───────────┬───────────────────────┘
           │                            ▼
           │                ┌────────────────────────────┐  INSERT  ┌──────────────┐
           │                │ assemble Report            │ ───────► │ Supabase     │
           │                │                            │          │ reports      │
           │                └──────────────┬─────────────┘          └──────────────┘
           │                               │  Report
           ▼                               ▼
   ┌──────────────────────────────────────────────┐
   │  <QuizReport /> (rendered report view)        │
   └──────────────────────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 5 · EXPORTS  (from the report view)                                              │
└────────────────────────────────────────────────────────────────────────────────────────┘

   5a · PDF EXPORT (client-side render)
   ┌──────────────────────────────┐
   │  <QuizReport /> (client)     │
   │  "Download PDF"              │
   └───────────────┬──────────────┘
                   │  getPdfData(reportId)
                   ▼
   ┌──────────────────────────────┐  SELECT report+questions  ┌──────────────────┐
   │  getPdfData()                │ ────────────────────────► │  Supabase        │
   │  actions/reports.ts          │ ◄──────────────────────── │  reports,        │
   └───────────────┬──────────────┘        data               │  quiz_questions  │
                   │  report data                              └──────────────────┘
                   ▼
   ┌────────────────────────────────────────────────────────┐
   │  @react-pdf/renderer  ·  <QuizReportPDF />             │
   │  dynamic import, ssr:false  →  <PDFDownloadLink>       │
   │  builds Blob in browser  →  triggers file download     │
   └────────────────────────────────────────────────────────┘


   5b · NOTION EXPORT (server action → Notion API)
   ┌──────────────────────────────┐
   │  <QuizReport /> (client)     │
   │  "Save to Notion"           │
   └───────────────┬──────────────┘
                   │  exportToNotion(reportId)
                   ▼
   ┌──────────────────────────────┐  SELECT report  ┌──────────────────┐
   │ exportToNotion()             │ ──────────────► │  Supabase        │
   │ actions/notion-export.ts     │ ◄────────────── │  reports         │
   └───────────────┬──────────────┘                 └──────────────────┘
                   │  getNotionClient(userId)
                   ▼
   ┌──────────────────────────────┐  SELECT access_token  ┌──────────────────────┐
   │ getNotionClient()            │ ────────────────────► │  Supabase            │
   │                              │ ◄──────────────────── │  user_integrations   │
   └───────────────┬──────────────┘     token | none      └──────────────────────┘
                   ▼
   ╔══════════════════════════════════╗
   ║  Integration found?               ║
   ╚════════╤════════════════╤════════╝
       NO │                │ YES
          ▼                ▼
   ┌──────────────┐   ┌────────────────────────────────────────────────┐
   │ return error │   │  @notionhq/client                              │
   │ notion_not_  │   │  1. findOrCreatePage  "OctoLearn 🐙" (root)    │
   │ connected    │   │  2. findOrCreatePage  subject-area child       │
   └──────────────┘   │  3. notion.pages.create  report page + blocks  │
                      │  4. appendBlocks  (batches of 100 = API limit) │
                      └─────────────────┬──────────────────────────────┘
                                        │  notion_page_id
                                        ▼
                      ┌──────────────────────────────┐  UPDATE  ┌──────────────┐
                      │ save page id                 │ ───────► │ Supabase     │
                      │                              │          │ reports      │
                      └─────────────────┬────────────┘          └──────────────┘
                                        │  return { pageUrl }
                                        ▼
                              ┌──────────────────────┐
                              │  client opens pageUrl│
                              └──────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 6 · NOTION OAUTH CONNECT   /settings                                             │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌──────────────────┐
   │  /settings       │
   │  "Connect Notion"│
   └───────┬──────────┘
           │  GET
           ▼
   ┌──────────────────────────────────┐
   │ /api/auth/notion/start           │
   │  • set CSRF cookie               │
   │    (notion_oauth_state)          │
   │  • redirect →                    │
   └───────────────┬──────────────────┘
                   │  302 → Notion consent URL
                   ▼
   ┌──────────────────────────────────┐
   │  Notion OAuth consent screen     │
   │  (user grants access)            │
   └───────────────┬──────────────────┘
                   │  redirect ?code=…&state=…
                   ▼
   ┌──────────────────────────────────┐
   │ /api/auth/notion/callback        │
   └───────────────┬──────────────────┘
                   ▼
   ╔══════════════════════════════════╗
   ║  CSRF cookie matches state?       ║
   ╚════════╤════════════════╤════════╝
       NO │                │ YES
          ▼                ▼
   ┌──────────────┐   ┌────────────────────────────────────────────────┐
   │ reject /     │   │ POST https://api.notion.com/v1/oauth/token     │
   │ error        │   │ exchange code → { access_token, bot_id,        │
   └──────────────┘   │                  workspace_name }              │
                      └─────────────────┬──────────────────────────────┘
                                        │  upsertUserIntegration()
                                        ▼
                      ┌──────────────────────────────┐  UPSERT  ┌──────────────────────┐
                      │ persist tokens               │ ───────► │ Supabase             │
                      │                              │          │ user_integrations    │
                      └─────────────────┬────────────┘          └──────────────────────┘
                                        │  redirect
                                        ▼
                          ┌──────────────────────────────┐
                          │  /settings?connected=notion  │
                          └──────────────────────────────┘


┌────────────────────────────────────────────────────────────────────────────────────────┐
│  DATA MODEL · Supabase (Postgres)                                                         │
└────────────────────────────────────────────────────────────────────────────────────────┘

   ┌────────────────────┐        ┌────────────────────┐        ┌────────────────────┐
   │  subject_areas     │ 1    N │  quiz_sessions     │ 1    N │  quiz_questions    │
   │  user knowledge    │───────►│  one per attempt   │───────►│  answers, attempt  │
   │  domains           │        │  status, score     │        │  counts, scores    │
   └────────────────────┘        └─────────┬──────────┘        └────────────────────┘
                                           │ 1
                                           │
                                           ▼ N
                                 ┌────────────────────┐        ┌────────────────────┐
                                 │  reports           │        │  user_integrations │
                                 │  AI summary,resume,│        │  OAuth tokens per  │
                                 │  notion_page_id    │        │  provider (Notion) │
                                 └────────────────────┘        └────────────────────┘
```
