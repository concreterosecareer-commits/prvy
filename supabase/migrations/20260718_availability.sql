-- ─────────────────────────────────────────────────────────
-- User availability
-- ─────────────────────────────────────────────────────────

-- 1. Allow 'working' as a valid status
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users
  ADD CONSTRAINT users_status_check
  CHECK (status IN ('active', 'working', 'away', 'offline', 'suspended', 'pending'));

-- 2. Working-days schedule stored as an integer array.
--    Convention: 0 = Monday … 6 = Sunday  (ISO-week-inspired, Mon-first).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS working_days integer[];
