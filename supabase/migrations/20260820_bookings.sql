-- Booking status
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'refunded'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'paid',
  'failed',
  'refunded'
);

-- Booking type
CREATE TYPE booking_type AS ENUM (
  'private',
  'vip',
  'table_dance',
  'club_visit'
);

CREATE TABLE bookings (
  id               uuid           PRIMARY KEY DEFAULT gen_random_uuid(),
  patron_id        uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entertainer_id   uuid           NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  club_name        text,
  booking_type     booking_type   NOT NULL DEFAULT 'private',
  booking_status   booking_status NOT NULL DEFAULT 'pending',
  payment_status   payment_status NOT NULL DEFAULT 'pending',
  scheduled_at     timestamptz    NOT NULL,
  duration_minutes integer        NOT NULL DEFAULT 60,
  amount_usd       numeric(10,2)  NOT NULL DEFAULT 0,
  patron_notes     text,
  entertainer_notes text,
  reference        text           UNIQUE NOT NULL
                     DEFAULT upper(substring(gen_random_uuid()::text FROM 1 FOR 8)),
  created_at       timestamptz    NOT NULL DEFAULT now(),
  updated_at       timestamptz    NOT NULL DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Entertainer sees bookings assigned to them
CREATE POLICY "entertainer_sees_own_bookings" ON bookings
  FOR SELECT USING (entertainer_id = auth.uid());

-- Patron sees bookings they created
CREATE POLICY "patron_sees_own_bookings" ON bookings
  FOR SELECT USING (patron_id = auth.uid());

-- Patron can create bookings
CREATE POLICY "patron_creates_bookings" ON bookings
  FOR INSERT WITH CHECK (patron_id = auth.uid());

-- Patron can cancel their own pending bookings
CREATE POLICY "patron_cancels_own_bookings" ON bookings
  FOR UPDATE USING (patron_id = auth.uid())
  WITH CHECK (patron_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_bookings_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_bookings_updated_at();

-- Add booking notification type (idempotent in Postgres 14+)
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'booking';

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
