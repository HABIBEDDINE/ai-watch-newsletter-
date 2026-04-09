-- AI Watch Auth Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. users table
CREATE TABLE IF NOT EXISTS users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  full_name         VARCHAR(255) NOT NULL,
  company           VARCHAR(255),
  role              VARCHAR(50) NOT NULL DEFAULT 'other',
  password_hash     VARCHAR(255),
  oauth_provider    VARCHAR(50),
  oauth_id          VARCHAR(255),
  is_verified       BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 2. refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. email_verification_tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 5. newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email         TEXT PRIMARY KEY,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. reports table (per-user, max 30)
CREATE TABLE IF NOT EXISTS reports (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  title      TEXT,
  content    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email           ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash   ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_hash     ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_verify_tokens_hash    ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_reports_user_id       ON reports(user_id);

-- Migrations for existing databases (safe to run on already-created tables)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
