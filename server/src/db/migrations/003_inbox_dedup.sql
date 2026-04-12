-- BrandOS migration 003
-- Ensures the partial unique index that backs ON CONFLICT deduplication in the
-- inbound email handler exists on every database, including those provisioned
-- before this index was added to schema.sql.
-- Safe to re-run (IF NOT EXISTS).

CREATE UNIQUE INDEX IF NOT EXISTS idx_inbox_cards_provider_email_id
  ON inbox_cards (provider_email_id)
  WHERE provider_email_id IS NOT NULL;
