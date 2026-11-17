create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.sprints (
  id text primary key,
  title text not null,
  start_date date not null,
  end_date date not null,
  timezone text not null,
  daily_target_minutes integer not null check (daily_target_minutes between 1 and 1440),
  default_allocations jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sprint_dates_valid check (end_date >= start_date),
  constraint sprint_allocations_valid check (
    jsonb_typeof(default_allocations) = 'object'
    and default_allocations ?& array['backend', 'ai', 'dsa']
    and jsonb_typeof(default_allocations->'backend') = 'number'
    and jsonb_typeof(default_allocations->'ai') = 'number'
    and jsonb_typeof(default_allocations->'dsa') = 'number'
    and (default_allocations->>'backend')::integer >= 0
    and (default_allocations->>'ai')::integer >= 0
    and (default_allocations->>'dsa')::integer >= 0
  )
);

create table if not exists public.sprint_days (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  day_number smallint not null check (day_number between 1 and 15),
  day_date date not null,
  status text not null default 'planned' check (status in ('planned', 'completed', 'missed', 'leave')),
  is_leave boolean not null default false,
  target_minutes integer not null default 240 check (target_minutes between 0 and 1440),
  allocations jsonb not null default '{"backend":120,"ai":72,"dsa":48}'::jsonb,
  notes text not null default '',
  completion_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sprint_id, day_number),
  unique (sprint_id, day_date),
  constraint day_allocations_valid check (
    jsonb_typeof(allocations) = 'object'
    and allocations ?& array['backend', 'ai', 'dsa']
    and jsonb_typeof(allocations->'backend') = 'number'
    and jsonb_typeof(allocations->'ai') = 'number'
    and jsonb_typeof(allocations->'dsa') = 'number'
    and (allocations->>'backend')::integer >= 0
    and (allocations->>'ai')::integer >= 0
    and (allocations->>'dsa')::integer >= 0
  )
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  day_id uuid not null references public.sprint_days(id) on delete cascade,
  track text not null check (track in ('backend', 'ai', 'dsa')),
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '',
  sort_order integer not null default 0,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completion_at timestamptz,
  original_scheduled_date date not null,
  scheduled_date date not null,
  rescheduled_from_date date,
  is_predefined boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_sprint_scheduled_idx on public.tasks(sprint_id, scheduled_date, sort_order);
create index if not exists tasks_day_track_idx on public.tasks(day_id, track, sort_order);
create unique index if not exists tasks_day_track_title_unique on public.tasks(day_id, track, title);
create unique index if not exists tasks_sprint_track_original_title_unique
  on public.tasks(sprint_id, track, original_scheduled_date, title);

create table if not exists public.task_reschedules (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_date date not null,
  to_date date not null,
  reason text not null default '',
  created_at timestamptz not null default now(),
  constraint reschedule_dates_differ check (from_date <> to_date)
);

create index if not exists task_reschedules_task_created_idx on public.task_reschedules(task_id, created_at);

create or replace function public.record_task_reschedule()
returns trigger
language plpgsql
as $$
begin
  if new.scheduled_date is distinct from old.scheduled_date then
    insert into public.task_reschedules(task_id, from_date, to_date)
    values (new.id, old.scheduled_date, new.scheduled_date);
    new.rescheduled_from_date = old.scheduled_date;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_record_reschedule on public.tasks;
create trigger tasks_record_reschedule
before update of scheduled_date on public.tasks
for each row execute function public.record_task_reschedule();

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  study_date date not null,
  track text not null check (track in ('backend', 'ai', 'dsa')),
  focused_minutes integer not null check (focused_minutes between 1 and 1440),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_sessions_sprint_date_track_idx on public.study_sessions(sprint_id, study_date, track);

create table if not exists public.engineering_work (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  work_date date not null,
  project_name text not null check (length(trim(project_name)) between 1 and 160),
  title text not null check (length(trim(title)) between 1 and 200),
  description text not null default '',
  implementation text not null default '',
  technologies text[] not null default '{}',
  bugs text not null default '',
  experiments text not null default '',
  learning_outcomes text not null default '',
  minutes_spent integer not null default 0 check (minutes_spent between 0 and 1440),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists engineering_work_sprint_date_idx on public.engineering_work(sprint_id, work_date);
create index if not exists engineering_work_project_idx on public.engineering_work(sprint_id, project_name);

create table if not exists public.daily_reflections (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  reflection_date date not null,
  learned text not null default '',
  clear_topics text not null default '',
  difficult_topics text not null default '',
  revisit text not null default '',
  tomorrow_focus text not null default '',
  remarks text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sprint_id, reflection_date)
);

create table if not exists public.recovery_events (
  id uuid primary key default gen_random_uuid(),
  sprint_id text not null references public.sprints(id) on delete cascade,
  missed_date date not null,
  reason text not null default '',
  recovery_date date,
  reviewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (sprint_id, missed_date)
);

create table if not exists public.sprint_pin_attempts (
  client_key text primary key,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

create or replace function public.check_sprint_pin_rate_limit(p_client_key text, p_record_failure boolean default false)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_attempts public.sprint_pin_attempts%rowtype;
  v_now timestamptz := now();
begin
  if p_client_key is null or length(p_client_key) < 16 then
    raise exception 'Invalid client key';
  end if;

  insert into public.sprint_pin_attempts(client_key)
  values (p_client_key)
  on conflict (client_key) do nothing;

  select * into v_attempts
  from public.sprint_pin_attempts
  where client_key = p_client_key
  for update;

  if v_attempts.locked_until is not null and v_attempts.locked_until > v_now then
    return query select false, greatest(1, ceil(extract(epoch from (v_attempts.locked_until - v_now)))::integer);
    return;
  end if;

  if p_record_failure then
    if v_attempts.window_started_at <= v_now - interval '15 minutes' then
      update public.sprint_pin_attempts
      set attempt_count = 1, window_started_at = v_now, locked_until = null, updated_at = v_now
      where client_key = p_client_key;
      return query select true, 0;
      return;
    end if;

    update public.sprint_pin_attempts
    set attempt_count = attempt_count + 1,
        locked_until = case when attempt_count + 1 >= 5 then v_now + interval '15 minutes' else null end,
        updated_at = v_now
    where client_key = p_client_key
    returning * into v_attempts;

    if v_attempts.locked_until is not null then
      return query select false, 900;
      return;
    end if;
  end if;

  return query select true, 0;
end;
$$;

revoke all on function public.check_sprint_pin_rate_limit(text, boolean) from public, anon, authenticated;
grant execute on function public.check_sprint_pin_rate_limit(text, boolean) to service_role;

create or replace function public.reset_sprint_pin_rate_limit(p_client_key text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  delete from public.sprint_pin_attempts where client_key = p_client_key;
$$;

revoke all on function public.reset_sprint_pin_rate_limit(text) from public, anon, authenticated;
grant execute on function public.reset_sprint_pin_rate_limit(text) to service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'sprints', 'sprint_days', 'tasks', 'task_reschedules',
    'study_sessions', 'engineering_work', 'daily_reflections',
    'recovery_events', 'sprint_pin_attempts'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "No direct client access" on public.%I', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant all on public.%I to service_role', table_name);
  end loop;
end;
$$;

drop trigger if exists sprints_updated_at on public.sprints;
create trigger sprints_updated_at before update on public.sprints for each row execute function public.set_updated_at();
drop trigger if exists sprint_days_updated_at on public.sprint_days;
create trigger sprint_days_updated_at before update on public.sprint_days for each row execute function public.set_updated_at();
drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists study_sessions_updated_at on public.study_sessions;
create trigger study_sessions_updated_at before update on public.study_sessions for each row execute function public.set_updated_at();
drop trigger if exists engineering_work_updated_at on public.engineering_work;
create trigger engineering_work_updated_at before update on public.engineering_work for each row execute function public.set_updated_at();
drop trigger if exists daily_reflections_updated_at on public.daily_reflections;
create trigger daily_reflections_updated_at before update on public.daily_reflections for each row execute function public.set_updated_at();

notify pgrst, 'reload schema';
