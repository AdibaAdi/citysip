/**
 * CitySip data layer.
 *
 * If DATABASE_URL is set we use Prisma. Otherwise we transparently
 * fall back to in-memory mock data so the app boots with zero setup.
 *
 * Every public function returns the same shape regardless of source.
 */
import type {
  City, Place, Deal, Event,
  PlaceWithDeals, SearchFilters
} from "@/types";
import { CITIES, PLACES, DEALS, EVENTS } from "@/data/seed-data";
import {
  haversineKm, placeLiveStatus, rankScore
} from "@/lib/utils";

const useDb = !!process.env.DATABASE_URL;

let prisma: any = null;
async function getPrisma() {
  if (!useDb) return null;
  if (prisma) return prisma;
  const { PrismaClient } = await import("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prisma = (globalThis as any)._prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") (globalThis as any)._prisma = prisma;
  return prisma;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Cities                                                              */
/* ─────────────────────────────────────────────────────────────────── */
export async function listCities(): Promise<City[]> {
  const p = await getPrisma();
  if (p) return p.city.findMany({ orderBy: { name: "asc" } });
  return [...CITIES].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const p = await getPrisma();
  if (p) return p.city.findUnique({ where: { slug } });
  return CITIES.find((c) => c.slug === slug) ?? null;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Places + deals                                                      */
/* ─────────────────────────────────────────────────────────────────── */
async function rawPlaces(): Promise<{ places: Place[]; deals: Deal[] }> {
  const p = await getPrisma();
  if (p) {
    const [places, deals] = await Promise.all([
      p.place.findMany(),
      p.deal.findMany()
    ]);
    return { places, deals: deals.map((d: any) => ({ ...d, schedule: d.schedule })) };
  }
  return { places: PLACES, deals: DEALS };
}

function decorate(
  places: Place[],
  dealsByPlace: Map<string, Deal[]>,
  cityById: Map<string, City>,
  near?: { lat: number; lng: number }
): PlaceWithDeals[] {
  return places.map((pl) => {
    const deals = dealsByPlace.get(pl.id) ?? [];
    const live = placeLiveStatus(deals);
    const city = cityById.get(pl.cityId);
    return {
      ...pl,
      city: city
        ? { id: city.id, slug: city.slug, name: city.name, state: city.state }
        : { id: pl.cityId, slug: "", name: "", state: "" },
      deals,
      liveStatus: live,
      distanceKm: near ? haversineKm(near, { lat: pl.lat, lng: pl.lng }) : undefined
    };
  });
}

export async function searchPlaces(filters: SearchFilters): Promise<PlaceWithDeals[]> {
  const { places, deals } = await rawPlaces();
  const cities = await listCities();
  const cityById = new Map(cities.map((c) => [c.id, c]));
  const citiesBySlug = new Map(cities.map((c) => [c.slug, c]));

  const dealsByPlace = new Map<string, Deal[]>();
  for (const d of deals) {
    const arr = dealsByPlace.get(d.placeId) ?? [];
    arr.push(d);
    dealsByPlace.set(d.placeId, arr);
  }

  let candidates = places;

  if (filters.citySlug) {
    const city = citiesBySlug.get(filters.citySlug);
    if (city) candidates = candidates.filter((p) => p.cityId === city.id);
  }

  if (filters.q) {
    const q = filters.q.toLowerCase();
    candidates = candidates.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.neighborhood?.toLowerCase().includes(q) ||
        p.cuisineTags.some((t) => t.toLowerCase().includes(q)) ||
        p.vibeTags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters.minRating) candidates = candidates.filter((p) => p.rating >= filters.minRating!);
  if (filters.maxPrice)  candidates = candidates.filter((p) => p.priceLevel <= filters.maxPrice!);

  if (filters.vibes?.length) {
    candidates = candidates.filter((p) =>
      filters.vibes!.every((v) => p.vibeTags.includes(v))
    );
  }

  let decorated = decorate(candidates, dealsByPlace, cityById, filters.near);

  if (filters.dealType && filters.dealType !== "ANY") {
    decorated = decorated.filter((p) =>
      p.deals.some((d) =>
        filters.dealType === "BOTH" ? d.type === "BOTH" :
        d.type === filters.dealType || d.type === "BOTH"
      )
    );
  }

  if (filters.happeningNow) decorated = decorated.filter((p) => p.liveStatus.active);

  if (filters.endingSoon) {
    decorated = decorated.filter(
      (p) => p.liveStatus.active && (p.liveStatus.endsInMin ?? Infinity) <= 90
    );
  }

  if (filters.startsSoon) {
    decorated = decorated.filter(
      (p) => !p.liveStatus.active && (p.liveStatus.startsInMin ?? Infinity) <= 120
    );
  }

  if (filters.near?.radiusKm) {
    decorated = decorated.filter(
      (p) => (p.distanceKm ?? Infinity) <= filters.near!.radiusKm!
    );
  }

  const sort = filters.sort ?? "best-match";
  decorated.sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "distance") return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity);
    if (sort === "ending-soon") {
      const ax = a.liveStatus.active ? a.liveStatus.endsInMin ?? Infinity : Infinity;
      const bx = b.liveStatus.active ? b.liveStatus.endsInMin ?? Infinity : Infinity;
      return ax - bx;
    }
    // best-match
    const sa = rankScore({
      rating: a.rating,
      isActive: a.liveStatus.active,
      endsInMin: a.liveStatus.endsInMin,
      isFeatured: a.isFeatured,
      distanceKm: a.distanceKm
    });
    const sb = rankScore({
      rating: b.rating,
      isActive: b.liveStatus.active,
      endsInMin: b.liveStatus.endsInMin,
      isFeatured: b.isFeatured,
      distanceKm: b.distanceKm
    });
    return sb - sa;
  });

  return decorated;
}

export async function getPlaceById(id: string): Promise<PlaceWithDeals | null> {
  const all = await searchPlaces({});
  return all.find((p) => p.id === id || p.slug === id) ?? null;
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Events                                                              */
/* ─────────────────────────────────────────────────────────────────── */
export async function listEvents(citySlug?: string): Promise<(Event & { cityName?: string; placeName?: string })[]> {
  const p = await getPrisma();
  const cities = await listCities();
  const cityById = new Map(cities.map((c) => [c.id, c]));
  let raw: Event[];
  let places: Place[];
  if (p) {
    raw = await p.event.findMany({ orderBy: { startsAt: "asc" } });
    places = await p.place.findMany();
  } else {
    raw = EVENTS;
    places = PLACES;
  }
  const placeById = new Map(places.map((pl) => [pl.id, pl]));
  let evts = raw;
  if (citySlug) {
    const city = cities.find((c) => c.slug === citySlug);
    if (city) evts = evts.filter((e) => e.cityId === city.id);
  }
  return evts.map((e) => ({
    ...e,
    cityName: cityById.get(e.cityId)?.name,
    placeName: e.placeId ? placeById.get(e.placeId)?.name : undefined
  }));
}

/* ─────────────────────────────────────────────────────────────────── */
/*  Submissions                                                          */
/* ─────────────────────────────────────────────────────────────────── */
// In mock mode we just collect into an in-memory store; in DB mode we persist.
const mockSubmissions: any[] = [];

export async function createSubmission(input: {
  type: string;
  placeId?: string;
  payload: Record<string, unknown>;
}) {
  const p = await getPrisma();
  if (p) {
    return p.submission.create({
      data: { type: input.type, placeId: input.placeId, payload: input.payload }
    });
  }
  const record = {
    id: `s-${Date.now()}`, ...input, status: "pending",
    createdAt: new Date().toISOString()
  };
  mockSubmissions.unshift(record);
  return record;
}

export async function listSubmissions() {
  const p = await getPrisma();
  if (p) return p.submission.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return mockSubmissions;
}

export async function updateSubmissionStatus(id: string, status: "approved" | "rejected") {
  const p = await getPrisma();
  if (p) return p.submission.update({ where: { id }, data: { status } });
  const idx = mockSubmissions.findIndex((s) => s.id === id);
  if (idx >= 0) mockSubmissions[idx].status = status;
  return mockSubmissions[idx];
}
