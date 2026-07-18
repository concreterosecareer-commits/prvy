-- ─────────────────────────────────────────────────────────────
-- follows  (one-way social follow, direction-agnostic)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS follows (
  id           uuid        PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id  uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK  (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS follows_follower_id_idx  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);
CREATE INDEX IF NOT EXISTS follows_created_at_idx   ON follows(created_at DESC);

-- ── Add count columns to profiles (idempotent) ───────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS follower_count  integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count integer NOT NULL DEFAULT 0;

-- ── Trigger: keep counts in sync automatically ───────────────
CREATE OR REPLACE FUNCTION sync_follow_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles
      SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
    UPDATE profiles
      SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles
      SET follower_count  = GREATEST(0, follower_count  - 1) WHERE id = OLD.following_id;
    UPDATE profiles
      SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS follows_count_sync ON follows;
CREATE TRIGGER follows_count_sync
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION sync_follow_counts();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read follows (needed for follower lists / follow checks)
CREATE POLICY "follows_select"
  ON follows FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Can only insert your own follow
CREATE POLICY "follows_insert"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Can only delete your own follow
CREATE POLICY "follows_delete"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ── Realtime ─────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE follows;

-- ── Recalculate any existing counts from connections ─────────
-- (in case connections table was used as a proxy for follows)
UPDATE profiles p
SET follower_count = (
  SELECT COUNT(*) FROM follows f WHERE f.following_id = p.id
),
following_count = (
  SELECT COUNT(*) FROM follows f WHERE f.follower_id = p.id
);
