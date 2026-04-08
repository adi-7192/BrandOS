-- BrandOS PostgreSQL schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  company_name TEXT NOT NULL,
  role TEXT,
  team TEXT,
  brand_count TEXT,
  preferred_inbox_view TEXT DEFAULT 'updates',
  include_original_email BOOLEAN DEFAULT TRUE,
  forwarding_enabled BOOLEAN DEFAULT TRUE,
  default_content_format TEXT DEFAULT 'linkedin',
  tone_strictness TEXT DEFAULT 'balanced',
  preferred_output_length TEXT DEFAULT 'standard',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idempotent: add google_id to existing installs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'google_id'
  ) THEN
    ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferred_inbox_view'
  ) THEN
    ALTER TABLE users ADD COLUMN preferred_inbox_view TEXT DEFAULT 'updates';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'include_original_email'
  ) THEN
    ALTER TABLE users ADD COLUMN include_original_email BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'forwarding_enabled'
  ) THEN
    ALTER TABLE users ADD COLUMN forwarding_enabled BOOLEAN DEFAULT TRUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'default_content_format'
  ) THEN
    ALTER TABLE users ADD COLUMN default_content_format TEXT DEFAULT 'linkedin';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'tone_strictness'
  ) THEN
    ALTER TABLE users ADD COLUMN tone_strictness TEXT DEFAULT 'balanced';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'preferred_output_length'
  ) THEN
    ALTER TABLE users ADD COLUMN preferred_output_length TEXT DEFAULT 'standard';
  END IF;
END $$;

-- Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  display_name TEXT,
  gmail_connection_status TEXT DEFAULT 'not_connected',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN display_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'gmail_connection_status'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN gmail_connection_status TEXT DEFAULT 'not_connected';
  END IF;
END $$;

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  market TEXT,
  language TEXT DEFAULT 'English',
  kit_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Brand kits
CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  voice_adjectives TEXT[] DEFAULT '{}',
  vocabulary TEXT[] DEFAULT '{}',
  restricted_words TEXT[] DEFAULT '{}',
  channel_rules_linkedin TEXT,
  channel_rules_blog TEXT,
  content_goal TEXT,
  publishing_frequency TEXT,
  audience_type TEXT,
  buyer_seniority TEXT,
  age_range TEXT,
  industry_sector TEXT,
  industry_target TEXT,
  funnel_stage TEXT,
  tone_shift TEXT,
  proof_style TEXT,
  content_role TEXT,
  formality_level INTEGER,
  campaign_core_why TEXT,
  past_content_examples TEXT,
  website_url TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inbox cards
CREATE TABLE IF NOT EXISTS inbox_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  email_subject TEXT,
  email_from TEXT,
  email_body TEXT,
  excerpt TEXT,
  extracted_fields JSONB DEFAULT '{}',
  matched_fields TEXT[] DEFAULT '{}',
  unmatched_fields TEXT[] DEFAULT '{}',
  overall_score NUMERIC(4,3),
  thread_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drafts
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  inbox_card_id UUID REFERENCES inbox_cards(id),
  format TEXT NOT NULL CHECK (format IN ('linkedin', 'blog')),
  content TEXT,
  version_number INTEGER DEFAULT 1,
  iteration_instruction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brands_workspace ON brands(workspace_id);
CREATE INDEX IF NOT EXISTS idx_brand_kits_brand ON brand_kits(brand_id);
CREATE INDEX IF NOT EXISTS idx_inbox_cards_brand ON inbox_cards(brand_id);
CREATE INDEX IF NOT EXISTS idx_inbox_cards_status ON inbox_cards(status);
CREATE INDEX IF NOT EXISTS idx_drafts_brand ON drafts(brand_id);

-- Intent capture
CREATE TABLE IF NOT EXISTS intent_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  moment VARCHAR(20) NOT NULL,
  question_key VARCHAR(50) NOT NULL,
  answer VARCHAR(100) NOT NULL,
  content_piece_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intent_signals_user_question
  ON intent_signals(user_id, moment, question_key);

CREATE TABLE IF NOT EXISTS intent_prompt_dismissals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  moment VARCHAR(20) NOT NULL,
  question_key VARCHAR(50) NOT NULL,
  content_piece_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_intent_prompt_dismissals_user_question
  ON intent_prompt_dismissals(user_id, moment, question_key);

CREATE TABLE IF NOT EXISTS expansion_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_expansion_leads_user
  ON expansion_leads(user_id);
