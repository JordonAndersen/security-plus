-- Security+ Practice Lab — initial schema
-- Run once in Supabase: SQL Editor → New query → paste → Run.
-- Every table uses Row Level Security so each user can only ever read/write their own rows.

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user, created automatically on sign-up)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) <= 60),
  exam_date     date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Synced app state: one row per user per storage key (stats, history, prefs…)
-- Values are the same JSON the app keeps in the browser; last write wins per key.
-- ---------------------------------------------------------------------------
create table if not exists public.user_state (
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  key         text not null check (key ~ '^[a-z0-9-]{1,40}$'),
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, key)
);

-- ---------------------------------------------------------------------------
-- Append-only answer log (powers weak-area analysis across devices)
-- ---------------------------------------------------------------------------
create table if not exists public.question_attempts (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users (id) on delete cascade default auth.uid(),
  question_id  text not null check (char_length(question_id) <= 80),
  kind         text not null check (kind in ('mc', 'pbq', 'acronym')),
  domain       smallint check (domain between 1 and 5),
  level        text check (level in ('easy', 'medium', 'hard')),
  correct      boolean not null,
  score        numeric(4,3) check (score between 0 and 1),   -- partial credit for PBQs
  source       text check (source in ('study', 'exam', 'pbq', 'quiz')),
  answered_at  timestamptz not null default now()
);
create index if not exists question_attempts_user_q on public.question_attempts (user_id, question_id);
create index if not exists question_attempts_user_time on public.question_attempts (user_id, answered_at desc);

-- ---------------------------------------------------------------------------
-- Practice exam results
-- ---------------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade default auth.uid(),
  taken_at    timestamptz not null default now(),
  length      text check (length in ('full', 'half')),
  difficulty  text check (difficulty in ('all', 'hard')),
  score       integer check (score between 100 and 900),
  pct         numeric(5,4) check (pct between 0 and 1),
  secs        integer check (secs >= 0),
  domain_pct  jsonb
);
create index if not exists exam_attempts_user_time on public.exam_attempts (user_id, taken_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.user_state        enable row level security;
alter table public.question_attempts enable row level security;
alter table public.exam_attempts     enable row level security;

-- profiles: read/update own row (insert happens via trigger)
create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- user_state: full control of own rows
create policy "state_select_own" on public.user_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "state_insert_own" on public.user_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "state_update_own" on public.user_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "state_delete_own" on public.user_state for delete to authenticated using ((select auth.uid()) = user_id);

-- attempts: insert + read own; deletes allowed so "reset my stats" works
create policy "qa_select_own" on public.question_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "qa_insert_own" on public.question_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "qa_delete_own" on public.question_attempts for delete to authenticated using ((select auth.uid()) = user_id);

create policy "ea_select_own" on public.exam_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "ea_insert_own" on public.exam_attempts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "ea_delete_own" on public.exam_attempts for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile when a user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- keep profiles.updated_at current
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Analysis views (security_invoker = RLS of the caller applies)
-- ---------------------------------------------------------------------------
create or replace view public.my_question_stats with (security_invoker = true) as
select question_id, kind, max(domain) as domain, max(level) as level,
       count(*) as attempts,
       count(*) filter (where correct) as correct,
       round(avg(case when correct then 1 else 0 end)::numeric, 3) as accuracy,
       max(answered_at) as last_seen
from public.question_attempts
group by question_id, kind;

create or replace view public.my_domain_stats with (security_invoker = true) as
select domain, kind,
       count(*) as attempts,
       round(avg(coalesce(score, case when correct then 1 else 0 end))::numeric, 3) as accuracy,
       count(*) filter (where answered_at > now() - interval '7 days') as attempts_7d
from public.question_attempts
where domain is not null
group by domain, kind;
