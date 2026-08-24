/**
 * Baseline — personal self-rating notebook
 *
 * Web now (Expo), portable to iOS later.
 */

# Baseline

A quiet notebook for the things you’re actually trying to master.

You define the focuses. You define the attributes. You rate yourself — and you see those scores every time you open the page. Each week you check in again: nudge with +/− for small shifts, or type a new number when you’ve moved a lot.

No task engine. No streaks chasing you. Just your own baseline, kept honest.

## What it is

- **Focuses** — main objectives (e.g. Tennis mastery)
- **Attributes** — the pieces that make it up (forehand, backhand, slice, serve…)
- **Scores on the home page** — always visible, always yours
- **Weekly check-in** — absolute score *or* incremental +/−
- **Draw layer** — a laminated sheet over the page; sketch, underline, scribble; toggle Draw when you want ink on top

## Stack

- Expo + React Native (web today, iOS/Android via EAS later)
- TypeScript
- Supabase Auth + Postgres (RLS) — account required, presented as *claiming* your notebook
- TanStack Query
- react-native-svg for the draw overlay

## Setup

1. Copy `env.example` → `.env` and add your Supabase URL + anon key (optional for local demo)
2. Run [`database-setup.sql`](database-setup.sql) (or [`database-migration.sql`](database-migration.sql) if upgrading) when you want cloud sync
3. Install & run:

```bash
npm install
npm run web
```

**Without Supabase:** the app opens in demo mode — full notebook on this device/browser, with a banner explaining that Supabase is needed to claim and sync a notebook.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run web` | Website (dev) |
| `npm run build` | Static web export for Vercel (`dist/`) |
| `npm run ios` / `android` | Native |
| `npm run type-check` | TypeScript |
| `npm test` | Jest |

## Design notes

Cool paper, graphite ink, deep teal accent. Literata + DM Sans. The draw overlay only captures gestures when Draw is on, so the notebook underneath stays usable.
