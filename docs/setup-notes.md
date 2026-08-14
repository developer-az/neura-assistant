# Baseline setup

1. Create a Supabase project
2. Run `database-setup.sql` in the SQL editor (or `database-migration.sql` if upgrading)
3. Copy `env.example` to `.env` and fill `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. `npm install && npm run web`

Auth is email/password. The claim screen is intentionally quiet — claiming the notebook is ownership, not onboarding theater.

Drawing strokes save to `page_drawings` per page key (`home`, `focus:<id>`).
