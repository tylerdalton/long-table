# The Long Table 🦃

Our family's holiday table: who's coming, who's bringing what, and every year we've gathered. Built for Thanksgiving first, and it works for any gathering (Christmas, Easter, reunions).

## What's here (Phase 1)

- **This Year**: the gathering coming up, with date, countdown, host, place and directions.
  - **RSVPs**: one per household, with adult and kid counts and notes for allergies. Anyone can RSVP for someone else, like the grandparents.
  - **Headcount**: drawn as a long table with one plate per person, plus a count of maybes.
  - **Dish board**: new Thanksgivings start with the classic menu. Each dish shows "I'll bring it", or lets you sign someone else up. Open slots stand out.
  - **Split dishes**: one person buys a dish and another cooks it, like Melanie buying the turkey and Rope cooking it.
  - **By person**: a view of what everyone has signed up for, who hasn't signed up yet, and what still needs someone.
- **The Recipe Box**: a photo of the original handwritten card, the dish, who it's from, the story, ingredients and steps (one per line), and Family favorite or Family secret tags. You can search by ingredient and print a recipe.
  - A dish on any year's menu can link to its recipe ("＋ Recipe" or "📖 Recipe"). That gives each recipe an "On the table" history across the years.
- **Photos & art**: upload pictures from the day, or art (Rope's by default). You can filter by year or show only art.
- **Past Tables**: every gathering on a timeline.

Still to come: a richer Past Tables history, Rope's Gallery, a "download the family archive" export, and a way to fill in past years.

## The look

The colors and the mark come from Rope's pine-cone turkey:
- **Plum** from the crushed-petal neck (buttons and headings), **jay blue** from the painted head (focus rings), **wattle red**, **marigold** from the dried flowers in the tail, **moss** from the painted board, **seed-pod cream** and **pine-cone brown**. They're all in `app/globals.css`.
- `components/RopeTurkey.tsx` redraws the turkey as an SVG. It's the logo, the favicon and the home-screen icon, and it stands in the Thanksgiving hero.
- `public/rope/` holds cropped photos of the real piece: `turkey.jpg` on the sign-in page, and `board.jpg`, Rope's painted board, which the `.painted-board` strips use. These load without signing in, so the sign-in page can show them.
- `.pod-rule` draws a row of beaded seed pods, like the ones along the tail fan.

## Stack

- **Next.js 16** (App Router, server actions) on **Vercel**
- **Supabase**: shares the family's `something-borrowed` project (`bevivtkygpiwpgomikjt`) with the wedding catalog. Every table here starts with `lt_`, and photos go in their own private bucket, `long-table-photos`.
- All database access happens on the server with the secret key. Every table has RLS on with no policies, so the public key can read nothing.
- Getting in: one shared **family passcode** (a signed cookie that lasts about 13 months), then "who's at the table?" to pick your name.
- Photos are shrunk in the browser before upload (about 1800px full size plus a thumbnail), so they upload quickly on cell data.

## Run locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

| Variable | What it is |
| --- | --- |
| `SUPABASE_URL` | `https://bevivtkygpiwpgomikjt.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret key (`sb_secret_…`). It's the same key the wedding catalog uses. |
| `FAMILY_PASSCODE` | What the family types to get in (not case-sensitive). Changing it signs everyone out. |
| `AUTH_SECRET` | Random string (`openssl rand -base64 32`) |
| `CRON_SECRET` | Random string; Vercel sends it to the keep-alive cron |

## Database

The schema is in `supabase/migrations/`, applied in order:
- `0001_long_table.sql`: `lt_members`, `lt_gatherings`, `lt_rsvps`, `lt_dishes` (a dish with no bringer is an open slot) and `lt_photos` (`kind` is `photo` or `art`)
- `0002_dish_split.sql`: `split`, `buyer` and `buyer_member_id` on dishes. When a dish is split, `bringer` is the cook.
- `0003_recipe_box.sql`: `lt_recipes`, `lt_recipe_photos` (`kind` is `card` or `dish`), and `lt_dishes.recipe_id`

`vercel.json` runs a daily cron against `/api/keepalive` so the free Supabase project never pauses.
