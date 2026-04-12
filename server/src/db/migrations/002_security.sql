-- BrandOS security migration 002
-- Run once against the target database after deploying the corresponding
-- application changes. Safe to re-run (all statements are idempotent).

-- ─── 1. Fix drafts.inbox_card_id cascade ─────────────────────────────────────
-- The original FK had no ON DELETE action (= RESTRICT). When a brand cascade
-- deletes its inbox_cards, PostgreSQL evaluates the RESTRICT on
-- drafts.inbox_card_id before the drafts themselves are removed, which can
-- abort the cascade depending on evaluation order. ON DELETE SET NULL is the
-- correct semantic: a draft survives inbox card deletion, its card reference
-- just becomes null.

DO $$
DECLARE
  v_conname TEXT;
BEGIN
  SELECT tc.constraint_name INTO v_conname
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
       AND tc.table_name   = kcu.table_name
  WHERE tc.table_name    = 'drafts'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name  = 'inbox_card_id';

  IF v_conname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE drafts DROP CONSTRAINT %I', v_conname);
  END IF;
END $$;

ALTER TABLE drafts
  ADD CONSTRAINT drafts_inbox_card_id_fkey
  FOREIGN KEY (inbox_card_id) REFERENCES inbox_cards(id) ON DELETE SET NULL;


-- ─── 2. linkedin_email column: prepare for application-layer encryption ───────
-- The linkedin_email column stores PII (the user's LinkedIn email address) in
-- plaintext while every other sensitive value in the same row
-- (access_token_encrypted, refresh_token_encrypted) is AES-256-GCM encrypted.
--
-- The application now encrypts this field using the same encryptSecret() util.
-- Existing plaintext values are handled gracefully by the app (decryptSecret
-- falls back to the raw value if it doesn't match the iv.tag.ciphertext
-- format, so no existing connection is broken before a re-connect).
--
-- After all existing connections have been refreshed (or you run the one-time
-- back-fill below), you can remove the comment and enforce NOT NULL.
--
-- One-time back-fill (run from a trusted Node.js script, not SQL, because
-- encryption requires the LINKEDIN_TOKEN_ENCRYPTION_KEY env var):
--   const rows = await pool.query('SELECT id, linkedin_email FROM linkedin_connections');
--   for (const r of rows.rows) {
--     if (r.linkedin_email && !r.linkedin_email.includes('.')) { // plaintext check
--       await pool.query(
--         'UPDATE linkedin_connections SET linkedin_email = $1 WHERE id = $2',
--         [encryptSecret(r.linkedin_email), r.id]
--       );
--     }
--   }


-- ─── 3. Limited-privilege application role ────────────────────────────────────
-- The application must NOT connect as the database owner / superuser.
-- Create a dedicated role with only the permissions the app actually needs.
--
-- Replace 'CHANGE_ME_strong_password' with a randomly generated password and
-- set DATABASE_URL in the environment to use this role instead of 'postgres'.
--
-- On Supabase: create the role via the Supabase Dashboard SQL editor or the
-- Supabase CLI; the platform may restrict direct role creation via psql.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'brandos_app') THEN
    CREATE ROLE brandos_app WITH LOGIN PASSWORD 'CHANGE_ME_strong_password';
  END IF;
END $$;

-- Grant connection and schema access
GRANT CONNECT ON DATABASE postgres TO brandos_app;  -- adjust DB name if needed
GRANT USAGE ON SCHEMA public TO brandos_app;

-- Grant only the DML operations the app needs; never DDL
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO brandos_app;

GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA public
  TO brandos_app;

-- Apply the same grants to tables/sequences created in the future
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO brandos_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO brandos_app;

-- Explicitly revoke dangerous privileges the app must never have
REVOKE CREATE ON SCHEMA public FROM brandos_app;
