-- ─────────────────────────────────────────────────────────
-- Preferred locations
-- Stores a short list of cities the user wants content from.
-- ─────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_locations text[];
