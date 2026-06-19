-- PRVY platform schema
-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ========== ENUMS ==========
create type user_role as enum ('patron', 'entertainer', 'admin');
create type user_status as enum ('active', 'away', 'offline', 'suspended', 'pending');
create type connection_status as enum ('pending', 'active', 'blocked', 'declined');
create type message_type as enum ('text', 'image', 'video', 'audio', 'tip', 'system');
create type transaction_type as enum ('purchase', 'tip', 'subscription', 'withdrawal', 'referral_bonus', 'refund');
create type transaction_status as enum ('pending', 'completed', 'failed', 'cancelled');
create type notification_type as enum ('message', 'tip', 'subscriber', 'payout', 'invite', 'system');
create type referral_status as enum ('pending', 'active', 'expired');
create type media_type as enum ('image', 'video', 'audio');

-- ========== USERS ==========
-- Mirrors auth.users (Supabase) 1:1 via id
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  phone text unique,
  role user_role not null default 'patron',
  status user_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== PROFILES ==========
create table profiles (
  id uuid primary key references users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  cover_url text,
  bio text,
  tagline text,
  age int,
  location text,
  languages text[],
  height text,
  rates jsonb,
  is_verified boolean not null default false,
  response_rate numeric(5,2) default 0,
  rating numeric(3,2) default 0,
  patron_count int not null default 0,
  earnings_total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_username on profiles(username);

-- ========== MEDIA ==========
create table media (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references users(id) on delete cascade,
  type media_type not null,
  url text not null,
  thumbnail_url text,
  caption text,
  is_public boolean not null default true,
  created_at timestamptz not null default now()
);

create index idx_media_owner on media(owner_id);

-- ========== CONNECTIONS ==========
create table connections (
  id uuid primary key default uuid_generate_v4(),
  patron_id uuid not null references users(id) on delete cascade,
  entertainer_id uuid not null references users(id) on delete cascade,
  status connection_status not null default 'pending',
  earnings numeric(12,2) not null default 0,
  last_interaction_at timestamptz,
  created_at timestamptz not null default now(),
  unique (patron_id, entertainer_id)
);

create index idx_connections_patron on connections(patron_id);
create index idx_connections_entertainer on connections(entertainer_id);

-- ========== CONVERSATIONS ==========
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  user_a_id uuid not null references users(id) on delete cascade,
  user_b_id uuid not null references users(id) on delete cascade,
  last_message_id uuid,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_a_id, user_b_id)
);

create index idx_conversations_user_a on conversations(user_a_id);
create index idx_conversations_user_b on conversations(user_b_id);

-- ========== MESSAGES ==========
create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  type message_type not null default 'text',
  body text,
  media_id uuid references media(id),
  gem_amount int,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_messages_conversation on messages(conversation_id, created_at desc);
create index idx_messages_sender on messages(sender_id);

alter table conversations
  add constraint fk_last_message foreign key (last_message_id) references messages(id) on delete set null;

-- ========== WALLETS ==========
create table wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid unique not null references users(id) on delete cascade,
  gem_balance bigint not null default 0,
  usd_balance numeric(12,2) not null default 0,
  is_vip boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ========== TRANSACTIONS ==========
create table transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  counterparty_id uuid references users(id) on delete set null,
  type transaction_type not null,
  status transaction_status not null default 'pending',
  gem_amount bigint default 0,
  usd_amount numeric(12,2) default 0,
  description text,
  payment_method text,
  reference_id text,
  created_at timestamptz not null default now()
);

create index idx_transactions_user on transactions(user_id, created_at desc);

-- ========== REFERRALS ==========
create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references users(id) on delete cascade,
  invitee_id uuid references users(id) on delete cascade,
  invite_code text unique not null,
  status referral_status not null default 'pending',
  commission_rate numeric(5,2) not null default 15.00,
  commission_earned numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  activated_at timestamptz
);

create index idx_referrals_referrer on referrals(referrer_id);

-- ========== NOTIFICATIONS ==========
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_notifications_user on notifications(user_id, is_read, created_at desc);

-- ========== ANALYTICS ==========
create table analytics_daily (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  date date not null,
  earnings numeric(12,2) not null default 0,
  tips_received numeric(12,2) not null default 0,
  new_patrons int not null default 0,
  messages_count int not null default 0,
  profile_views int not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

create index idx_analytics_user_date on analytics_daily(user_id, date desc);

-- ========== updated_at TRIGGERS ==========
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at before update on users
  for each row execute function set_updated_at();
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ========== ROW LEVEL SECURITY ==========
alter table users enable row level security;
alter table profiles enable row level security;
alter table media enable row level security;
alter table connections enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table referrals enable row level security;
alter table notifications enable row level security;
alter table analytics_daily enable row level security;

-- Users: read own row, admins read all
create policy users_select_own on users for select using (auth.uid() = id);
create policy users_update_own on users for update using (auth.uid() = id);

-- Profiles: public read, owner write
create policy profiles_select_all on profiles for select using (true);
create policy profiles_update_own on profiles for update using (auth.uid() = id);
create policy profiles_insert_own on profiles for insert with check (auth.uid() = id);

-- Media: public if is_public, owner full access
create policy media_select_public on media for select using (is_public = true or owner_id = auth.uid());
create policy media_insert_own on media for insert with check (owner_id = auth.uid());
create policy media_delete_own on media for delete using (owner_id = auth.uid());

-- Connections: visible to either party
create policy connections_select_party on connections for select
  using (auth.uid() = patron_id or auth.uid() = entertainer_id);
create policy connections_insert_patron on connections for insert
  with check (auth.uid() = patron_id);
create policy connections_update_party on connections for update
  using (auth.uid() = patron_id or auth.uid() = entertainer_id);

-- Conversations: visible to either party
create policy conversations_select_party on conversations for select
  using (auth.uid() = user_a_id or auth.uid() = user_b_id);
create policy conversations_insert_party on conversations for insert
  with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- Messages: visible to conversation participants
create policy messages_select_party on messages for select
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );
create policy messages_insert_sender on messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.user_a_id = auth.uid() or c.user_b_id = auth.uid())
    )
  );

-- Wallets: owner only
create policy wallets_select_own on wallets for select using (auth.uid() = user_id);
create policy wallets_update_own on wallets for update using (auth.uid() = user_id);

-- Transactions: owner only
create policy transactions_select_own on transactions for select using (auth.uid() = user_id);
create policy transactions_insert_own on transactions for insert with check (auth.uid() = user_id);

-- Referrals: referrer can view own
create policy referrals_select_own on referrals for select using (auth.uid() = referrer_id);
create policy referrals_insert_own on referrals for insert with check (auth.uid() = referrer_id);

-- Notifications: owner only
create policy notifications_select_own on notifications for select using (auth.uid() = user_id);
create policy notifications_update_own on notifications for update using (auth.uid() = user_id);

-- Analytics: owner only
create policy analytics_select_own on analytics_daily for select using (auth.uid() = user_id);
