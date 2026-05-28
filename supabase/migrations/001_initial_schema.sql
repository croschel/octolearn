-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- subject_areas
-- ============================================================
CREATE TABLE subject_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subject_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subject_areas: owner access" ON subject_areas
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- ============================================================
-- quiz_sessions
-- ============================================================
CREATE TABLE quiz_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,
  subject_area_id   UUID REFERENCES subject_areas(id) ON DELETE SET NULL,
  topics            TEXT[] NOT NULL,
  total_questions   INT NOT NULL,
  correct_answers   INT DEFAULT 0,
  status            TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_sessions: owner access" ON quiz_sessions
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- ============================================================
-- quiz_questions
-- ============================================================
CREATE TABLE quiz_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('multiple-choice', 'descriptive')),
  question        TEXT NOT NULL,
  options         JSONB,
  correct_answer  TEXT NOT NULL,
  explanation     TEXT NOT NULL,
  attempt_count   INT DEFAULT 0,
  is_correct      BOOLEAN,
  user_answer     TEXT,
  position        INT NOT NULL
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "quiz_questions: owner access via session" ON quiz_questions
  USING (
    EXISTS (
      SELECT 1 FROM quiz_sessions qs
      WHERE qs.id = quiz_questions.session_id
        AND qs.user_id = (auth.jwt() ->> 'sub')
    )
  );

-- ============================================================
-- reports
-- ============================================================
CREATE TABLE reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             TEXT NOT NULL,
  session_id          UUID REFERENCES quiz_sessions(id) ON DELETE SET NULL,
  subject_area        TEXT NOT NULL,
  topics_covered      TEXT[] NOT NULL,
  score_percentage    FLOAT NOT NULL,
  summary             TEXT NOT NULL,
  struggling_topics   TEXT[],
  notion_page_id      TEXT,
  drive_file_id       TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports: owner access" ON reports
  USING (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));
