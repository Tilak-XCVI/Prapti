-- Prapti: one-time database setup. Paste all of this into Supabase > SQL Editor > New query > Run.

-- 1. Who may use the app (only these emails can read or write anything)
create table if not exists public.allowed_users (
  email text primary key,
  can_write boolean not null default true
);

-- 2. All app data, one row per document (settings, a day, a journal entry, a smruti...)
create table if not exists public.docs (
  id text primary key,                 -- e.g. 'app/settings', 'days/2026-09-28', 'journal/j123'
  col text not null,                   -- 'app', 'days', 'weekly', 'journal', 'smruti', 'mydarshan', 'notes', 'logs'
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);
create index if not exists docs_col_idx on public.docs (col);

-- 3. Every change is also kept in a history table, so nothing can ever be truly lost
create table if not exists public.doc_history (
  hid bigint generated always as identity primary key,
  id text not null,
  data jsonb not null,
  changed_at timestamptz not null default now(),
  changed_by text
);

create or replace function public.touch_doc() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.jwt() ->> 'email', new.updated_by);
  insert into public.doc_history (id, data, changed_by) values (new.id, new.data, new.updated_by);
  return new;
end $$;
drop trigger if exists docs_touch on public.docs;
create trigger docs_touch before insert or update on public.docs for each row execute function public.touch_doc();

-- 4. Security: row-level rules
create or replace function public.is_allowed(write boolean default false) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.allowed_users a
                 where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
                   and (not write or a.can_write));
$$;

alter table public.allowed_users enable row level security;
alter table public.docs enable row level security;
alter table public.doc_history enable row level security;

drop policy if exists "read docs" on public.docs;
drop policy if exists "insert docs" on public.docs;
drop policy if exists "update docs" on public.docs;
create policy "read docs"   on public.docs for select to authenticated using (public.is_allowed(false));
create policy "insert docs" on public.docs for insert to authenticated with check (public.is_allowed(true));
create policy "update docs" on public.docs for update to authenticated using (public.is_allowed(true)) with check (public.is_allowed(true));
-- no delete policy: rows can never be deleted from the app (entries are hidden, not removed)

drop policy if exists "read history" on public.doc_history;
create policy "read history" on public.doc_history for select to authenticated using (public.is_allowed(false));

drop policy if exists "read own allow" on public.allowed_users;
create policy "read own allow" on public.allowed_users for select to authenticated using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 5. Live sync between phones
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- 6. Private storage for photos and voice notes
insert into storage.buckets (id, name, public) values ('media', 'media', false)
on conflict (id) do nothing;

drop policy if exists "media read" on storage.objects;
drop policy if exists "media write" on storage.objects;
create policy "media read"  on storage.objects for select to authenticated using (bucket_id = 'media' and public.is_allowed(false));
create policy "media write" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_allowed(true));

-- 7. The two people allowed in.
insert into public.allowed_users (email, can_write) values
  ('chhayap18@gmail.com', true),
  ('tilak@parmrgroup.com', true)
on conflict (email) do update set can_write = excluded.can_write;

select 'Prapti setup complete' as result;
