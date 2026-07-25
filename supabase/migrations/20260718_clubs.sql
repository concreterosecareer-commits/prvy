-- ─────────────────────────────────────────────────────────
-- Club accounts
-- ─────────────────────────────────────────────────────────

-- 1. Allow 'club' as a valid role
--    Drop any existing check constraint on the role column, then recreate it.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('patron', 'entertainer', 'admin', 'club'));

-- 2. Club-specific profile columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS address       text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text;

-- 3. Club profiles are always public.
--    Enforce with a trigger so the column can never be set to true for clubs.
CREATE OR REPLACE FUNCTION enforce_club_public()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM users WHERE id = NEW.id AND role = 'club'
  ) THEN
    NEW.is_private := false;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_club_always_public ON profiles;
CREATE TRIGGER trg_club_always_public
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION enforce_club_public();
