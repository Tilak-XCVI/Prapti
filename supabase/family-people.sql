-- Prapti: add Mum and Dad (run once, and again whenever an email changes).
-- 1. Paste this into Supabase > SQL Editor > New query.
-- 2. Replace the two example emails with Mum's and Dad's real ones (keep the quote marks).
-- 3. Click Run. Don't save the real emails anywhere on GitHub: this project is public.
-- This only sets who Mum and Dad are. It doesn't touch any of Chhaya's entries.

insert into public.docs (id, col, data) values ('family/people', 'family', jsonb_build_object('people', jsonb_build_array(
  jsonb_build_object('name', 'Mum', 'email', lower(trim('mum@example.com'))),
  jsonb_build_object('name', 'Dad', 'email', lower(trim('dad@example.com')))
)))
on conflict (id) do update set data = excluded.data;

select 'Mum and Dad added: ' || string_agg(p ->> 'email', ', ') as result
from public.docs, jsonb_array_elements(data -> 'people') p where id = 'family/people';
