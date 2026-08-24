# Baseline setup

1. Create a Supabase project
2. Run `database-setup.sql` in the SQL editor (or `database-migration.sql` if upgrading)
3. Copy `env.example` to `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` when you want cloud sync
4. `npm install && npm run web`

Without Supabase env vars, the app runs in **demo mode**: focuses, scores, weekly check-ins, and drawings persist in the browser via local storage. A banner at the top explains that Supabase setup is needed to claim a synced notebook.

Vercel: `vercel.json` runs `expo export -p web` and serves `dist/` (a real `index.html`). Without that, the Git deploy served the repo root and browsers downloaded `index.ts`.

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` on the Vercel project when you are ready for production auth and sync.

Auth is email/password. The claim screen is intentionally quiet — claiming the notebook is ownership, not onboarding theater.

Drawing strokes save to `page_drawings` per page key (`home`, `focus:<id>`).
