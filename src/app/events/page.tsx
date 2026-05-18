"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Ticket, Music, Mic, Trophy, Users, Sparkles } from "lucide-react";
import type { City, Event } from "@/types";

const CATEGORY_META: Record<string, { icon: any; label: string }> = {
  "trivia":      { icon: Trophy,    label: "Trivia" },
  "live-music":  { icon: Music,     label: "Live music" },
  "karaoke":     { icon: Mic,       label: "Karaoke" },
  "comedy":      { icon: Sparkles,  label: "Comedy" },
  "sports":      { icon: Trophy,    label: "Sports" },
  "networking":  { icon: Users,     label: "Networking" },
  "rooftop":     { icon: Sparkles,  label: "Rooftop" }
};

export default function EventsPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cities").then((r) => r.json()).then((d) => setCities(d.cities ?? []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = citySlug ? `/api/events?citySlug=${citySlug}` : "/api/events";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .finally(() => setLoading(false));
  }, [citySlug]);

  const filtered = useMemo(() => {
    let list = [...events];
    if (category) list = list.filter((e) => e.category === category);
    list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return list;
  }, [events, category]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [events]);

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ember-glow opacity-50" />
        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-10">
          <p className="text-xs uppercase tracking-wider text-ember-400 mb-2">CitySip · events</p>
          <h1 className="display text-5xl sm:text-6xl leading-[1.05]">
            What's <span className="ember-text">on tonight</span>.
          </h1>
          <p className="mt-4 text-ink-300 max-w-xl">
            Trivia, live music, comedy mics, rooftop sets — everything happening in the next few hours,
            sorted by start time.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        {/* city chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-4">
          <button
            onClick={() => setCitySlug(null)}
            className={`chip whitespace-nowrap ${citySlug === null ? "chip-active" : ""}`}
          >
            All cities
          </button>
          {cities.map((c) => (
            <button
              key={c.id}
              onClick={() => setCitySlug(c.slug)}
              className={`chip whitespace-nowrap ${citySlug === c.slug ? "chip-active" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* category chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategory(null)}
              className={`chip ${category === null ? "chip-active" : ""}`}
            >
              All categories
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat] ?? { icon: Calendar, label: cat };
              const Icon = meta.icon;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`chip ${category === cat ? "chip-active" : ""}`}
                >
                  <Icon className="w-3 h-3" />
                  {meta.label}
                </button>
              );
            })}
          </div>
        )}

        {/* grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-72 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-ink-400">
            No events match — try a different city or category.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e) => (
              <EventCard key={e.id} event={e} cities={cities} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({ event, cities }: { event: Event; cities: City[] }) {
  const city = cities.find((c) => c.id === event.cityId);
  const meta = CATEGORY_META[event.category] ?? { icon: Calendar, label: event.category };
  const Icon = meta.icon;

  const starts = new Date(event.startsAt);
  const ends = event.endsAt ? new Date(event.endsAt) : null;
  const now = Date.now();
  const live = starts.getTime() <= now && (!ends || ends.getTime() > now);
  const minsTo = Math.round((starts.getTime() - now) / 60000);

  function whenLabel() {
    if (live) return ends ? `Live · ends ${formatTime(ends)}` : "Live now";
    if (minsTo <= 0) return formatTime(starts);
    if (minsTo < 60) return `Starts in ${minsTo} min`;
    if (minsTo < 60 * 24) return `Today at ${formatTime(starts)}`;
    return starts.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  }

  return (
    <Link
      href={event.placeId ? `/place/${event.placeId}` : "/explore"}
      className="glass rounded-2xl overflow-hidden block group hover:bg-white/[0.06] transition"
    >
      <div className="relative aspect-[16/9] bg-ink-800 overflow-hidden">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition duration-500"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="chip backdrop-blur-md">
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
          {event.isFree && (
            <span className="chip backdrop-blur-md border-emerald-500/40 text-emerald-300 bg-emerald-500/10">
              Free
            </span>
          )}
          {live && (
            <span className="chip backdrop-blur-md border-ember-500/50 bg-ember-500/15 text-ember-200">
              <span className="w-1.5 h-1.5 rounded-full bg-ember-400 animate-pulse" />
              Live
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="display text-xl text-cream leading-tight">{event.title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {event.description && (
          <p className="text-sm text-ink-300 line-clamp-2">{event.description}</p>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-ink-300 pt-1">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-ember-400" />
            {whenLabel()}
          </span>
          {city && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {city.name}
            </span>
          )}
        </div>
        {!event.isFree && (
          <span className="inline-flex items-center gap-1 text-xs text-ink-400 pt-1">
            <Ticket className="w-3 h-3" /> Cover / ticket
          </span>
        )}
      </div>
    </Link>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
