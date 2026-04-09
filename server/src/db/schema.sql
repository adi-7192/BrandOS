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
  workspace_profile_completed BOOLEAN DEFAULT FALSE,
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
    WHERE table_name = 'users' AND column_name = 'workspace_profile_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN workspace_profile_completed BOOLEAN DEFAULT FALSE;
  END IF;

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

UPDATE users
SET workspace_profile_completed = TRUE
WHERE workspace_profile_completed IS DISTINCT FROM TRUE
  AND (password_hash IS NOT NULL OR onboarding_complete = TRUE);

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
  funnel_stages TEXT[] DEFAULT '{}',
  funnel_stage TEXT,
  tone_shift TEXT,
  proof_style TEXT,
  content_role TEXT,
  formality_level INTEGER,
  campaign_core_why TEXT,
  past_content_examples TEXT,
  website_url TEXT,
  website_urls TEXT[] DEFAULT '{}',
  website_summary TEXT,
  guideline_file_url TEXT,
  guideline_file_name TEXT,
  guideline_storage_path TEXT,
  guideline_text_excerpt TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'funnel_stages'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN funnel_stages TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'website_urls'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN website_urls TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'website_summary'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN website_summary TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'guideline_file_url'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN guideline_file_url TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'guideline_file_name'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN guideline_file_name TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'guideline_storage_path'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN guideline_storage_path TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'brand_kits' AND column_name = 'guideline_text_excerpt'
  ) THEN
    ALTER TABLE brand_kits ADD COLUMN guideline_text_excerpt TEXT;
  END IF;
END $$;

-- Inbox cards
CREATE TABLE IF NOT EXISTS inbox_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  provider_email_id TEXT,
  provider_message_id TEXT,
  email_to TEXT[] DEFAULT '{}',
  email_subject TEXT,
  email_from TEXT,
  email_body TEXT,
  email_headers JSONB DEFAULT '{}'::jsonb,
  excerpt TEXT,
  classification TEXT DEFAULT 'campaign' CHECK (classification IN ('campaign', 'brand_update', 'mixed', 'needs_routing')),
  routing_status TEXT DEFAULT 'matched' CHECK (routing_status IN ('matched', 'needs_routing', 'confirmed')),
  campaign_action_status TEXT DEFAULT 'not_applicable' CHECK (campaign_action_status IN ('pending', 'done', 'dismissed', 'not_applicable')),
  brand_update_action_status TEXT DEFAULT 'not_applicable' CHECK (brand_update_action_status IN ('pending', 'done', 'dismissed', 'not_applicable')),
  routing_instruction TEXT,
  interpretation_summary TEXT,
  brand_update_proposal JSONB DEFAULT '{}'::jsonb,
  extracted_fields JSONB DEFAULT '{}',
  matched_fields TEXT[] DEFAULT '{}',
  unmatched_fields TEXT[] DEFAULT '{}',
  overall_score NUMERIC(4,3),
  thread_id TEXT,
  publish_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'provider_email_id'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN provider_email_id TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'provider_message_id'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN provider_message_id TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'email_to'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN email_to TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'email_headers'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN email_headers JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'classification'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN classification TEXT DEFAULT 'campaign';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'routing_status'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN routing_status TEXT DEFAULT 'matched';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'campaign_action_status'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN campaign_action_status TEXT DEFAULT 'not_applicable';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'brand_update_action_status'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN brand_update_action_status TEXT DEFAULT 'not_applicable';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'routing_instruction'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN routing_instruction TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'interpretation_summary'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN interpretation_summary TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'brand_update_proposal'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN brand_update_proposal JSONB DEFAULT '{}'::jsonb;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inbox_cards' AND column_name = 'publish_date'
  ) THEN
    ALTER TABLE inbox_cards ADD COLUMN publish_date DATE;
  END IF;
END $$;

-- In-progress generation sessions
CREATE TABLE IF NOT EXISTS generation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  session_title TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'inbox')),
  source_card_ids TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'saved', 'completed', 'abandoned')),
  current_step TEXT DEFAULT 'brief' CHECK (current_step IN ('brief', 'preview', 'creating', 'output')),
  publish_date DATE,
  brief_payload JSONB DEFAULT '{}'::jsonb,
  preview_payload JSONB DEFAULT '{}'::jsonb,
  output_payload JSONB DEFAULT '{}'::jsonb,
  active_tab TEXT DEFAULT 'linkedin' CHECK (active_tab IN ('linkedin', 'blog')),
  last_instruction TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generation_sessions' AND column_name = 'publish_date'
  ) THEN
    ALTER TABLE generation_sessions ADD COLUMN publish_date DATE;
  END IF;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_inbox_cards_workspace ON inbox_cards(workspace_id);
CREATE INDEX IF NOT EXISTS idx_inbox_cards_status ON inbox_cards(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_inbox_cards_provider_email_id ON inbox_cards(provider_email_id) WHERE provider_email_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_generation_sessions_user ON generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_brand ON generation_sessions(brand_id);
CREATE INDEX IF NOT EXISTS idx_generation_sessions_status ON generation_sessions(status);
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
