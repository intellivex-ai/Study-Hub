-- ============================================================
-- Study Hub — Supabase Schema Migration 001
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
-- Extends auth.users. Auto-created via trigger on signup.
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text not null default 'Scholar',
  streak          int  not null default 0,
  focus_score     int  not null default 0,
  total_xp        int  not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: owner write"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow leaderboard reads (all authenticated users)
create policy "profiles: leaderboard read"
  on public.profiles for select
  to authenticated
  using (true);

-- ─── SESSIONS ────────────────────────────────────────────────
-- One row per focus timer run. Status: running | paused | completed | abandoned
create table if not exists public.sessions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  start_time  timestamptz not null default now(),
  end_time    timestamptz,
  duration    int,           -- seconds of actual focus (pauses excluded)
  paused_at   timestamptz,   -- last pause timestamp for resumption math
  mode        text not null default 'pomodoro' check (mode in ('pomodoro','deep_focus')),
  task_title  text,
  status      text not null default 'running' check (status in ('running','paused','completed','abandoned')),
  created_at  timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "sessions: owner all"
  on public.sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index sessions_user_id_idx on public.sessions(user_id);
create index sessions_status_idx  on public.sessions(status);
create index sessions_created_at_idx on public.sessions(created_at desc);

-- ─── ANALYTICS ───────────────────────────────────────────────
-- One row per user per calendar day. Upserted by trigger.
create table if not exists public.analytics (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  date              date not null default current_date,
  total_focus_time  int  not null default 0,  -- seconds
  total_sessions    int  not null default 0,
  created_at        timestamptz not null default now(),
  unique(user_id, date)
);

alter table public.analytics enable row level security;

create policy "analytics: owner all"
  on public.analytics for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index analytics_user_date_idx on public.analytics(user_id, date desc);

-- ─── TASKS ───────────────────────────────────────────────────
-- Scheduler tasks. Each belongs to a user.
create table if not exists public.tasks (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  subject         text not null default 'General',
  scheduled_time  text,        -- "9:00 AM" — display string
  duration        text,        -- "60m" — display string
  priority        text not null default 'medium' check (priority in ('high','medium','low')),
  done            boolean not null default false,
  created_at      timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "tasks: owner all"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index tasks_user_id_idx on public.tasks(user_id);

-- ─── SETTINGS ────────────────────────────────────────────────
-- One row per user. Upserted on change.
create table if not exists public.settings (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  pomodoro_length     int     not null default 25,
  break_length        int     not null default 5,
  focus_goal          int     not null default 14400,  -- seconds (4 hours)
  auto_break          boolean not null default true,
  sound_enabled       boolean not null default true,
  notifications       boolean not null default true,
  theme               text    not null default 'dark',
  blocked_sites       jsonb   not null default '["instagram.com","twitter.com","reddit.com"]'::jsonb,
  updated_at          timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings: owner all"
  on public.settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- ─── 1. Auto-create profile on signup ─────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );

  insert into public.settings (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 2. Aggregate analytics on session completion ──────────
create or replace function public.aggregate_analytics()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  session_date date;
  session_duration int;
begin
  -- Only act on transitions TO completed
  if new.status = 'completed' and (old.status is null or old.status <> 'completed') then
    session_date := (new.start_time at time zone 'UTC')::date;
    session_duration := coalesce(new.duration, 0);

    insert into public.analytics (user_id, date, total_focus_time, total_sessions)
    values (new.user_id, session_date, session_duration, 1)
    on conflict (user_id, date)
    do update set
      total_focus_time = analytics.total_focus_time + session_duration,
      total_sessions   = analytics.total_sessions + 1;

    -- Update profile focus_score (% of daily goal)
    update public.profiles p
    set focus_score = least(100, (
      select cast(round(a.total_focus_time::numeric / s.focus_goal * 100) as int)
      from public.analytics a
      join public.settings s on s.user_id = a.user_id
      where a.user_id = new.user_id
        and a.date = session_date
    ))
    where p.id = new.user_id;

    -- Update XP: 10 XP per minute of focus
    update public.profiles
    set total_xp = total_xp + greatest(0, session_duration / 6)
    where id = new.user_id;

  end if;
  return new;
end;
$$;

drop trigger if exists on_session_completed on public.sessions;
create trigger on_session_completed
  after insert or update on public.sessions
  for each row execute procedure public.aggregate_analytics();

-- ─── 3. Update streak on daily completion ──────────────────
create or replace function public.update_streak()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  last_active date;
  today date := current_date;
begin
  if new.total_sessions = 1 and old.total_sessions = 0 then
    -- First session of today — check if yesterday had data
    select date into last_active
    from public.analytics
    where user_id = new.user_id
      and date = today - interval '1 day'
    limit 1;

    if last_active is not null then
      -- Consecutive day: increment streak
      update public.profiles set streak = streak + 1 where id = new.user_id;
    elsif not exists (
      select 1 from public.analytics
      where user_id = new.user_id and date < today
    ) then
      -- Very first day ever: start streak at 1
      update public.profiles set streak = 1 where id = new.user_id;
    else
      -- Broke streak: reset to 1
      update public.profiles set streak = 1 where id = new.user_id;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_analytics_updated on public.analytics;
create trigger on_analytics_updated
  after insert or update on public.analytics
  for each row execute procedure public.update_streak();

-- ─── 4. Helper: get weekly analytics for a user ────────────
create or replace function public.get_weekly_analytics(p_user_id uuid)
returns table(day text, total_focus_time int, total_sessions int)
language sql
security definer
as $$
  select
    to_char(d.date, 'DY') as day,
    coalesce(a.total_focus_time, 0)::int as total_focus_time,
    coalesce(a.total_sessions, 0)::int as total_sessions
  from generate_series(
    current_date - interval '6 days',
    current_date,
    interval '1 day'
  ) as d(date)
  left join public.analytics a
    on a.date = d.date::date and a.user_id = p_user_id
  order by d.date asc;
$$;

-- ─── 5. Leaderboard view ───────────────────────────────────
create or replace view public.leaderboard as
select
  p.id,
  p.name,
  p.total_xp,
  p.streak,
  p.focus_score,
  row_number() over (order by p.total_xp desc) as rank
from public.profiles p
order by p.total_xp desc;
