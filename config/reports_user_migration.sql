-- Add user_id to reports table for per-user scoping
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
