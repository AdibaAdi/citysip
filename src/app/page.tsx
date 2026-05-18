import Link from "next/link";
import { ArrowRight, Flame, Clock, UtensilsCrossed, Wine, Sparkles } from "lucide-react";
import { listCities, searchPlaces, listEvents } from "@/lib/db";
import PlaceRail from "@/components/PlaceRail";
import CityChips from "@/components/CityChips";
import HeroSearch from "./HeroSearch";

export const revalidate = 30;

export default async function HomePage() {
  const [cities, happeningNow, endingSoon, foodDeals, drinkDeals, chicago, events] = await Promise.all([
    listCities(),
    searchPlaces({ happeningNow: true, sort: "best-match" }),
    searchPlaces({ endingSoon: true, sort: "ending-soon" }),
    searchPlaces({ dealType: "FOOD" }),
    searchPlaces({ dealType: "DRINK" }),
    searchPlaces({ citySlug: "chicago" }),
    listEvents()
  ]);

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8">
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative pt-14 lg:pt-24 pb-10 lg:pb-16">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-ember-glow pointer-events-none" />

        <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-10 items-end">
          <div>
            <span className="chip mono text-[10px]">
              <span className="w-1.5 h-1.5 bg-ember-400 rounded-full animate-pulse-slow" />
              Live in 15+ U.S. cities
            </span>
            <h1 className="display text-[44px] sm:text-6xl lg:text-7xl leading-[0.95] mt-5 tracking-tight">
              Find the best <span className="ember-text italic">happy hours</span><br />
              in your city, before they end.
            </h1>
            <p className="mt-6 text-base lg:text-lg text-white/65 max-w-xl">
              Discover food deals, drink specials, after-work events, and rooftop spots near you —
              with live countdowns and an AI search that actually understands
              <span className="text-white"> &ldquo;cheap apps and cocktails before 7&rdquo;</span>.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/explore" className="ember-btn">
                Find Happy Hours <ArrowRight size={16} />
              </Link>
              <Link href="/events" className="ghost-btn">
                Explore Events
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 text-xs text-white/45">
              <span className="flex items-center gap-1.5"><Flame size={12} className="text-ember-400" /> Live deal timers</span>
              <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-amber2" /> AI search</span>
              <span className="flex items-center gap-1.5"><Wine size={12} className="text-coral" /> Curated cities</span>
            </div>
          </div>

          {/* Right column: hero card */}
          <div className="relative">
            <div className="glass-strong rounded-[28px] p-6 lg:p-7 shadow-card animate-float">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-white/40 uppercase tracking-[0.18em]">
                  Happening now in Chicago
                </span>
                <span className="mono text-[10px] text-ember-300">5:42 PM</span>
              </div>
              {happeningNow.slice(0, 2).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/place/${p.slug}`}
                  className={`flex gap-3 py-3 ${i === 0 ? "border-b border-white/[0.06]" : ""}`}
                >
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
                      {p.deals[0]?.priceHint ?? "Happy hour"} ·{" "}
                      {p.liveStatus.endsInMin ? `Ends in ${p.liveStatus.endsInMin} min` : "Live"}
                    </p>
                  </div>
                </Link>
              ))}
              <Link
                href="/explore?happeningNow=1"
                className="mt-3 inline-flex items-center gap-1 text-sm text-ember-300 hover:text-ember-200"
              >
                See all live deals <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-10 max-w-3xl">
          <HeroSearch />
        </div>

        {/* City chips */}
        <div className="mt-6">
          <p className="text-xs text-white/40 uppercase tracking-[0.18em] mb-2">Cities</p>
          <CityChips cities={cities} />
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.06] rounded-2xl overflow-hidden mt-4">
        {[
          { k: cities.length,       v: "Cities live" },
          { k: "1,200+",            v: "Deals tracked" },
          { k: "AI",                v: "Natural search" },
          { k: "100%",              v: "Free to use" }
        ].map((s) => (
          <div key={s.v} className="bg-ink-900 p-5 lg:p-6">
            <p className="display text-3xl lg:text-4xl ember-text">{s.k}</p>
            <p className="text-xs text-white/45 uppercase tracking-[0.18em] mt-2">{s.v}</p>
          </div>
        ))}
      </section>

      {/* RAILS */}
      <PlaceRail
        title="Happening now"
        caption="Live deals, ticking down right this minute."
        places={happeningNow}
      />

      <PlaceRail
        title="Ending soon"
        caption="Last call within the next 90 minutes."
        places={endingSoon}
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-12">
        <RailMini icon={<UtensilsCrossed size={14} />} title="Best food deals" places={foodDeals} />
        <RailMini icon={<Wine size={14} />} title="Best drink deals" places={drinkDeals} />
      </div>

      <PlaceRail
        title="Trending in Chicago"
        caption="What's hot in the Loop, River North & Wicker Park."
        places={chicago}
      />

      {/* Events */}
      <section className="mt-16">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="display text-2xl md:text-3xl tracking-tight">Events tonight</h2>
            <p className="text-sm text-white/55 mt-1">
              Trivia, live music, networking, and karaoke happening near you.
            </p>
          </div>
          <Link href="/events" className="text-sm text-ember-300 hover:text-ember-200 inline-flex items-center gap-1">
            All events <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.slice(0, 6).map((e) => (
            <div key={e.id} className="glass rounded-2xl overflow-hidden">
              <div className="aspect-[16/9] relative overflow-hidden bg-ink-800">
                {e.imageUrl && (
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
                  {new Date(e.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
                {e.description && (
                  <p className="text-sm text-white/65 mt-2 line-clamp-2">{e.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Business CTA */}
      <section className="mt-20 relative overflow-hidden rounded-3xl border border-white/[0.06] glass-strong p-10 lg:p-14">
        <div className="absolute -right-10 -top-10 w-[400px] h-[400px] bg-ember-glow pointer-events-none" />
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-center relative">
          <div>
            <p className="chip mono text-[10px] mb-4">For owners & operators</p>
            <h2 className="display text-3xl md:text-5xl leading-tight">
              Own a bar or restaurant?<br />
              <span className="ember-text">Put your deal where the people look.</span>
            </h2>
            <p className="mt-4 text-white/65 max-w-lg">
              Claim your venue, publish recurring happy hours, post one-night events,
              and reach after-work crowds the moment they open CitySip.
            </p>
            <Link href="/business" className="ember-btn mt-6">
              Claim your venue
            </Link>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-white/45 mb-3">
              <span>Live preview</span>
              <span className="mono">$0/mo</span>
            </div>
            <p className="font-medium">River North Tap</p>
            <p className="text-xs text-white/55 mt-1">$4 drafts · half-off wings</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="chip chip-active">Ends in 47 min</span>
              <span className="chip">after-work</span>
            </div>
            <div className="mt-3 divider" />
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-white/55">View clicks today</span>
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
  places: any[];
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-ember-300">{icon}</span>
        <h3 className="display text-xl">{title}</h3>
      </div>
      <div className="space-y-3">
        {places.slice(0, 3).map((p) => (
          <Link
            key={p.id}
            href={`/place/${p.slug}`}
            className="flex gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition"
          >
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
    </div>
  );
}
