-- ============================================================
-- Profile privacy: public / private accounts, follow requests
-- ============================================================

-- ── 1. Add is_private to profiles ────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false;

-- ── 2. Add status column to follows ──────────────────────────
ALTER TABLE follows
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'accepted'
    CONSTRAINT follows_status_check CHECK (status IN ('pending', 'accepted'));

-- ── 3. Trigger: auto-set follow status on insert ──────────────
-- If the target profile is private the row is created as 'pending';
-- otherwise it is immediately 'accepted'.  This enforces the rule
-- server-side so no client can bypass it.
CREATE OR REPLACE FUNCTION set_follow_status_on_insert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_private boolean := false;
BEGIN
  SELECT is_private INTO v_private FROM profiles WHERE id = NEW.following_id;
  NEW.status := CASE WHEN v_private THEN 'pending' ELSE 'accepted' END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS follows_set_status ON follows;
CREATE TRIGGER follows_set_status
BEFORE INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION set_follow_status_on_insert();

-- ── 4. Update follow-count sync trigger ───────────────────────
-- Only accepted follows affect the public counts.
CREATE OR REPLACE FUNCTION sync_follow_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- New accepted follow
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;

  -- Unfollowed / request cancelled / declined
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET follower_count  = GREATEST(0, follower_count  - 1) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;

  -- Follow request accepted (pending → accepted)
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS follows_count_sync ON follows;
CREATE TRIGGER follows_count_sync
AFTER INSERT OR DELETE OR UPDATE OF status ON follows
FOR EACH ROW EXECUTE FUNCTION sync_follow_counts();

-- ── 5. Follows RLS (replace previous policies) ───────────────
DROP POLICY IF EXISTS "follows_select" ON follows;
DROP POLICY IF EXISTS "follows_insert" ON follows;
DROP POLICY IF EXISTS "follows_delete" ON follows;

-- Everyone can see accepted follows; parties can see their own pending rows
CREATE POLICY "follows_select" ON follows FOR SELECT USING (
  status = 'accepted'
  OR follower_id = auth.uid()
  OR following_id = auth.uid()
);

-- Can only create your own follow (trigger sets the status)
CREATE POLICY "follows_insert" ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Target can accept a pending request
CREATE POLICY "follows_update" ON follows FOR UPDATE
  USING  (following_id = auth.uid() AND status = 'pending')
  WITH CHECK (status = 'accepted');

-- Follower can cancel; target can decline
CREATE POLICY "follows_delete" ON follows FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- ── 6. Profiles RLS (replace previous policies) ──────────────
DROP POLICY IF EXISTS "profiles_select_all"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;

-- Public profiles visible to all authenticated users.
-- Private profiles only visible to the owner or accepted followers.
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  NOT is_private
  OR id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id  = auth.uid()
      AND following_id = profiles.id
      AND status       = 'accepted'
  )
);

CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── 7. Posts RLS (replace feed_posts migration policies) ──────
DROP POLICY IF EXISTS "posts: select" ON posts;
DROP POLICY IF EXISTS "posts: insert" ON posts;
DROP POLICY IF EXISTS "posts: update" ON posts;
DROP POLICY IF EXISTS "posts: delete" ON posts;

-- Own posts are always visible.
-- Public posts from public-profile authors appear in discovery.
-- Any post (public or private) from an accepted follow appears in feed.
CREATE POLICY "posts: select" ON posts FOR SELECT USING (
  author_id = auth.uid()
  OR (
    is_public = true
    AND NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE id = posts.author_id AND is_private = true
    )
  )
  OR EXISTS (
    SELECT 1 FROM follows
    WHERE follower_id  = auth.uid()
      AND following_id = posts.author_id
      AND status       = 'accepted'
  )
);

CREATE POLICY "posts: insert" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts: update" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts: delete" ON posts FOR DELETE USING (auth.uid() = author_id);

-- ── 8. post_likes RLS (replace previous open policy) ─────────
DROP POLICY IF EXISTS "post_likes: select" ON post_likes;
DROP POLICY IF EXISTS "post_likes: insert" ON post_likes;
DROP POLICY IF EXISTS "post_likes: delete" ON post_likes;

-- Likes are visible iff the post itself is visible (posts RLS is
-- applied to the sub-select automatically).
CREATE POLICY "post_likes: select" ON post_likes FOR SELECT USING (
  EXISTS (SELECT 1 FROM posts WHERE id = post_likes.post_id)
);

CREATE POLICY "post_likes: insert" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes: delete" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- ── 9. Index for pending follow request lookups ───────────────
CREATE INDEX IF NOT EXISTS follows_pending_target_idx
  ON follows(following_id, status)
  WHERE status = 'pending';
