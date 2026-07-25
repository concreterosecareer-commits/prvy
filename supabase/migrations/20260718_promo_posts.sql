-- ─────────────────────────────────────────────────────────
-- Club promotional post fields
-- ─────────────────────────────────────────────────────────

ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS promotion_title text,
  ADD COLUMN IF NOT EXISTS expires_at      timestamptz;

-- Index makes it cheap to filter/sort active promotions in the feed
CREATE INDEX IF NOT EXISTS posts_expires_at_idx
  ON posts (expires_at)
  WHERE expires_at IS NOT NULL;
