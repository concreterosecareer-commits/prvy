-- ============================================================
-- Messaging RLS Policies
-- Run this in Supabase SQL Editor → Run
-- ============================================================

-- ── Enable RLS on both tables ────────────────────────────────
alter table conversations enable row level security;
alter table messages      enable row level security;

-- ── CONVERSATIONS ────────────────────────────────────────────

-- Users can see their own conversations
create policy "conversations: select own"
  on conversations for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Users can create a conversation where they are one of the parties
create policy "conversations: insert own"
  on conversations for insert
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Users can update the last_message pointer on their own conversations
create policy "conversations: update own"
  on conversations for update
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- ── MESSAGES ─────────────────────────────────────────────────

-- Users can read messages in conversations they belong to
create policy "messages: select in own conversations"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Users can insert messages where they are the sender,
-- and the conversation belongs to them
create policy "messages: insert as sender"
  on messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Users can mark messages addressed to them as read
create policy "messages: update is_read for recipient"
  on messages for update
  using (
    -- Only allow updating messages in conversations where auth user is a participant
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  )
  with check (
    -- Only the recipient (not the sender) can mark as read
    sender_id <> auth.uid()
  );

-- ── REALTIME ─────────────────────────────────────────────────
-- Enable Realtime for messages (run once; idempotent via BEGIN/EXCEPTION)
do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when duplicate_object then
    null; -- already added
  end;
end;
$$;
