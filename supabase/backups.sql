-- Prapti nightly backups: one-time setup. Paste into Supabase > SQL Editor > New query > Run.
-- Creates a private storage bucket. The reminder function writes a full backup into it once a night.
-- Only Tilak's and Chhaya's accounts can read the backups; nobody can change or delete them from the app.
insert into storage.buckets (id, name, public) values ('backups', 'backups', false)
  on conflict (id) do nothing;
drop policy if exists "backups read" on storage.objects;
create policy "backups read" on storage.objects for select to authenticated
  using (bucket_id = 'backups' and public.is_allowed(false));
select 'Prapti backups ready' as result;
