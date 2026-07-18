-- ============================================================
-- Social Feed: posts + post_likes tables
-- Run in Supabase SQL Editor → Run
-- ============================================================

-- ── posts ────────────────────────────────────────────────────
create table if not exists posts (
  id         uuid        primary key default gen_random_uuid(),
  author_id  uuid        not null references auth.users(id) on delete cascade,
  type       text        not null default 'user'
               check (type in ('user', 'club')),
  image_url  text        not null,
  caption    text,
  is_public  boolean     not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── post_likes ───────────────────────────────────────────────
create table if not exists post_likes (
  id         uuid        primary key default gen_random_uuid(),
  post_id    uuid        not null references posts(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_likes_unique unique (post_id, user_id)
);

-- ── Indexes ──────────────────────────────────────────────────
create index if not exists posts_author_id_idx   on posts(author_id);
create index if not exists posts_created_at_idx  on posts(created_at desc);
create index if not exists posts_is_public_idx   on posts(is_public);
create index if not exists post_likes_post_idx   on post_likes(post_id);
create index if not exists post_likes_user_idx   on post_likes(user_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table posts      enable row level security;
alter table post_likes enable row level security;

-- SELECT: public posts, own posts, posts from active connections
create policy "posts: select"
  on posts for select
  using (
    is_public = true
    or auth.uid() = author_id
    or exists (
      select 1 from connections c
      where c.status = 'active'
        and (
          (c.patron_id = auth.uid() and c.entertainer_id = posts.author_id)
          or
          (c.entertainer_id = auth.uid() and c.patron_id = posts.author_id)
        )
    )
  );

-- INSERT: author must be the authenticated user
create policy "posts: insert"
  on posts for insert
  with check (auth.uid() = author_id);

-- UPDATE / DELETE: own posts only
create policy "posts: update"
  on posts for update
  using (auth.uid() = author_id);

create policy "posts: delete"
  on posts for delete
  using (auth.uid() = author_id);

-- post_likes: anyone in the feed can read likes
create policy "post_likes: select"
  on post_likes for select
  using (true);

create policy "post_likes: insert"
  on post_likes for insert
  with check (auth.uid() = user_id);

create policy "post_likes: delete"
  on post_likes for delete
  using (auth.uid() = user_id);

-- ── Realtime ─────────────────────────────────────────────────
do $$
begin
  begin
    alter publication supabase_realtime add table posts;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table post_likes;
  exception when duplicate_object then null;
  end;
end;
$$;

-- ── Storage bucket for post images ───────────────────────────
-- Posts are uploaded to the existing "media" bucket under a posts/ prefix.
-- If the media bucket doesn't exist yet, create it:
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload post images
create policy "media: auth upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

-- Allow public read of media objects
create policy "media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Allow owners to delete their own uploads
create policy "media: owner delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[2]);
