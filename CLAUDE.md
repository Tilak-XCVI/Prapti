# Prapti: guide for Claude

Prapti is a private daily-companion web app (PWA) for one person, Chhaya. It supports her wellbeing (depression, anxiety, rTMS treatment, sleep), BAPS satsang and her job search. Two people own and update it: Chhaya and Tilak. Both are non-technical: explain things simply, ask before anything risky, and keep replies short.

## How it is built
- **Source lives in `src/`.** Never hand-edit `index.html` or `beta/index.html`: they are generated.
  - `src/js/app1.js` ... `app10.js`: the app code. They are joined into one script in this order: app1, app2, app3, app4, app6, app7, app8, app5, app9, app10. Because it is one script, a later `function x()` or `A.x = ...` / `V.x = ...` overrides an earlier one. Search all files before changing something.
  - `src/content.json`: thoughts, calm audio, the 178 teachings, themes, murti images.
  - `src/shell-head.html` (all CSS and page shell), `src/shell-tail.html`, `src/sw.js` (service worker).
- **Build:** `python3 build.py` builds the TEST version into `beta/`. `python3 build.py stable` builds the LIVE version into the repo root.
- Hosting is GitHub Pages: live https://tilak-xcvi.github.io/Prapti/ and test https://tilak-xcvi.github.io/Prapti/beta/. Pushing to `main` publishes within a minute or two.
- Images (`m/`), audio, icons and `vendor/` (supabase-js, jsPDF) sit at the root and are shared by both versions.

## The update routine (always follow it)
1. Make the change in `src/`, run `python3 build.py` (test only), commit and push.
2. Tell the owner to check the test version on their phone.
3. Only when they say **"release"**: run `python3 build.py stable`, commit and push. For user-facing changes, add a line to `CHANGELOG` at the top of `src/js/app10.js`, bump `APP_VERSION`, and set that version's `date` at release. Leave owner/admin-only changes out of the changelog.
4. Check syntax before pushing, e.g. `node --check src/js/appN.js` for each edited file. Beware: many lines are long one-liners, so a `//` comment added mid-line comments out the rest of the line.

## Data (Supabase)
- Project `https://pfltodlzcflxqgniznag.supabase.co`. The browser uses the publishable key only (safe to be public).
- Table `docs` (id, col, data jsonb): one row per day (`days/YYYY-MM-DD`), weekly check-ins (`weekly/...`), journal, smruti, notes, feedback, settings (`app/settings`) etc. Row-level security: only the two allowed accounts can read. Tilak's account writes only to `sandbox`, `notes`, `feedback`, `logs`; his own testing lives in `sandbox/...` rows.
- `supabase/functions/notify/index.ts`: runs every 5 minutes (pg_cron). Sends reminders, notes and alerts, and saves a nightly full backup to the private storage bucket `backups`. After editing it, the owner must redeploy it in the Supabase dashboard (Edge Functions).
- SQL setup files are in `supabase/`. `reset.sql` WIPES ALL DATA: never run it or suggest it.

## Hard rules
- **Never delete, reset or overwrite her data.** Any change to how data is stored must keep reading old records.
- **Never ask for, handle or commit secrets**: passwords, the Supabase secret/service-role key, the VAPID private key, the cron key. This repository is public.
- The app day runs 4am to 4am (`appDay()`), so late nights belong to the day before.
- Every check-in is kept (`day.checkins` is a list); "latest" = last item.
- Teachings: append new ones to the end of `teachings` in `src/content.json` (ids must be unique). Never reorder or remove: reading history is keyed by position for the first 20 and by `id` after that. Write in your own words, quotes 15 words max, with source; avoid fasting/food/body-focused content and guilt-based framing.

## Voice and design
- British English. No em dashes. Warm, plain, never preachy. Always "Maharaj & Swami" and "Jay Swaminarayan".
- Calm, premium look: Instrument Serif headings, Figtree text, saffron (#C4550F) accents, cream background, full dark mode. Check new screens in light and dark mode at phone width (390px).
- Health content: supportive, never diagnostic. The weekly check-in uses PHQ-9 and GAD-2; a non-zero answer to the last PHQ-9 question shows her support options.
