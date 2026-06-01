alter table reports
  add column if not exists learning_resume text,
  add column if not exists resources       jsonb;
