-- Prapti push reminders: one-time setup. Replace CRON_KEY_HERE with the key Tilak was given, then Run.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- phones that have turned reminders on
create table if not exists public.push_subs (
  endpoint text primary key,
  email text not null,
  sub jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "own subs read" on public.push_subs;
drop policy if exists "own subs write" on public.push_subs;
drop policy if exists "own subs update" on public.push_subs;
drop policy if exists "own subs delete" on public.push_subs;
create policy "own subs read"   on public.push_subs for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "own subs write"  on public.push_subs for insert to authenticated with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and public.is_allowed(false));
create policy "own subs update" on public.push_subs for update to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))) with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
create policy "own subs delete" on public.push_subs for delete to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- so each reminder is sent once a day (only the server function uses this)
create table if not exists public.notif_log (key text primary key, sent_at timestamptz not null default now());
alter table public.notif_log enable row level security;

-- run the reminder function every 5 minutes
select cron.unschedule('prapti-notify') where exists (select 1 from cron.job where jobname = 'prapti-notify');
select cron.schedule('prapti-notify', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://pfltodlzcflxqgniznag.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-key', 'CRON_KEY_HERE'),
    body := '{}'::jsonb
  );
$$);

select 'Prapti reminders scheduled' as result;
