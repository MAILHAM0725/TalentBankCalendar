# Talentbank Fair Calendar

A full-year event calendar for Talentbank career fairs, built with Next.js (App Router), Tailwind CSS,
and Vercel Postgres — a real shared database, so admin edits show up for every visitor and the whole
thing runs correctly on Vercel's serverless hosting (a plain JSON file would not survive there).

## 1. Set up the database (one-time)

You need a Postgres database and its connection details in your environment. The quickest path is
Vercel's own integration:

1. Push this project to a GitHub repo and import it into a new Vercel project (or run `vercel` from this
   folder with the Vercel CLI, if you already have one).
2. In the Vercel dashboard, open your project → **Storage** tab → **Create Database** → choose **Postgres**
   (powered by Neon) → connect it to this project.
3. Pull the connection details down to your machine:
   ```bash
   npm i -g vercel      # if you don't already have the CLI
   vercel login
   vercel link          # links this folder to the Vercel project you just created
   vercel env pull .env.development.local
   ```
   That last command writes `POSTGRES_URL` and friends into `.env.development.local`, which
   `@vercel/postgres` reads automatically. (Already git-ignored — don't commit it.)

You do **not** need to write any SQL by hand: the first request the app makes will create the `fairs`
table and load the sample fairs automatically if the table is empty (see `ensureSchema()` in
`lib/server/db.ts`).

## 2. Run it

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

- **`/`** — Public Calendar (candidates & employers)
- **`/admin`** — Admin View (event organizer)

## 3. Deploy

Push to your GitHub repo; Vercel will build and deploy automatically (or run `vercel --prod`). Because the
Postgres database is already connected to the project, the same environment variables are injected in
production — no extra setup needed there.

## Why a real database (and not the JSON-file version)

An earlier version of this project stored fairs in a plain JSON file on disk. That's fine on a normal,
always-on server, but **breaks on Vercel**: serverless functions don't guarantee a written file sticks
around for the next request, so data could silently vanish. Postgres fixes that, and also gives us
something the file version could only fake: **atomic updates**. Registering for a fair now runs as a
single conditional SQL statement —

```sql
UPDATE fairs SET registered = registered + 1
WHERE id = $1 AND status = 'Published' AND registered < capacity
```

— so if two people try to grab the last seat at the same instant, the database itself guarantees only one
of those requests can succeed. There's no gap between "check if there's room" and "add one seat" for a
race condition to slip into.

There's currently no login on `/admin` — anyone with the URL can edit fairs. Add auth in front of that
route (e.g. NextAuth, or simple middleware) before sharing this URL with your events team on a real
deployment.

## Public Calendar

- A ledger-style grid of all 12 months, with each fair day marked by a colored dot (green = Published, amber = Sold Out, red = Cancelled).
- Filter the whole year by fair type (Career Fair, Tech & Engineering Expo, Campus Recruiting Day, Diversity & Inclusion Fair, Industry Night, Virtual Hiring Event).
- Tap a date to open a detail panel with the fair's description, location, seats remaining, and a Register button.
- Edge cases are handled explicitly:
  - **Full events** show seats-left and a fill bar, and the Register button becomes a disabled "Sold out" state once capacity is reached — even if an organizer forgot to flip the status by hand.
  - **Cancelled fairs** are visually muted, show a clear "This fair has been cancelled" message, and never show a Register button.
  - **Multiple fairs on one day** all show up in the same detail panel, stacked.

## Admin View

Built for a non-technical organizer — plain labels, native date/number/select inputs, no jargon:

- **Add a fair**: name, type, date, location, capacity, status, and a short description.
- **Edit a fair**: same form, pre-filled; editable inline in the table too (capacity and status).
- **Status control**: Published / Sold Out / Cancelled, shown as a stamped badge that mirrors what candidates see.
- **Capacity guardrails**: capacity can't be dropped below the number of people already registered — the form explains why and stops the save (checked both in the form and again on the server).
- **Clash detection**: adding or moving a fair onto a date where another live fair already books the *same venue* blocks the save with a warning until the organizer explicitly confirms it's intentional. Same date, *different* venue just shows an informational note — that's normal, not a conflict.
- **Delete**: requires an inline confirm step before removing a fair.

## Project structure

```
app/
  layout.tsx              Root layout — fonts, global store, nav
  page.tsx                 Public Calendar route
  admin/page.tsx            Admin route
  api/fairs/route.ts         GET (list) / POST (create)
  api/fairs/[id]/route.ts    PATCH (update) / DELETE
  api/fairs/[id]/register/route.ts   POST (register — atomic capacity check)
components/
  Nav.tsx                  Public/Admin segmented switch
  PublicCalendarView.tsx
  MonthCard.tsx             One month's mini calendar tile
  FilterBar.tsx
  EventDrawer.tsx           Fair detail panel + registration
  StatusStamp.tsx           Published/Sold Out/Cancelled badge
  AdminView.tsx
  AdminEventForm.tsx        Add/edit form, with clash detection
  EventsTable.tsx
lib/
  types.ts                 CareerFair type + effectiveStatus() helper
  seedData.ts               A year of sample fairs (used to seed the database once, on first run)
  store.tsx                 Client-side Context — talks to the API, polls for freshness
  dateUtils.ts               Calendar grid + formatting helpers
  server/db.ts               All Postgres queries — the only file that touches the database
  server/validate.ts          Shared server-side field validation
```
