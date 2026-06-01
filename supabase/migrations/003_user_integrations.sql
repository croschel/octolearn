-- ============================================================
-- user_integrations
-- Stores per-user OAuth tokens for external integrations.
-- provider is constrained to known values; new providers
-- can be added by extending the check constraint.
-- ============================================================

CREATE TABLE user_integrations (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 TEXT NOT NULL,
  provider                TEXT NOT NULL CHECK (provider IN ('notion', 'google')),
  access_token            TEXT NOT NULL,
  refresh_token           TEXT,
  expires_at              TIMESTAMPTZ,
  notion_bot_id           TEXT,
  notion_workspace_name   TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, provider)
);

ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own rows.
-- Uses the same Clerk JWT sub claim pattern as the rest of the schema.
CREATE POLICY "user_integrations: owner access" ON user_integrations
  FOR ALL
  USING  (user_id = (auth.jwt() ->> 'sub'))
  WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

-- Auto-update updated_at on any row change.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
