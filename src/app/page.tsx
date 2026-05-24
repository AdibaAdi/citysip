import Link from "next/link";
import {
  ArrowRight, Flame, Wine, Sparkles, Search, MapPin,
  CalendarDays, Store, UtensilsCrossed
} from "lucide-react";
import { listCities, searchPlaces, listEvents } from "@/lib/db";
import PlaceRail from "@/components/PlaceRail";
import HeroSearch from "./HeroSearch";

export const revalidate = 30;

export default async function HomePage() {
  const [cities, happeningNow, endingSoon, popular, foodDeals, drinkDeals, events] =
    await Promise.all([
      listCities(),
      searchPlaces({ happeningNow: true, sort: "best-match" }),
      searchPlaces({ endingSoon: true, sort: "ending-soon" }),
      searchPlaces({ sort: "rating" }),
      searchPlaces({ dealType: "FOOD" }),
      searchPlaces({ dealType: "DRINK" }),
      listEvents()
    ]);

  // Hero card never empty: live deals if any, otherwise top-rated places.
  const heroPlaces = (happeningNow.length ? happeningNow : popular).slice(0, 2);
  const featured = popular.filter((p) => p.isFeatured);
  const dealCount = "300+";

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative pt-14 lg:pt-24 pb-10 lg:pb-16">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-ember-glow pointer-events-none" />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-end">
          <div>
            <span className="chip mono text-[10px]">
              <span className="w-1.5 h-1.5 bg-ember-400 rounded-full animate-pulse-slow" />
              Public beta · {cities.length} U.S. cities
            </span>
            <h1 className="display text-[44px] sm:text-6xl lg:text-7xl leading-[0.95] mt-5 tracking-tight">
              Find the best <span className="ember-text italic">happy hours</span><br />
              in your city, before they end.
            </h1>
            <p className="mt-6 text-base lg:text-lg text-white/65 max-w-xl">
              CitySip finds food deals, drink specials, and after-work events around you,
              with live countdowns and an AI search that understands
              <span className="text-white"> &ldquo;cheap apps and cocktails before 7&rdquo;</span>.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/explore" className="ember-btn">
                Find happy hours <ArrowRight size={16} />
              </Link>
              <Link href="/events" className="ghost-btn">
                Explore events
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/45">
              <span className="flex items-center gap-1.5"><Flame size={12} className="text-ember-400" /> Live deal timers</span>
              <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-amber2" /> AI search</span>
              <span className="flex items-center gap-1.5"><Wine size={12} className="text-coral" /> {cities.length} curated cities</span>
            </div>
          </div>

          {/* Right column: hero card */}
          <div className="relative">
            <div className="glass-strong rounded-[28px] p-6 lg:p-7 shadow-card animate-float">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 uppercase tracking-[0.18em]">
                  {happeningNow.length ? "Happening now" : "Top rated this week"}
                </span>
                <span className="mono text-[10px] text-ember-300">CitySip</span>
              </div>
              {heroPlaces.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/place/${p.slug}`}
                  className={`flex gap-3 py-3 ${i === 0 ? "border-b border-white/[0.06]" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl ?? ""}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-white/55 truncate">
                      {p.neighborhood} · ★ {p.rating.toFixed(1)}
                    </p>
                    <p className="text-xs text-ember-300 mt-1">
                      {p.deals[0]?.priceHint ?? "Happy hour"}
                      {p.liveStatus.endsInMin
                        ? ` · Ends in ${p.liveStatus.endsInMin} min`
                        : ""}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/explore"
                className="mt-3 inline-flex items-center gap-1 text-sm text-ember-300 hover:text-ember-200"
              >
                Browse all places <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-10 max-w-3xl">
          <HeroSearch />
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden mt-4">
        {[
          { k: cities.length,  v: "Cities live" },
          { k: dealCount,      v: "Curated deals" },
          { k: "AI",           v: "Natural search" },
          { k: "100%",         v: "Free to use" }
        ].map((s) => (
          <div key={s.v} className="bg-ink-900 p-5 lg:p-6">
            <p className="display text-3xl lg:text-4xl ember-text">{s.k}</p>
            <p className="text-xs text-white/45 uppercase tracking-[0.18em] mt-2">{s.v}</p>
          </div>
        ))}
      </section>

      {/* ───────────────────── HAPPENING NOW ───────────────────── */}
      {happeningNow.length > 0 ? (
        <PlaceRail
          title="Happening now"
          caption="Live deals, ticking down right this minute."
          places={happeningNow}
        />
      ) : (
        <PlaceRail
          title="Featured places"
          caption="No deals live this very minute — here's what's worth a visit."
          places={featured.length ? featured : popular}
        />
      )}

      {endingSoon.length > 0 && (
        <PlaceRail
          title="Ending soon"
          caption="Last call within the next 90 minutes."
          places={endingSoon}
        />
      )}

      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <RailMini icon={<UtensilsCrossed size={14} />} title="Best food deals" places={foodDeals} />
        <RailMini icon={<Wine size={14} />} title="Best drink deals" places={drinkDeals} />
      </div>

      {/* ───────────────────── POPULAR CITIES ───────────────────── */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="display text-2xl md:text-3xl tracking-tight">Popular cities</h2>
            <p className="text-sm text-white/55 mt-1">
              Every launch city is curated and ready to explore.
            </p>
          </div>
          <Link href="/explore" className="text-sm text-ember-300 hover:text-ember-200 inline-flex items-center gap-1">
            Explore all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cities.map((c) => (
            <Link
              key={c.id}
              href={`/city/${c.slug}`}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.06] aspect-[4/5]"
            >
              {c.heroImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.heroImage}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-75 group-hover:scale-105 transition duration-500"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="display text-lg leading-tight">{c.name}</p>
                <p className="text-[11px] text-white/55 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {c.state}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────────── EVENTS TONIGHT ───────────────────── */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="display text-2xl md:text-3xl tracking-tight">Events tonight</h2>
            <p className="text-sm text-white/55 mt-1">
              Trivia, live music, comedy, networking, and karaoke near you.
            </p>
          </div>
          <Link href="/events" className="text-sm text-ember-300 hover:text-ember-200 inline-flex items-center gap-1">
            All events <ArrowRight size={14} />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-white/50 text-sm">
            No events posted yet — check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.slice(0, 6).map((e) => (
              <div key={e.id} className="glass rounded-2xl overflow-hidden">
                <div className="aspect-[16/9] relative overflow-hidden bg-ink-800">
                  {e.imageUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={e.imageUrl} alt={e.title} className="w-full h-full object-cover opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
                  <span className="absolute top-3 left-3 chip text-[10px] uppercase tracking-[0.14em]">
                    {e.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="display text-lg">{e.title}</p>
                  <p className="text-xs text-white/55 mt-1">
                    {e.placeName ?? e.cityName} ·{" "}
                    {new Date(e.startsAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  {e.description && (
                    <p className="text-sm text-white/65 mt-2 line-clamp-2">{e.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ───────────────────── HOW IT WORKS ───────────────────── */}
      <section className="mt-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="display text-3xl md:text-4xl tracking-tight">How CitySip works</h2>
          <p className="text-sm text-white/55 mt-2">
            From thirsty to seated in three steps.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          {[
            {
              icon: <Search size={20} />,
              step: "01",
              title: "Search your way",
              body: "Pick a city or type what you want in plain English. Our AI turns it into the right filters."
            },
            {
              icon: <Flame size={20} />,
              step: "02",
              title: "See what's live",
              body: "Every deal shows a real countdown so you know what's happening now and what's ending soon."
            },
            {
              icon: <MapPin size={20} />,
              step: "03",
              title: "Go before it ends",
              body: "Open the map, grab the address, and walk into the deal before last call."
            }
          ].map((s) => (
            <div key={s.step} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <span className="w-11 h-11 rounded-xl bg-ember-500/15 text-ember-300 flex items-center justify-center">
                  {s.icon}
                </span>
                <span className="display text-3xl text-white/10">{s.step}</span>
              </div>
              <h3 className="display text-xl mt-4">{s.title}</h3>
              <p className="text-sm text-white/60 mt-2">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────── FOR BUSINESSES ───────────────────── */}
      <section className="mt-20 mb-8 relative overflow-hidden rounded-3xl border border-white/[0.06] glass-strong p-10 lg:p-14">
        <div className="absolute -right-10 -top-10 w-[400px] h-[400px] bg-ember-glow pointer-events-none" />
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center relative">
          <div>
            <p className="chip mono text-[10px] mb-4">
              <Store size={11} /> For owners &amp; operators
            </p>
            <h2 className="display text-3xl md:text-5xl leading-tight">
              Own a bar or restaurant?<br />
              <span className="ember-text">Put your deal where people look.</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-lg">
              Claim your venue, publish recurring happy hours, post one-night events,
              and reach after-work crowds the moment they open CitySip.
            </p>
            <Link href="/business" className="ember-btn mt-6">
              Claim your venue <ArrowRight size={16} />
            </Link>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-white/45 mb-3">
              <span className="flex items-center gap-1"><CalendarDays size={12} /> Live preview</span>
              <span className="mono">$0/mo</span>
            </div>
            <p className="font-medium">{featured[0]?.name ?? popular[0]?.name ?? "Your venue"}</p>
            <p className="text-xs text-white/55 mt-1">
              {featured[0]?.deals[0]?.priceHint ?? "Your happy-hour deal"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="chip chip-active">Featured</span>
              <span className="chip">{featured[0]?.vibeTags[0] ?? "after-work"}</span>
            </div>
            <div className="mt-3 divider" />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-white/55">Profile views this week</span>
              <span className="mono text-ember-300">213 ↑</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RailMini({
  icon, title, places
}: {
  icon: React.ReactNode;
  title: string;
  places: { id: string; slug: string; name: string; imageUrl?: string;
            neighborhood?: string; rating: number;
            deals: { priceHint?: string }[] }[];
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-ember-300">{icon}</span>
        <h3 className="display text-xl">{title}</h3>
      </div>
      {places.length === 0 ? (
        <p className="text-sm text-white/45 py-4">Nothing here yet — check back soon.</p>
      ) : (
        <div className="space-y-3">
          {places.slice(0, 3).map((p) => (
            <Link
              key={p.id}
              href={`/place/${p.slug}`}
              className="flex gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.imageUrl} className="w-14 h-14 rounded-lg object-cover" alt="" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-white/55 truncate">
                  {p.neighborhood} · ★ {p.rating.toFixed(1)}
                </p>
                <p className="text-xs text-ember-300 mt-0.5">
                  {p.deals[0]?.priceHint ?? "Happy hour"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
