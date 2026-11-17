create table if not exists public.portfolio_content (
  id text primary key default 'main' check (id = 'main'),
  data jsonb not null check (jsonb_typeof(data) = 'object'),
  updated_at timestamptz not null default now()
);

alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from anon, authenticated;
grant all on public.portfolio_content to service_role;

create table if not exists public.portfolio_admin_login_attempts (
  client_key text primary key,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.portfolio_admin_login_attempts enable row level security;
revoke all on public.portfolio_admin_login_attempts from anon, authenticated;
grant all on public.portfolio_admin_login_attempts to service_role;

create or replace function public.check_portfolio_admin_login_rate_limit(
  p_client_key text,
  p_record_failure boolean default false
)
returns table(allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempts public.portfolio_admin_login_attempts%rowtype;
  v_now timestamptz := now();
begin
  if p_client_key is null or length(p_client_key) < 16 then
    raise exception 'Invalid client key';
  end if;

  insert into public.portfolio_admin_login_attempts(client_key)
  values (p_client_key)
  on conflict (client_key) do nothing;

  select * into v_attempts
  from public.portfolio_admin_login_attempts
  where client_key = p_client_key
  for update;

  if v_attempts.locked_until is not null and v_attempts.locked_until > v_now then
    return query select false, greatest(1, ceil(extract(epoch from (v_attempts.locked_until - v_now)))::integer);
    return;
  end if;

  if p_record_failure then
    if v_attempts.window_started_at <= v_now - interval '15 minutes' then
      update public.portfolio_admin_login_attempts
      set attempt_count = 1, window_started_at = v_now, locked_until = null, updated_at = v_now
      where client_key = p_client_key;
      return query select true, 0;
      return;
    end if;

    update public.portfolio_admin_login_attempts
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

revoke all on function public.check_portfolio_admin_login_rate_limit(text, boolean) from public, anon, authenticated;
grant execute on function public.check_portfolio_admin_login_rate_limit(text, boolean) to service_role;

create or replace function public.reset_portfolio_admin_login_rate_limit(p_client_key text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.portfolio_admin_login_attempts where client_key = p_client_key;
$$;

revoke all on function public.reset_portfolio_admin_login_rate_limit(text) from public, anon, authenticated;
grant execute on function public.reset_portfolio_admin_login_rate_limit(text) to service_role;

notify pgrst, 'reload schema';
