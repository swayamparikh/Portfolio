-- ContentPilot AI — database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- `auth.users` is managed by Supabase Auth.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- brand_profiles
-- ---------------------------------------------------------------------------
create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  industry text,
  tone text,
  audience text,
  sample_posts text,
  created_at timestamptz default now() not null
);

alter table brand_profiles enable row level security;

create policy "Users can view their own brand profiles"
  on brand_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own brand profiles"
  on brand_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own brand profiles"
  on brand_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own brand profiles"
  on brand_profiles for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- generated_content
-- ---------------------------------------------------------------------------
create table if not exists generated_content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  brand_profile_id uuid references brand_profiles(id) on delete set null,
  platform text not null,
  content_type text not null,
  topic text,
  caption text,
  hashtags text[],
  hooks text[],
  best_time text,
  is_favorite boolean default false not null,
  created_at timestamptz default now() not null
);

alter table generated_content enable row level security;

create policy "Users can view their own generated content"
  on generated_content for select
  using (auth.uid() = user_id);

create policy "Users can insert their own generated content"
  on generated_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own generated content"
  on generated_content for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own generated content"
  on generated_content for delete
  using (auth.uid() = user_id);

create index if not exists generated_content_user_id_idx on generated_content (user_id);
create index if not exists generated_content_created_at_idx on generated_content (created_at desc);

-- ---------------------------------------------------------------------------
-- generation_usage — backs the per-user / per-IP rate limiter on /api/generate
-- ---------------------------------------------------------------------------
create table if not exists generation_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  ip_hash text,
  created_at timestamptz default now() not null
);

alter table generation_usage enable row level security;

-- Only the server (service role) reads/writes usage rows; no client policies are defined,
-- so RLS denies all access from the browser by default.

create index if not exists generation_usage_user_id_idx on generation_usage (user_id, created_at desc);
create index if not exists generation_usage_ip_hash_idx on generation_usage (ip_hash, created_at desc);
