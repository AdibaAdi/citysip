# CitySip

> **Sip the city. Find the hour.**
>
> A premium-feel city discovery web app for happy hours, food deals, drink specials,
> and after-work events across 15 major U.S. cities. Built with Next.js 14, TypeScript,
> Tailwind, Prisma/PostgreSQL, and a Claude-powered AI search layer.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TS-strict-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4) ![License](https://img.shields.io/badge/license-MIT-green)

---

## ⚡ TL;DR — run it in 30 seconds

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**You don't need a database, an API key, or any other setup to see the full app.**
CitySip ships with bundled mock data and an offline fallback for AI search.
Everything below in [Optional setup](#optional-setup) is for going beyond the demo.

---

## ✨ What's inside

- **15 launch cities** — Chicago, NYC, SF, Seattle, LA, Philadelphia, Raleigh, Sacramento, Boston, DC, Austin, Miami, Atlanta, Jersey City, Charlotte.
- **AI-powered natural-language search** — *"Cheap apps and cocktails near me before 7"* → parsed into structured filters by Claude (Haiku). Falls back to a deterministic keyword parser when no API key is set.
- **Live deal status** — every place card and place page computes happening-now / ending-soon / starts-soon from the current time and weekly schedule.
- **Interactive map** — react-leaflet with custom pulse pins and a dark map theme that matches the UI.
- **Filter bar** — happening now, ending soon, food / drinks / both, price level, min rating, vibes (rooftop, date-night, networking, student-budget, after-work, etc.), and four sort modes (best match, rating, ending soon, distance).
- **Events feed** — trivia, live music, karaoke, comedy, networking — sorted by start time.
- **User submissions** — four types (new place, update deal, menu photo, error report) wired to the same backend queue.
- **Business claims** — venues can request control of their listing from `/business`.
- **Admin dashboard** — token-gated approve/reject queue at `/admin`.
- **Mock + real DB dual mode** — the same `src/lib/db.ts` adapter swaps between bundled seed data and Prisma based on whether `DATABASE_URL` is set. Zero-config dev, production-ready when you want it.

---

## 🗂 Project structure

```
citysip/
├─ prisma/
│  ├─ schema.prisma          # City / Place / Deal / Event / Submission / BusinessClaim
│  └─ seed.ts                # upserts everything in src/data/seed-data.ts
├─ public/
│  └─ logo.svg               # cocktail glass + skyline-straw logo
├─ src/
│  ├─ app/
│  │  ├─ page.tsx            # /              Landing
│  │  ├─ explore/page.tsx    # /explore       Search + filters + map
│  │  ├─ city/[slug]/page.tsx# /city/chicago  Per-city
│  │  ├─ place/[id]/page.tsx # /place/...     Venue detail
│  │  ├─ events/page.tsx     # /events        Events feed
│  │  ├─ submit/page.tsx     # /submit        User submissions
│  │  ├─ business/page.tsx   # /business      Owner claim flow
│  │  ├─ admin/page.tsx      # /admin         Token-gated review queue
│  │  ├─ api/
│  │  │  ├─ places/          # GET list, GET :id
│  │  │  ├─ cities/          # GET list
│  │  │  ├─ events/          # GET ?citySlug
│  │  │  ├─ ai-search/       # POST { query }
│  │  │  ├─ submit/          # POST + GET (admin)
│  │  │  └─ admin/submissions/ # GET + PATCH (admin)
│  │  ├─ globals.css         # Tailwind base + component classes
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ Navbar.tsx · Footer.tsx
│  │  ├─ FilterBar.tsx · AiSearchBar.tsx
│  │  ├─ PlaceCard.tsx · PlaceRail.tsx · CityChips.tsx
│  │  ├─ MapView.tsx          # leaflet, dynamic-imported
│  │  └─ LiveBadge.tsx
│  ├─ lib/
│  │  ├─ db.ts                # Dual-mode adapter (Prisma ↔ in-memory mocks)
│  │  ├─ ai.ts                # Claude search + keyword fallback
│  │  └─ utils.ts             # haversine, live-status, formatting, ranking
│  ├─ data/
│  │  └─ seed-data.ts         # 15 cities, ~14 places, deals, events
│  └─ types/
│     └─ index.ts
├─ tailwind.config.ts
├─ next.config.js
├─ tsconfig.json
├─ .env.example
└─ package.json
```

---

## 🧪 Scripts

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Start Next.js dev server on `:3000`                             |
| `npm run build`    | Production build                                                |
| `npm run start`    | Run the production build                                        |
| `npm run lint`     | ESLint                                                          |
| `npm run db:push`  | Push Prisma schema to your `DATABASE_URL` (no migration files)  |
| `npm run db:seed`  | Run `prisma/seed.ts` to populate the DB with bundled seed data  |
| `npm run db:studio`| Open Prisma Studio in the browser                               |

---

## 🛠 Optional setup

Everything in this section is **optional**. The app boots without any of it.

Copy the env template to a local file first:

```bash
cp .env.example .env
```

Then fill in only the lines you actually want to use.

### 1. PostgreSQL (Prisma)

By default `DATABASE_URL` is empty and CitySip serves bundled in-memory data.
To switch to a real database:

1. Install Postgres locally or sign up for a managed one (Neon, Supabase, Railway, Render — anything with a Postgres connection string works).
2. Create a database:
   ```bash
   createdb citysip
   ```
3. Put the connection string in `.env`:
   ```dotenv
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/citysip?schema=public"
   ```
4. Push the schema and seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Restart the dev server. `src/lib/db.ts` will now talk to Postgres.

> **PostGIS:** the schema stores `lat`/`lng` as `Float` for MVP simplicity. When
> you outgrow that and want native geospatial queries, switch the columns to
> `Unsupported("geography(Point, 4326)")` and use `ST_DWithin` in raw SQL.

### 2. AI search (Anthropic)

CitySip parses natural-language search queries into structured filters.
Without a key it uses a deterministic keyword matcher that handles the
common cases ("cheap food", "rooftop date night", "ending soon", etc.).

To turn on real Claude parsing:

1. Get an API key at [console.anthropic.com](https://console.anthropic.com).
2. Add it to `.env`:
   ```dotenv
   ANTHROPIC_API_KEY="sk-ant-..."
   ```
3. Restart the dev server. AI search responses will now include a model-written
   rationale describing why each match was chosen.

The model used is `claude-haiku-4-5-20251001` — fast and cheap. To change it,
edit `MODEL` in `src/lib/ai.ts`.

### 3. Admin gate

The `/admin` dashboard is gated by a token. Set it in `.env`:

```dotenv
ADMIN_TOKEN="some-long-random-string"
```

Then visit `/admin`, paste that value, and you'll see the submissions queue.

> Leaving `ADMIN_TOKEN` empty disables the gate entirely — fine for local dev,
> **do not** ship to production that way.

### 4. Optional third-party data providers

These envs are placeholders for future integrations and are **not required**
to run the app — the seed data is plenty for the demo.

```dotenv
NEXT_PUBLIC_MAPBOX_TOKEN=""   # If you want to switch the map tiles to Mapbox
GOOGLE_PLACES_API_KEY=""      # Future: import real venue data
YELP_API_KEY=""               # Future: ratings + reviews
FOURSQUARE_API_KEY=""         # Future: venue categories
```

The shipped map uses OpenStreetMap tiles via Leaflet and needs no token.

---

## 📋 Full `.env` reference

Copy-paste this into a file named `.env` at the project root. Fill in only the
values you want; leave the rest empty.

```dotenv
# Postgres (optional — leave empty to use bundled mock data)
DATABASE_URL=""

# Anthropic key for AI search (optional — falls back to keyword parser)
ANTHROPIC_API_KEY=""

# Admin gate for /admin (optional in dev, REQUIRED in production)
ADMIN_TOKEN="change-me-locally"

# Optional third-party providers (not used by the MVP)
NEXT_PUBLIC_MAPBOX_TOKEN=""
GOOGLE_PLACES_API_KEY=""
YELP_API_KEY=""
FOURSQUARE_API_KEY=""
```

---

## 🚀 Deploying

CitySip is a vanilla Next.js 14 app, so it deploys to anywhere Next.js does:

### Vercel (easiest)

1. Push this folder to a new GitHub repo.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. Add `ANTHROPIC_API_KEY`, `DATABASE_URL`, and `ADMIN_TOKEN` under **Environment Variables**.
4. Hit Deploy.
5. After the first deploy, open the Vercel project's terminal and run
   `npx prisma db push && npx prisma db seed` to populate the database, or
   wire those into a build hook.

### Anywhere else (Fly, Render, Railway, your own VPS)

Standard `npm run build && npm run start` — make sure the same env vars are set.

---

## 🧭 Where to look first when poking around

- **Want to change the look?** → `src/app/globals.css` (component classes:
  `.ember-btn`, `.glass`, `.chip`, `.display`, `.ember-text`, `.input`) and
  `tailwind.config.ts` (palette + shadows).
- **Want to add a city?** → append to `CITIES` in `src/data/seed-data.ts`,
  then `npm run db:push && npm run db:seed` if you're using Postgres.
- **Want to change the AI prompt?** → `SYSTEM_PROMPT` in `src/lib/ai.ts`.
- **Want to change how "live now" is calculated?** → `dealLiveStatus()` in
  `src/lib/utils.ts`.
- **Want to add a new filter?** → extend `SearchFilters` in `src/types/index.ts`,
  add it to `FilterBar.tsx`, pass it through `/api/places`, and read it in
  `searchPlaces()` inside `src/lib/db.ts`.

---

## 🗺 Routes at a glance

| Path             | What it is                                   |
| ---------------- | -------------------------------------------- |
| `/`              | Landing — hero, AI search, city rails        |
| `/explore`       | Full search with filters + map / list / split |
| `/city/[slug]`   | Per-city page with live rails                 |
| `/place/[id]`    | Venue detail with weekday deal schedule       |
| `/events`        | Events feed by city + category                |
| `/submit`        | User submission form                          |
| `/business`      | Owner claim flow                              |
| `/admin`         | Token-gated review queue                      |

---

## 🧱 Tech stack

- **Next.js 14** (App Router, RSC where it helps, client components where needed)
- **TypeScript** (strict)
- **Tailwind CSS** + custom `display`/`ember-text`/`glass` component classes
- **Prisma + PostgreSQL** (optional — falls back to in-memory mocks)
- **Anthropic SDK** (`claude-haiku-4-5-20251001`) for AI search
- **react-leaflet** for maps
- **lucide-react** icons
- **framer-motion**, **zod**, **clsx**, **tailwind-merge**

---

## 📜 License

MIT — do whatever you want, but be cool. ✌️
