# Rule: Database

## Stack
- Supabase (PostgreSQL) — free tier
- Access via Supabase JS client (`@supabase/supabase-js`)
- All queries in `lib/db/queries/` as typed functions — never write raw SQL in components or actions

## Schema

### `users`
Managed by Clerk. We store only the Clerk `user_id` as foreign key reference — no password or auth data in Supabase.

### `subject_areas`
```sql
CREATE TABLE subject_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,           -- Clerk user_id
  title       TEXT NOT NULL,           -- e.g. "AWS", "TypeScript"
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);
```

### `quiz_sessions`
```sql
CREATE TABLE quiz_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,
  subject_area_id   UUID REFERENCES subject_areas(id),
  topics            TEXT[] NOT NULL,   -- topics the user studied that day
  total_questions   INT NOT NULL,
  correct_answers   INT DEFAULT 0,
  status            TEXT DEFAULT 'in_progress', -- in_progress | completed
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ
);
```

### `quiz_questions`
```sql
CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES quiz_sessions(id),
  type            TEXT NOT NULL,       -- multiple-choice | descriptive
  question        TEXT NOT NULL,
  options         JSONB,               -- null for descriptive
  correct_answer  TEXT NOT NULL,
  explanation     TEXT NOT NULL,
  attempt_count   INT DEFAULT 0,
  is_correct      BOOLEAN,
  user_answer     TEXT,
  position        INT NOT NULL         -- question order in the session
);
```

### `reports`
```sql
CREATE TABLE reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT NOT NULL,
  session_id          UUID REFERENCES quiz_sessions(id),
  subject_area        TEXT NOT NULL,
  topics_covered      TEXT[] NOT NULL,
  score_percentage    FLOAT NOT NULL,
  summary             TEXT NOT NULL,    -- AI-generated summary
  struggling_topics   TEXT[],           -- topics from 3-failure questions
  notion_page_id      TEXT,             -- set after Notion export
  drive_file_id       TEXT,             -- set after Drive export
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

## Rules
- Always filter by `user_id` — never return data across users
- Use Row Level Security (RLS) in Supabase with Clerk JWT verification
- All queries must be wrapped in try/catch in Server Actions
- Use `supabase-mcp` server during development to inspect and manage schema
