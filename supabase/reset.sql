-- DO NOT RUN AGAIN: this wipes all of Chhaya's data. Kept only as a record of the original setup.
-- Prapti: fresh start before Chhaya begins, and make Tilak's account view-only in the database too.
-- Paste all of this into Supabase > SQL Editor > New query > Run. Safe to run once.

-- 1. Keep a copy of the test data, just in case (not visible to the app)
create table if not exists public.docs_backup_20260929 as select * from public.docs;
alter table public.docs_backup_20260929 enable row level security;

-- 2. Clear all test data and its history
delete from public.docs;
delete from public.doc_history;

-- 3. Tell every phone to throw away its saved copy the next time it opens
insert into public.docs (id, col, data) values ('app/meta', 'app', '{"epoch": 2}'::jsonb);

-- 4. Tilak's account: reads everything, but can only write his own test space ('sandbox'),
--    surprise notes, suggestions and error logs. It can never change Chhaya's data.
update public.allowed_users set can_write = true where lower(email) in ('OWNER_EMAIL_HERE', 'HER_EMAIL_HERE');

drop policy if exists "insert docs" on public.docs;
drop policy if exists "update docs" on public.docs;
create policy "insert docs" on public.docs for insert to authenticated
  with check (public.is_allowed(true) and (lower(coalesce(auth.jwt() ->> 'email', '')) <> 'OWNER_EMAIL_HERE' or col in ('sandbox', 'notes', 'feedback', 'logs')));
create policy "update docs" on public.docs for update to authenticated
  using (public.is_allowed(true) and (lower(coalesce(auth.jwt() ->> 'email', '')) <> 'OWNER_EMAIL_HERE' or col in ('sandbox', 'notes', 'feedback', 'logs')))
  with check (public.is_allowed(true) and (lower(coalesce(auth.jwt() ->> 'email', '')) <> 'OWNER_EMAIL_HERE' or col in ('sandbox', 'notes', 'feedback', 'logs')));

select 'Prapti reset complete' as result, (select count(*) from public.docs) as docs_left;
