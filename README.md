# CitySip

> **Sip the city. Find the hour.**
>
> A city discovery app for happy hours, food deals, drink specials,
> and after-work events across 15 U.S. cities. Built with Next.js 14, TypeScript,
> Tailwind, Prisma/PostgreSQL (Neon), and an optional Claude-powered AI search layer.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TS-strict-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

---

## Zero-config quickstart

```bash
npm install
npm run dev          # http://localhost:3000
```

The app boots immediately using bundled mock data. No database or API key is needed
to run locally in development.

---

## Environment variables

Copy the template first:

```bash
cp .env.example .env
```

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | **Required in production** | Neon/Postgres connection string |
| `ADMIN_TOKEN` | Required in production | Paste at `/admin` to unlock the dashboard |
| `ANTHROPIC_API_KEY` | Optional | Real Claude AI search (falls back to keyword parser) |
| `FOURSQUARE_API_KEY` | Optional | Import venues via `/api/import/foursquare` |
| `TICKETMASTER_API_KEY` | Optional | Import events via `/api/import/events` |
| `GOOGLE_PLACES_API_KEY` | Optional | Stub — not yet implemented |
| `YELP_API_KEY` | Optional | Stub — not yet implemented |
| `NEXT_PUBLIC_SITE_URL` | Optional | Canonical URL for Open Graph (e.g. `https://citysip.app`) |

**Security rules:**
- Never expose `ANTHROPIC_API_KEY`, `FOURSQUARE_API_KEY`, `TICKETMASTER_API_KEY`, or
  `DATABASE_URL` to the browser. All provider calls are server-side only.
- Never prefix data-provider keys with `NEXT_PUBLIC_`. Only `NEXT_PUBLIC_SITE_URL` is
  intentionally public.
- Set `ADMIN_TOKEN` to a long random string in production. An empty `ADMIN_TOKEN` in
  production disables the admin dashboard entirely for safety.

---

## Neon database setup

CitySip uses Neon serverless Postgres. The free tier (0.5 GB, 100 CU-hours/month,
no credit card required) is enough for a live beta.

1. Sign up at [neon.tech](https://neon.tech) and create a new project.
2. Copy your connection string (it looks like
   `postgresql://user:pass@host/dbname?sslmode=require`).
3. Paste it into your `.env`:
   ```dotenv
   DATABASE_URL="postgresql://..."
   ```
4. Push the schema and seed starter data:
   ```bash
   npm run db:push    # syncs schema to your Neon DB
   npm run db:seed    # loads 15 cities + sample venues + deals
   ```
5. Restart the dev server. It now reads from Postgres instead of mock data.

To inspect your data visually:
```bash
npm run db:studio    # opens Prisma Studio in the browser
```

---

## Vercel deployment

CitySip is a vanilla Next.js 14 app and deploys to Vercel in one click.

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "CitySip v1"
git remote add origin https://github.com/you/citysip
git push -u origin main
```

### Step 2 — Import on Vercel

Go to [vercel.com/new](https://vercel.com/new), click **Import**, and select your repo.
Vercel detects Next.js automatically.

### Step 3 — Connect Neon (optional but recommended via Vercel marketplace)

In your Vercel project: **Storage → Create Database → Neon**.
This creates a Neon project and sets `DATABASE_URL` automatically in all environments.

Or add your own Neon connection string manually in **Settings → Environment Variables**.

### Step 4 — Add environment variables

In your Vercel project under **Settings → Environment Variables**, add:

```
DATABASE_URL          = postgresql://...   (from Neon)
ADMIN_TOKEN           = some-long-random-string
ANTHROPIC_API_KEY     = sk-ant-...         (optional)
FOURSQUARE_API_KEY    = ...                (optional)
TICKETMASTER_API_KEY  = ...                (optional)
NEXT_PUBLIC_SITE_URL  = https://your-domain.com
```

### Step 5 — Seed the database

After your first deploy, run the seed from your local machine with the Neon
connection string in your `.env`:

```bash
npm run db:push    # only needed once (or after schema changes)
npm run db:seed    # load cities + starter venues
```

### Step 6 — Redeploy

Trigger a redeploy from the Vercel dashboard or push a new commit. Your live site
now reads from Postgres.

---

## Admin dashboard

Visit `/admin` on your deployed site and paste your `ADMIN_TOKEN` to unlock the
control center. It has six sections:

| Section | What you can do |
|---|---|
| **Queue** | Review user submissions (new places, deal corrections, error reports) — approve or reject |
| **Claims** | Review venue owner claim requests — approve or reject |
| **Import** | Pull venues from Foursquare and events from Ticketmaster into the database |
| **Places** | See recently-imported venues and mark them verified |
| **Deals** | See unverified deals and mark them verified |
| **Cities** | Data health per city — place counts, event counts, verification %  |

### How to import venues after deployment

1. Go to `/admin` and unlock with your `ADMIN_TOKEN`.
2. Click **Import** in the section tabs.
3. Type a city slug (e.g. `chicago`) and a limit (1–50).
4. Click **Import Foursquare venues** or **Import Ticketmaster events**.
5. The dashboard shows imported / updated / skipped counts.
6. New venues land in the **Places** tab as unverified. Review and mark them verified
   once you've confirmed their data is accurate.

Alternatively, call the import routes directly (e.g. from a cron job):

```bash
curl -X POST https://your-site.com/api/import/foursquare \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"citySlug": "chicago", "limit": 30}'

curl -X POST https://your-site.com/api/import/events \
  -H "x-admin-token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"citySlug": "chicago", "limit": 30}'
```

Both routes return an `ImportSummary`:

```json
{
  "ok": true,
  "provider": "foursquare",
  "city": "Chicago",
  "imported": 18,
  "updated": 4,
  "skipped": 8,
  "errors": []
}
```

### How happy-hour deal data gets verified

External providers (Foursquare, Ticketmaster) give you venue shells and event listings
but they do **not** have structured happy-hour deal data. The deal verification pipeline is:

1. **Seed** — `npm run db:seed` loads hand-curated starter deals (pre-verified).
2. **User submissions** — the `/submit` form lets anyone suggest a new deal. Lands in the
   Queue as pending.
3. **Business claims** — venue owners claim their listing via `/business`, then can
   update their own deals.
4. **Admin verification** — the Deals tab shows every unverified deal. You confirm the
   times and prices are accurate, then click Verify.

**Happy-hour times are the trust-critical data.** Do not mark deals as verified
without actually checking them against the venue's website or calling the bar.

---

## Scripts reference

| Script | What it does |
|---|---|
| `npm run dev` | Development server on `:3000` |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:push` | Push schema to your database (no migration files) |
| `npm run db:migrate` | Create a migration file and push |
| `npm run db:seed` | Seed starter cities, places, deals, and events |
| `npm run db:studio` | Open Prisma Studio in the browser |

---

## Project structure

```
citysip/
├─ prisma/
│  ├─ schema.prisma        # City / Place / Deal / Event / Submission / BusinessClaim
│  └─ seed.ts              # Starter data — 15 cities, sample venues + deals
├─ public/logo.svg
├─ src/
│  ├─ app/
│  │  ├─ page.tsx          # /             Landing
│  │  ├─ explore/          # /explore      Search + filters + map
│  │  ├─ city/[slug]/      # /city/...     Per-city page
│  │  ├─ place/[id]/       # /place/...    Venue detail + deal schedule
│  │  ├─ events/           # /events       Events feed
│  │  ├─ submit/           # /submit       User submissions
│  │  ├─ business/         # /business     Owner claim flow
│  │  ├─ admin/            # /admin        Token-gated control center
│  │  └─ api/
│  │     ├─ places/        # GET list, GET :id
│  │     ├─ cities/        # GET list
│  │     ├─ events/        # GET ?citySlug
│  │     ├─ ai-search/     # POST { query }
│  │     ├─ submit/        # POST + admin GET
│  │     ├─ business/      # POST (create claim)
│  │     ├─ import/
│  │     │  ├─ foursquare/ # POST (admin — import venues)
│  │     │  └─ events/     # POST (admin — import events)
│  │     └─ admin/
│  │        ├─ submissions/ # GET + PATCH
│  │        ├─ claims/      # GET + PATCH
│  │        ├─ verify/      # PATCH (mark place/deal verified)
│  │        └─ overview/    # GET (dashboard stats)
│  ├─ components/
│  │  ├─ Navbar · Footer · LiveBadge · PlaceCard · PlaceRail
│  │  ├─ FilterBar · AiSearchBar · CityChips · MapView
│  ├─ lib/
│  │  ├─ db.ts             # Public data layer (Prisma when available, mocks in dev)
│  │  ├─ prisma.ts         # Singleton client with production enforcement
│  │  ├─ adminAuth.ts      # requireAdmin() + rateLimit()
│  │  ├─ ai.ts             # Claude search + keyword fallback
│  │  ├─ utils.ts          # haversine, live-status, slugify, ranking
│  │  ├─ importService.ts  # importPlaces() + importEvents() with dedup
│  │  └─ providers/
│  │     ├─ foursquare.ts  # Full — venue search + normalization
│  │     ├─ ticketmaster.ts # Full — event search + normalization
│  │     ├─ googlePlaces.ts # Stub (TODO)
│  │     └─ yelp.ts        # Stub (TODO)
│  ├─ data/seed-data.ts    # Bundled mock data (used in dev without DB)
│  └─ types/index.ts
└─ .env.example
```

---

## Demo Data Note

**CitySip is currently in public beta and runs on curated demo data.**

The seed dataset covers all 15 launch cities with hand-written, demo-safe content:

- **15 cities** — Chicago, New York City, San Francisco, Seattle, Los Angeles,
  Philadelphia, Raleigh, Sacramento, Boston, Washington DC, Austin, Miami, Atlanta,
  Jersey City, and Charlotte.
- **165 venues** — 11 per city.
- **300+ happy-hour deals** — 20 or more per city, spanning food, drinks, and
  food-and-drinks, with varied windows (afternoon, early evening, and late night).
- **95 events** — at least 6 per city, covering trivia, live music, karaoke, comedy,
  networking, and rooftop socials.

Important honesty notes:

- Venue names, addresses, deals, and events are **fictional and demo-safe**. They are
  designed to make the product feel real without making unverified claims about actual
  businesses.
- CitySip does **not** currently display live, verified, real-world happy-hour data.
  Any deal shown is curated demo content unless it has been manually verified through
  the admin dashboard.
- Coordinates are approximate, fanned out around each city center so the map looks
  realistic. They are not real venue locations.

When you move beyond the demo, real data can enter the system through the channels
described in the [Public Beta Roadmap](#public-beta-roadmap) below, and only deals
marked verified by an admin should be presented as confirmed.

## Public Beta Roadmap

CitySip is built so curated demo data can be replaced with real, verified data
incrementally — no rewrite required.

**Now (public beta)**
- Curated demo data for all 15 cities.
- Full search, filtering, map, events, submissions, and business-claim flows.
- Admin dashboard for reviewing submissions and claims.

**Next — real data ingestion**
- **Foursquare import** (admin tool, already built) — pulls real venue shells
  (name, address, location, rating) into the database. Venues import as unverified.
- **Ticketmaster import** (admin tool, already built) — pulls real events by city.
- **User submissions** — the `/submit` form lets anyone suggest a new place or deal.
- **Business claims** — the `/business` flow lets owners claim and correct their
  listing.

**Then — verification + trust**
- Admin verification of imported venues and of every happy-hour deal.
- A visible "verified" badge so users can tell curated/imported data apart from
  owner-confirmed data.
- Only admin-verified deals presented as confirmed happy-hour information.

**Later — optional providers**
- Google Places and Yelp provider modules are stubbed and can be implemented as
  additional venue sources.
- Web scraping is intentionally **not** part of the current roadmap.

Paid APIs are never required. The app runs in full on the Vercel and Neon free tiers.

## Architecture notes

**Mock vs. real data mode**

`src/lib/prisma.ts` exports `getPrismaOrNull()` (returns null without `DATABASE_URL`)
and `getPrisma()` (throws without `DATABASE_URL`). The public data layer (`db.ts`) uses
`getPrismaOrNull()` so pages fall back to mock data in development. Admin and import
routes use `getPrisma()` and require a real database.

**Import pipeline**

External data flows Admin → Import route → Provider module → Import service → Postgres.
Users never trigger external API calls — they search the database. This keeps the app
free-tier friendly (providers are called only when you explicitly run an import).

**Deal trust model**

Foursquare/Yelp/Google know that a bar exists. They do not know it has $4 margs on
Tuesdays 4–7. Deals come from seed data, user submissions, business claims, and manual
admin entry. The `verified` field on Deal is the trust signal.

**Maps**

react-leaflet with OpenStreetMap tiles. No Mapbox token, no Google Maps billing.

---

## License

MIT
