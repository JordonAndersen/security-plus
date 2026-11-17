# Deploying Security+ Practice Lab (Netlify + Supabase, free tiers)

The site is static (HTML/JS in `web/`). Supabase provides sign-in and synced progress. Without Supabase settings, the site still works and saves progress in the browser only.

```
web/                      ← Netlify publishes this folder
  index.html              app shell + engine
  app/cloud.js            auth, profile, sync, answer logging
  config.js               GENERATED at build from env vars (git-ignored)
  questions/ mcq/ ref/ crash/   content (plain JS data files)
supabase/migrations/0001_init.sql   database schema + Row Level Security
tools/write-config.js     build step: env vars → web/config.js
tools/validate.js         content checks (also runs during the Netlify build)
netlify.toml              build settings + security headers
```

## 1. Supabase (≈10 minutes)

1. Create a project at supabase.com (free plan). Pick a region near you and save the database password in your password manager.
2. **SQL Editor → New query** → paste all of `supabase/migrations/0001_init.sql` → **Run**. Then do the same with `0002_roles_custom_questions.sql`, `0003_lock_trigger_functions.sql` and `0004_fix_validate_grant.sql`, in that order. Together they create the tables, Row Level Security policies, roles, the custom-question review workflow and the admin functions.
3. **Authentication → Sign In / Providers → Email:** keep Email enabled with **Confirm email** on. Set the minimum password length to 12 if the option is offered.
4. **Authentication → URL Configuration:**
   - **Site URL:** `https://<your-site>.netlify.app` (set this after step 2 of Netlify, then come back)
   - **Redirect URLs:** add `https://<your-site>.netlify.app/**` and `http://localhost:8765/**` (for local testing)
5. **Project Settings → API:** copy the **Project URL** and the **anon / publishable** key.
   - ⚠️ Never use the `service_role` / secret key in the site. The build refuses it.

The free plan pauses a project after about a week with no activity. Opening the site regularly keeps it awake, and you can restore it from the dashboard if it does pause.

## 2. Netlify (≈5 minutes)

1. Push this repo to GitHub (private is fine).
2. Netlify → **Add new site → Import an existing project** → pick the repo. Netlify reads `netlify.toml`, so the build command and the publish folder (`web`) are already set.
3. **Site configuration → Environment variables:**
   - `SUPABASE_URL` = your Project URL
   - `SUPABASE_ANON_KEY` = your anon/publishable key
   - optional `ALLOW_GUEST` = `false` hides "Continue without an account", so everyone must sign in (default: guests allowed)
   - Leave **"Contains secret values"** unchecked. These values are public by design and appear in the built site, so Netlify's secret scanning would otherwise flag your own build.
4. **Deploys → Trigger deploy.** The build log should say `config.js written for https://….supabase.co` and `All questions valid.`
5. Optionally rename the site (Site configuration → Site details → Change site name), then put that URL into Supabase's Site URL and Redirect URLs (step 1.4).

## 3. First sign-in and making yourself admin

The **sign-in page is the first screen**. Visitors can sign in, create an account, get a one-time email link, reset a password, or (unless `ALLOW_GUEST=false`) continue as a guest with browser-only progress. If a deploy is missing its Supabase settings (for example, a drag-and-drop deploy, which skips the build step), the site shows a yellow warning banner instead of a sign-in page.

1. Open the site → **Sign in → Create an account** → confirm the email → sign in. Any progress already in that browser is uploaded to your account.
2. Back in Supabase **SQL Editor**, run (with your email):
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
3. Reload the site and the **Admin** tab appears. From there you can promote or demote other users. The app won't let you demote the last admin.

**Who can sign up?** By default anyone with the link can create an account (as a `user`). For a private app, turn off **Authentication → Sign In / Providers → Allow new users to sign up** and invite people from **Authentication → Users → Invite user** instead.

## Roles

| Role | Can do |
|---|---|
| `user` | Study, sync progress, write their own questions (private), submit questions for sharing |
| `admin` | Everything a user can do, plus review/approve/reject submitted questions, unpublish shared questions, see all users with activity stats, change roles |

Roles are enforced in the database (RLS + column privileges + `security definer` functions), not just hidden in the UI. A user can't change their own role, publish their own question, or read anyone else's data, even by calling the API directly.

## User-created questions

- **My questions** tab: build multiple-choice (including "choose two"), matching PBQs (with an optional log/command-output exhibit) and ordering PBQs. Preview with answers before saving.
- New questions are **private**: they appear only in the author's own bank, tagged *Custom*.
- **Submit for sharing** puts a question in the admin **Review queue**. Approved questions become **public** and appear for every signed-in user. Admins can also send a question back with a note ("Changes requested").
- If an author edits a public question, it goes back to the review queue automatically.
- Everything is validated twice (in the browser and by the database). User text is always escaped, so nobody can inject HTML or scripts.

## Database tests

`tests/db` runs both migrations in embedded Postgres (PGlite) and checks the security rules (35 checks: isolation between users, no self-promotion, no self-publishing, admin workflows, validation):

```bash
cd tests/db && npm install && npm test
```

## Local development

```bash
cp web/config.example.js web/config.js     # fill in URL + anon key (or leave empty for local-only)
python3 -m http.server 8765 --directory web
node tools/validate.js
```

## How sync works

- Each piece of app state (question stats, PBQ results, exam history, flashcard mastery, crash-course progress, preferences, exam date) is one row in `user_state`. The newer timestamp wins per key.
- Every answered question is appended to `question_attempts`, and each practice exam to `exam_attempts`. Answers are queued in the browser while offline and uploaded after sign-in.
- Coming back to a tab pulls changes from your other devices. If a practice exam is in progress, you get a "Reload now" prompt instead of an automatic reload.
- **Export / Import progress** (Account menu) is a JSON backup that works with or without an account.

## Useful queries (Supabase SQL Editor)

```sql
-- Weakest domains over all practice
select * from my_domain_stats order by accuracy;            -- run as your user via the API, or:
select domain, kind, count(*), avg(coalesce(score, correct::int)) from question_attempts
where user_id = '<your-user-id>' group by 1,2 order by 4;

-- Questions you miss most
select question_id, count(*) attempts, avg(correct::int) acc from question_attempts
where user_id = '<your-user-id>' group by 1 having count(*) >= 2 order by acc, attempts desc limit 30;

-- Practice exam trend
select taken_at::date, score, length, difficulty from exam_attempts where user_id = '<your-user-id>' order by taken_at;
```

## Security notes

- RLS is enabled on every table. Policies only allow `auth.uid() = user_id`, so the anon key alone can't read anyone's data.
- PKCE auth flow; sessions are stored by supabase-js in browser storage.
- `netlify.toml` sets CSP (scripts only from self and jsDelivr; network only to `*.supabase.co`), HSTS, frame-ancestors none, nosniff, and a strict referrer policy.
- `'unsafe-inline'` is needed for scripts because the app ships its engine inline. Moving it into `app/*.js` later would let you drop that.
