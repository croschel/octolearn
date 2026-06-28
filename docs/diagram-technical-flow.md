
# OctoLearn — Technical Flow Diagram

```mermaid
flowchart TD
    Browser([Browser / Client])

    %% ── Auth layer ────────────────────────────────────────────────────────────
    Browser --> MW[Clerk Middleware\nsrc/middleware.ts]
    MW -- Protected route + no session --> CLK[Clerk Auth UI\n/sign-in  /sign-up]
    MW -- Session valid --> APP[Next.js App Router\nRSC pages]

    %% ── Dashboard ─────────────────────────────────────────────────────────────
    APP --> DASH[/dashboard\nServer Component]
    DASH --> SB1[(Supabase\nsubject_areas\nreports\nquiz_sessions)]

    %% ── Quiz creation ─────────────────────────────────────────────────────────
    APP --> QNEW[/quiz/new\nClient Component]
    QNEW -- suggestTopics --> SA_SUGGEST[Server Action\nactions/quiz.ts]
    SA_SUGGEST --> AI1[Anthropic API\nclaude-haiku-4-5\nJSON topic array]
    SA_SUGGEST --> QNEW

    QNEW -- createQuiz --> SA_CREATE[Server Action\nactions/quiz.ts]
    SA_CREATE --> AI2[Anthropic API\nclaude-haiku-4-5\nPrompt cache on system\nStructured quiz JSON]
    AI2 -- parse + validate\nZod QuizResponseSchema --> SA_CREATE
    AI2 -- validation fails --> AI2R[Retry with\nbuildQuizRetryPrompt]
    AI2R --> SA_CREATE
    SA_CREATE --> SB2[(Supabase\ninsert quiz_sessions\ninsert quiz_questions)]
    SA_CREATE -- sessionId --> QSESS

    %% ── Active quiz ───────────────────────────────────────────────────────────
    QSESS[/quiz/id\nServer Component] --> SB3[(Supabase\nfetch session\n+ questions)]
    SB3 --> QCOMP[QuizSession\nClient Component]

    QCOMP -- submitAnswer --> SA_ANS[Server Action\nactions/quiz.ts]
    SA_ANS --> SB4[(Supabase\nfetch question\ncheck ownership)]

    SA_ANS -- MC wrong\nattempt 1–2 --> AI3[Anthropic API\nclaude-haiku-4-5\nbuildHintPrompt]
    SA_ANS -- Descriptive --> AI4[Anthropic API\nclaude-haiku-4-5\nbuildDescriptiveEvalPrompt\nJSON score + feedback]
    AI3 --> SA_ANS
    AI4 --> SA_ANS
    SA_ANS --> SB5[(Supabase\nupdateQuestionAttempt)]
    SA_ANS -- EvaluationResult --> QCOMP

    %% ── Streaming explanation ─────────────────────────────────────────────────
    QCOMP -- 3rd wrong attempt\nfetch POST --> STREAM[Route Handler\n/api/quiz/stream]
    STREAM --> AI5[Anthropic API\nclaude-sonnet-4-6\nbuildExplainerPrompt\nstreamText via Vercel AI SDK]
    AI5 -- text stream --> STREAM
    STREAM -- ReadableStream --> QCOMP

    %% ── Finish quiz ───────────────────────────────────────────────────────────
    QCOMP -- finishQuiz --> SA_FIN[Server Action\nactions/quiz.ts]
    SA_FIN --> SB6[(Supabase\ncompleteQuizSession\ncorrect_answers · score_pct)]
    SA_FIN -- redirect --> REPORT

    %% ── Report generation ─────────────────────────────────────────────────────
    REPORT[/quiz/id/report\nServer Component] --> SA_RPT[Server Action\nactions/reports.ts\ngenerateReport]
    SA_RPT -- parallel --> AI6[Anthropic API\nclaude-haiku-4-5\nbuildReportGeneratorPrompt\nJSON summary + struggling_topics]
    SA_RPT -- parallel --> AI7[Anthropic API\nclaude-haiku-4-5\nbuildResumeGeneratorPrompt\nJSON resume + resources]
    AI6 --> SA_RPT
    AI7 --> SA_RPT
    SA_RPT --> SB7[(Supabase\ninsert reports)]
    SB7 --> RCOMP[QuizReport\nClient Component]

    %% ── PDF export ────────────────────────────────────────────────────────────
    RCOMP -- getPdfData --> SA_PDF[Server Action\nactions/reports.ts]
    SA_PDF --> SB8[(Supabase\nfetch report\n+ questions)]
    SA_PDF --> RCOMP
    RCOMP -- client-side render --> PDF[@react-pdf/renderer\nQuizReportPDF\nbrowser only]
    PDF -- blob URL --> RCOMP

    %% ── Notion export ─────────────────────────────────────────────────────────
    RCOMP -- exportToNotion --> SA_NOT[Server Action\nactions/notion-export.ts]
    SA_NOT --> SB9[(Supabase\nuser_integrations\naccess_token)]
    SA_NOT --> NOTCLI[Notion SDK Client\n@notionhq/client]
    NOTCLI --> NOTAPI[Notion API\nfind/create pages\nappend blocks in batches of 100]
    NOTAPI --> NOTCLI
    NOTCLI --> SA_NOT
    SA_NOT --> SB10[(Supabase\nstore notion_page_id)]
    SA_NOT -- pageUrl --> RCOMP

    %% ── Notion OAuth ──────────────────────────────────────────────────────────
    SETT[/settings\nServer Component] --> OAUTH_S[GET /api/auth/notion/start\nredirect to Notion OAuth\nset CSRF cookie]
    OAUTH_S --> NOTAUTH[Notion OAuth Consent]
    NOTAUTH --> OAUTH_CB[GET /api/auth/notion/callback\nvalidate CSRF\nexchange code for token]
    OAUTH_CB --> SB11[(Supabase\nupsert user_integrations)]
    OAUTH_CB -- redirect --> SETT
```
