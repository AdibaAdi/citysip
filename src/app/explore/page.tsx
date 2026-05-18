"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter } from "next/navigation";
import { Map, List, MapPin } from "lucide-react";
import AiSearchBar from "@/components/AiSearchBar";
import FilterBar from "@/components/FilterBar";
import PlaceCard from "@/components/PlaceCard";
import CityChips from "@/components/CityChips";
import type { City, PlaceWithDeals, SearchFilters } from "@/types";
import { cn } from "@/lib/utils";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl h-[600px] skeleton" />
  )
});

function urlToFilters(sp: URLSearchParams): SearchFilters {
  const g = (k: string) => sp.get(k);
  return {
    citySlug:     g("citySlug")     ?? undefined,
    q:            g("q")            ?? undefined,
    happeningNow: g("happeningNow") === "1",
    endingSoon:   g("endingSoon")   === "1",
    startsSoon:   g("startsSoon")   === "1",
    dealType:     (g("dealType")    as any) ?? undefined,
    minRating:    g("minRating")    ? Number(g("minRating")) : undefined,
    maxPrice:     g("maxPrice")     ? (Number(g("maxPrice")) as 1|2|3|4) : undefined,
    vibes:        g("vibes")        ? g("vibes")!.split(",").filter(Boolean) : undefined,
    sort:         (g("sort")        as any) ?? undefined
  };
}

function filtersToUrl(f: SearchFilters): string {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v == null) return;
    if (typeof v === "boolean") { if (v) p.set(k, "1"); return; }
    if (Array.isArray(v))      { if (v.length) p.set(k, v.join(",")); return; }
    if (typeof v === "object") return;
    p.set(k, String(v));
  });
  return p.toString();
}

export default function ExplorePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(() => urlToFilters(new URLSearchParams(sp.toString())));
  const [places, setPlaces] = useState<PlaceWithDeals[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"list" | "map" | "split">("split");
  const [rationale, setRationale] = useState<string>("");

  useEffect(() => {
    fetch("/api/cities").then((r) => r.json()).then((d) => setCities(d.cities));
  }, []);

  const fetchPlaces = useCallback(async (f: SearchFilters) => {
    setLoading(true);
    try {
      const qs = filtersToUrl(f);
      const res = await fetch(`/api/places?${qs}`);
      const data = await res.json();
      setPlaces(data.results);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync filters → url + fetch
  useEffect(() => {
    const qs = filtersToUrl(filters);
    router.replace(qs ? `/explore?${qs}` : "/explore", { scroll: false });
    fetchPlaces(filters);
  }, [filters, fetchPlaces, router]);

  const center = useMemo(() => {
    if (filters.citySlug) {
      const c = cities.find((x) => x.slug === filters.citySlug);
      if (c) return { lat: c.lat, lng: c.lng };
    }
    return undefined;
  }, [filters.citySlug, cities]);

  const counts = useMemo(() => {
    const live = places.filter((p) => p.liveStatus.active).length;
    const ending = places.filter(
      (p) => p.liveStatus.active && (p.liveStatus.endsInMin ?? 999) <= 90
    ).length;
    return { live, ending };
  }, [places]);

  return (
    <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-8 lg:pt-12">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="chip mono text-[10px] mb-2"><MapPin size={11} /> Explore</p>
          <h1 className="display text-3xl md:text-4xl lg:text-5xl tracking-tight">
            Find your spot.<br />
            <span className="ember-text">Right now.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/55">
          <span className="chip"><span className="w-1.5 h-1.5 bg-ember-400 rounded-full animate-pulse-slow" /> {counts.live} live</span>
          <span className="chip">{counts.ending} ending soon</span>
        </div>
      </div>

      <div className="mt-6">
        <AiSearchBar
          onResult={(f, why) => {
            setRationale(why);
            setFilters({ ...filters, ...f });
          }}
        />
        {rationale && (
          <p className="mt-2 text-xs text-white/45 italic">
            ✨ {rationale}
          </p>
        )}
      </div>

      <div className="mt-5">
        <CityChips cities={cities} activeSlug={filters.citySlug} />
      </div>

      <div className="mt-4">
        <FilterBar value={filters} onChange={setFilters} />
      </div>

      {/* View toggle */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-white/55">
          {loading ? "Loading…" : `${places.length} ${places.length === 1 ? "place" : "places"}`}
        </p>
        <div className="inline-flex items-center bg-ink-800/60 border border-white/[0.06] rounded-full p-0.5 text-xs">
          {(["split", "list", "map"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 rounded-full capitalize flex items-center gap-1",
                view === v ? "bg-white/[0.08] text-white" : "text-white/55 hover:text-white"
              )}
            >
              {v === "list" && <List size={12} />}
              {v === "map" && <Map size={12} />}
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div
        className={cn(
          "mt-4 grid gap-6",
          view === "split" && "lg:grid-cols-[1fr_1.1fr]",
          view === "list" && "grid-cols-1",
          view === "map" && "grid-cols-1"
        )}
      >
        {view !== "map" && (
          <div className="space-y-4">
            {loading ? (
              <SkeletonList />
            ) : places.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center text-white/55">
                <p className="display text-xl">No spots match those filters.</p>
                <p className="text-sm mt-2">Try removing a filter or asking the AI search above.</p>
              </div>
            ) : (
              <div className={cn(
                "grid gap-4",
                view === "split" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              )}>
                {places.map((p) => <PlaceCard key={p.id} place={p} />)}
              </div>
            )}
          </div>
        )}
        {view !== "list" && (
          <div className={cn(view === "split" && "lg:sticky lg:top-20 lg:self-start")}>
            <MapView places={places} center={center} />
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-white/[0.06]">
          <div className="aspect-[16/10] skeleton" />
          <div className="p-4 space-y-2">
            <div className="h-4 w-3/4 skeleton rounded" />
            <div className="h-3 w-1/2 skeleton rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
