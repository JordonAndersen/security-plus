-- Security+ Practice Lab — roles (user/admin) + user-created questions with admin review.
-- Run AFTER 0001_init.sql: SQL Editor → New query → paste → Run.
--
-- Make yourself the first admin (run once, after you've signed up in the app):
--   update public.profiles set role = 'admin' where email = 'you@example.com';

-- ---------------------------------------------------------------------------
-- Roles on profiles
-- ---------------------------------------------------------------------------
alter table public.profiles add column if not exists role  text not null default 'user' check (role in ('user', 'admin'));
alter table public.profiles add column if not exists email text;
update public.profiles p set email = u.email from auth.users u where u.id = p.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, email)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)), 60), new.email);
  return new;
end; $$;

-- Users may edit ONLY their display name and exam date. Role/email changes need admin RPCs.
revoke update on public.profiles from anon, authenticated;
grant  update (display_name, exam_date) on public.profiles to authenticated;

-- Helper: is the caller an admin?  (security definer so it can read profiles without RLS recursion)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;
revoke execute on function public.is_admin() from public, anon;
grant  execute on function public.is_admin() to authenticated;

-- Admins can see every profile (users still see only their own via 0001's policy)
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles for select to authenticated using (public.is_admin());

-- Admin: change a user's role (cannot demote the last remaining admin)
create or replace function public.admin_set_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admins only' using errcode = '42501'; end if;
  if new_role not in ('user', 'admin') then raise exception 'Invalid role'; end if;
  if new_role = 'user'
     and (select role from public.profiles where id = target) = 'admin'
     and (select count(*) from public.profiles where role = 'admin') <= 1 then
    raise exception 'Cannot remove the last admin';
  end if;
  update public.profiles set role = new_role where id = target;
end; $$;
revoke execute on function public.admin_set_role(uuid, text) from public, anon;
grant  execute on function public.admin_set_role(uuid, text) to authenticated;

-- Admin: per-user activity overview
create or replace function public.admin_user_overview()
returns table (id uuid, display_name text, email text, role text, created_at timestamptz,
               answers bigint, accuracy numeric, last_active timestamptz, exams bigint, best_score integer)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admins only' using errcode = '42501'; end if;
  return query
  select p.id, p.display_name, p.email, p.role, p.created_at,
         (select count(*) from public.question_attempts a where a.user_id = p.id),
         (select round(avg(case when a.correct then 1 else 0 end)::numeric, 3) from public.question_attempts a where a.user_id = p.id),
         greatest((select max(a.answered_at) from public.question_attempts a where a.user_id = p.id),
                  (select max(e.taken_at) from public.exam_attempts e where e.user_id = p.id)),
         (select count(*) from public.exam_attempts e where e.user_id = p.id),
         (select max(e.score) from public.exam_attempts e where e.user_id = p.id)
  from public.profiles p
  order by p.created_at;
end; $$;
revoke execute on function public.admin_user_overview() from public, anon;
grant  execute on function public.admin_user_overview() to authenticated;

-- ---------------------------------------------------------------------------
-- User-created questions
--   private  → only the author sees/uses it
--   pending  → author submitted it for sharing; admins review
--   public   → approved; every signed-in user gets it in their bank
--   rejected → admin declined (with a note); author can edit & resubmit
-- ---------------------------------------------------------------------------
create table if not exists public.custom_questions (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind         text not null check (kind in ('mc', 'pbq-match', 'pbq-order')),
  domain       smallint not null check (domain between 1 and 5),
  level        text not null default 'medium' check (level in ('easy', 'medium', 'hard')),
  data         jsonb not null check (pg_column_size(data) <= 24000),
  visibility   text not null default 'private' check (visibility in ('private', 'pending', 'public', 'rejected')),
  review_note  text check (char_length(review_note) <= 500),
  reviewed_by  uuid references auth.users (id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists custom_questions_owner on public.custom_questions (owner_id);
create index if not exists custom_questions_visibility on public.custom_questions (visibility);

-- Server-side shape validation, so a malformed question can never break the app for other users.
create or replace function public.validate_custom_question(k text, d jsonb)
returns void language plpgsql immutable set search_path = '' as $$
declare
  el jsonb; n int; opts jsonb;
begin
  if jsonb_typeof(d) <> 'object' then raise exception 'Question data must be an object'; end if;

  if k = 'mc' then
    if char_length(coalesce(d->>'q','')) not between 5 and 1500 then raise exception 'Question text must be 5–1500 characters'; end if;
    if jsonb_typeof(d->'o') <> 'array' then raise exception 'Options must be a list'; end if;
    n := jsonb_array_length(d->'o');
    if n not between 2 and 8 then raise exception 'Provide 2–8 options'; end if;
    for el in select * from jsonb_array_elements(d->'o') loop
      if jsonb_typeof(el) <> 'string' or char_length(el #>> '{}') not between 1 and 300 then raise exception 'Each option must be 1–300 characters'; end if;
    end loop;
    if jsonb_typeof(d->'a') = 'number' then
      if (d->>'a')::int not between 0 and n - 1 then raise exception 'Correct answer index out of range'; end if;
    elsif jsonb_typeof(d->'a') = 'array' then
      if jsonb_array_length(d->'a') not between 2 and n - 1 then raise exception 'Choose-N questions need 2+ correct answers and at least one wrong one'; end if;
      for el in select * from jsonb_array_elements(d->'a') loop
        if jsonb_typeof(el) <> 'number' or (el #>> '{}')::int not between 0 and n - 1 then raise exception 'Correct answer index out of range'; end if;
      end loop;
    else raise exception 'Mark the correct answer'; end if;
    if char_length(coalesce(d->>'e','')) not between 1 and 2000 then raise exception 'Explanation must be 1–2000 characters'; end if;

  elsif k in ('pbq-match', 'pbq-order') then
    if char_length(coalesce(d->>'title','')) not between 3 and 120 then raise exception 'Title must be 3–120 characters'; end if;
    if char_length(coalesce(d->>'scenario','')) not between 1 and 4000 then raise exception 'Scenario must be 1–4000 characters'; end if;
    if char_length(coalesce(d->>'log','')) > 6000 then raise exception 'Log/exhibit is limited to 6000 characters'; end if;
    if char_length(coalesce(d->>'task','')) not between 1 and 300 then raise exception 'Task must be 1–300 characters'; end if;
    if char_length(coalesce(d->>'explain','')) not between 1 and 1000 then raise exception 'Key takeaway must be 1–1000 characters'; end if;
    if k = 'pbq-match' then
      opts := d->'options';
      if jsonb_typeof(opts) <> 'array' or jsonb_array_length(opts) not between 2 and 20 then raise exception 'Provide 2–20 answer options'; end if;
      for el in select * from jsonb_array_elements(opts) loop
        if jsonb_typeof(el) <> 'string' or char_length(el #>> '{}') not between 1 and 200 then raise exception 'Each answer option must be 1–200 characters'; end if;
      end loop;
      if jsonb_typeof(d->'rows') <> 'array' or jsonb_array_length(d->'rows') not between 2 and 15 then raise exception 'Provide 2–15 items'; end if;
      for el in select * from jsonb_array_elements(d->'rows') loop
        if char_length(coalesce(el->>'l','')) not between 1 and 300 then raise exception 'Each item needs a label (≤300 characters)'; end if;
        if not (opts ? (el->>'a')) then raise exception 'Each item''s answer must be one of the options'; end if;
        if char_length(coalesce(el->>'w','')) > 600 then raise exception 'Item explanations are limited to 600 characters'; end if;
      end loop;
    else
      if jsonb_typeof(d->'items') <> 'array' or jsonb_array_length(d->'items') not between 3 and 10 then raise exception 'Provide 3–10 steps'; end if;
      for el in select * from jsonb_array_elements(d->'items') loop
        if jsonb_typeof(el) <> 'string' or char_length(el #>> '{}') not between 1 and 300 then raise exception 'Each step must be 1–300 characters'; end if;
      end loop;
    end if;
  else
    raise exception 'Unknown question type';
  end if;
end; $$;

-- Guard: authors can keep things private or submit for review; only admins publish/reject.
create or replace function public.custom_questions_guard()
returns trigger language plpgsql set search_path = '' as $$
declare admin boolean := public.is_admin();
begin
  perform public.validate_custom_question(new.kind, new.data);
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.owner_id := coalesce(new.owner_id, (select auth.uid()));
    if not admin then
      if new.owner_id is distinct from (select auth.uid()) then raise exception 'You can only create your own questions' using errcode = '42501'; end if;
      if new.visibility not in ('private', 'pending') then raise exception 'New questions must be private or submitted for review' using errcode = '42501'; end if;
      new.review_note := null; new.reviewed_by := null; new.reviewed_at := null;
    end if;
    return new;
  end if;

  -- UPDATE
  if new.owner_id is distinct from old.owner_id then raise exception 'Owner cannot be changed' using errcode = '42501'; end if;
  new.created_at := old.created_at;
  if admin then
    if new.visibility in ('public', 'rejected') and new.visibility is distinct from old.visibility then
      new.reviewed_by := (select auth.uid()); new.reviewed_at := now();
    end if;
    return new;
  end if;

  -- non-admin author
  new.review_note := old.review_note; new.reviewed_by := old.reviewed_by; new.reviewed_at := old.reviewed_at;
  if new.visibility in ('public', 'rejected') then
    if new.visibility = old.visibility
       and new.data = old.data and new.kind = old.kind and new.domain = old.domain and new.level = old.level then
      return new;                                   -- no content change
    elsif new.visibility = old.visibility then
      new.visibility := 'pending';                  -- edited content goes back to review
    else
      raise exception 'Only admins can publish or reject questions' using errcode = '42501';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists custom_questions_guard on public.custom_questions;
create trigger custom_questions_guard before insert or update on public.custom_questions
  for each row execute function public.custom_questions_guard();

alter table public.custom_questions enable row level security;

drop policy if exists "cq_select" on public.custom_questions;
drop policy if exists "cq_insert" on public.custom_questions;
drop policy if exists "cq_update" on public.custom_questions;
drop policy if exists "cq_delete" on public.custom_questions;
create policy "cq_select" on public.custom_questions for select to authenticated
  using (owner_id = (select auth.uid()) or visibility = 'public' or public.is_admin());
create policy "cq_insert" on public.custom_questions for insert to authenticated
  with check (owner_id = (select auth.uid()) or public.is_admin());
create policy "cq_update" on public.custom_questions for update to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin())
  with check (owner_id = (select auth.uid()) or public.is_admin());
create policy "cq_delete" on public.custom_questions for delete to authenticated
  using (owner_id = (select auth.uid()) or public.is_admin());

-- Author display names for public questions (no emails exposed)
create or replace function public.question_authors(ids uuid[])
returns table (id uuid, display_name text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name from public.profiles p where p.id = any(ids)
    and exists (select 1 from public.custom_questions c where c.owner_id = p.id and c.visibility = 'public');
$$;
revoke execute on function public.question_authors(uuid[]) from public, anon;
grant  execute on function public.question_authors(uuid[]) to authenticated;
