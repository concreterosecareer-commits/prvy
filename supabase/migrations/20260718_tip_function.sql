-- ─────────────────────────────────────────────────────────
-- Atomic tip function
-- Runs as SECURITY DEFINER so it can write to both the
-- sender's and recipient's wallets, and insert transaction
-- rows for both parties — bypassing the owner-only RLS
-- policies on wallets and transactions while still verifying
-- the caller via auth.uid().
-- ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION send_tip(
  p_recipient_id uuid,
  p_gem_amount   bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_id   uuid := auth.uid();
  v_sender_gems bigint;
  v_debit_id    uuid;
BEGIN
  -- Must be authenticated
  IF v_sender_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  -- Amount bounds (1–100,000 gems)
  IF p_gem_amount < 1 OR p_gem_amount > 100000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_amount');
  END IF;

  -- Cannot tip yourself
  IF p_recipient_id = v_sender_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'cannot_tip_self');
  END IF;

  -- Idempotency guard: reject identical tip within 10 seconds
  IF EXISTS (
    SELECT 1 FROM transactions
    WHERE user_id         = v_sender_id
      AND counterparty_id = p_recipient_id
      AND type            = 'tip'
      AND gem_amount      = p_gem_amount
      AND created_at      > now() - interval '10 seconds'
  ) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'duplicate_tip');
  END IF;

  -- Lock sender wallet and read balance (prevents concurrent over-spend)
  SELECT gem_balance INTO v_sender_gems
  FROM wallets
  WHERE user_id = v_sender_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_wallet');
  END IF;

  IF v_sender_gems < p_gem_amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_gems');
  END IF;

  -- Lock recipient wallet (ensures they have one; prevents concurrent writes)
  PERFORM gem_balance
  FROM wallets
  WHERE user_id = p_recipient_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'recipient_no_wallet');
  END IF;

  -- Deduct from sender
  UPDATE wallets
  SET gem_balance = gem_balance - p_gem_amount,
      updated_at  = now()
  WHERE user_id = v_sender_id;

  -- Credit recipient
  UPDATE wallets
  SET gem_balance = gem_balance + p_gem_amount,
      updated_at  = now()
  WHERE user_id = p_recipient_id;

  -- Sender debit transaction row
  INSERT INTO transactions (user_id, counterparty_id, type, status, gem_amount, description)
  VALUES (v_sender_id, p_recipient_id, 'tip', 'completed', p_gem_amount, 'Tip sent')
  RETURNING id INTO v_debit_id;

  -- Recipient credit transaction row
  INSERT INTO transactions (user_id, counterparty_id, type, status, gem_amount, description)
  VALUES (p_recipient_id, v_sender_id, 'tip', 'completed', p_gem_amount, 'Tip received');

  -- Notify recipient
  INSERT INTO notifications (user_id, type, title, body, metadata)
  VALUES (
    p_recipient_id,
    'tip',
    'New Tip',
    format('You received %s gems', p_gem_amount),
    jsonb_build_object('sender_id', v_sender_id, 'gem_amount', p_gem_amount)
  );

  -- Update analytics (upsert daily row)
  INSERT INTO analytics_daily (user_id, date, tips_received)
  VALUES (p_recipient_id, current_date, p_gem_amount::numeric)
  ON CONFLICT (user_id, date)
  DO UPDATE SET tips_received = analytics_daily.tips_received + p_gem_amount::numeric;

  RETURN jsonb_build_object(
    'ok',             true,
    'transaction_id', v_debit_id,
    'new_balance',    v_sender_gems - p_gem_amount
  );
END;
$$;

-- Only authenticated users may call this function
REVOKE ALL ON FUNCTION send_tip(uuid, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION send_tip(uuid, bigint) TO authenticated;
