-- Prapti family view: one-time setup. Paste all of this into Supabase > SQL Editor > New query > Run.
-- It lets the people Chhaya adds in Me > Family read a short daily summary and get alerts on their phone.
-- It only adds access rules. It does not change or delete any of her data. Safe to run more than once.

-- Who is this signed-in person to Chhaya's Family settings?
--   'reader' = she is sharing with them now (or switched off less than 48 hours ago)
--   'member' = on her list, or covered by her safety lock, but not reading the summary right now
--   null     = not on her list
create or replace function public.family_role() returns text language sql stable security definer set search_path = public as $$
  with me as (select lower(coalesce(auth.jwt() ->> 'email', '')) as e),
       f  as (select coalesce(data -> 'family', '{}'::jsonb) as f from public.docs where id = 'app/settings')
  select case
    when (select e from me) = '' then null
    when exists (select 1 from f, jsonb_array_elements(coalesce(f.f -> 'people', '[]'::jsonb)) p
                 where coalesce((f.f ->> 'on')::boolean, false) and lower(p ->> 'email') = (select e from me)) then 'reader'
    when exists (select 1 from f, jsonb_array_elements(coalesce(f.f -> 'prev' -> 'people', '[]'::jsonb)) p
                 where coalesce((f.f -> 'prev' ->> 'on')::boolean, false)
                   and nullif(f.f ->> 'prevUntil', '')::timestamptz > now()
                   and lower(p ->> 'email') = (select e from me)) then 'reader'
    when exists (select 1 from f, jsonb_array_elements(coalesce(f.f -> 'people', '[]'::jsonb)) p
                 where lower(p ->> 'email') = (select e from me)) then 'member'
    when exists (select 1 from f, jsonb_array_elements_text(coalesce(f.f -> 'lockPeople', '[]'::jsonb)) x
                 where lower(x) = (select e from me)
                   and coalesce(f.f ->> 'lockUntil', '') >= to_char(now() at time zone 'Europe/London', 'YYYY-MM-DD')) then 'member'
    else null end;
$$;

-- They can read the summary (only while she shares it), the latest alert, and the messages she chose to send them. Nothing else.
drop policy if exists "family read" on public.docs;
create policy "family read" on public.docs for select to authenticated
  using ((id = 'family/status' and public.family_role() = 'reader')
      or (id in ('family/alert', 'family/messages') and public.family_role() is not null));

-- They can register their own phone for alerts.
drop policy if exists "family subs write" on public.push_subs;
create policy "family subs write" on public.push_subs for insert to authenticated
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')) and public.family_role() is not null);

select 'Prapti family view ready' as result;
