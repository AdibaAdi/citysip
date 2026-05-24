/**
 * Foursquare Places provider.
 *
 * Searches Foursquare's Places API for venues (bars / restaurants /
 * nightlife) and normalizes them into CitySip's internal Place shape.
 *
 * Only uses fields available on the free Places API tier. No premium
 * fields (tips, detailed stats, hours-with-popularity) are requested.
 *
 * Docs: https://docs.foursquare.com/developer/reference/place-search
 *
 * Server-side ONLY. Never import this into a client component — it
 * reads FOURSQUARE_API_KEY from process.env.
 */
import { slugify } from "@/lib/utils";
import type { NormalizedPlace } from "@/types";

const FSQ_BASE = "https://api.foursquare.com/v3/places";

/** Foursquare category ids for bars / nightlife / restaurants. */
const NIGHTLIFE_CATEGORIES = [
  "13003", // Bar
  "13016", // Cocktail Bar
  "13018", // Pub
  "13019", // Sports Bar
  "13025", // Wine Bar
  "13065", // Restaurant
  "13338", // Brewery
].join(",");

export interface FoursquareSearchInput {
  /** City name, e.g. "Chicago, IL" — used as the `near` parameter. */
  near?: string;
  /** Latitude — used with `lng` as the `ll` parameter. */
  lat?: number;
  /** Longitude. */
  lng?: number;
  /** The CitySip city id these venues will be attached to. */
  cityId: string;
  /** Max results to request (Foursquare caps at 50). */
  limit?: number;
}

interface FsqPlace {
  fsq_id: string;
  name: string;
  location?: {
    address?: string;
    locality?: string;
    region?: string;
    postcode?: string;
    formatted_address?: string;
    neighborhood?: string[];
  };
  geocodes?: { main?: { latitude?: number; longitude?: number } };
  categories?: { id: number; name: string }[];
  tel?: string;
  website?: string;
  rating?: number; // 0-10 scale on Foursquare
  price?: number; // 1-4
  stats?: { total_ratings?: number };
  photos?: { prefix?: string; suffix?: string }[];
}

/** True when a Foursquare API key is configured. */
export function isFoursquareConfigured(): boolean {
  return !!process.env.FOURSQUARE_API_KEY;
}

/** Maps Foursquare category names to CitySip vibe / cuisine tags. */
function deriveTags(categories: { name: string }[] = []): {
  vibeTags: string[];
  cuisineTags: string[];
} {
  const vibeTags = new Set<string>();
  const cuisineTags = new Set<string>();
  for (const c of categories) {
    const n = c.name.toLowerCase();
    if (n.includes("cocktail")) vibeTags.add("cocktails");
    if (n.includes("wine")) vibeTags.add("wine");
    if (n.includes("brewery") || n.includes("beer")) vibeTags.add("craft-beer");
    if (n.includes("sports")) vibeTags.add("sports");
    if (n.includes("pub")) vibeTags.add("after-work");
    if (n.includes("rooftop")) vibeTags.add("rooftop");
    cuisineTags.add(c.name);
  }
  return { vibeTags: [...vibeTags], cuisineTags: [...cuisineTags] };
}

/** Builds a usable photo URL from a Foursquare photo object. */
function photoUrl(photos?: { prefix?: string; suffix?: string }[]): string | undefined {
  const p = photos?.[0];
  if (!p?.prefix || !p?.suffix) return undefined;
  return `${p.prefix}original${p.suffix}`;
}

/**
 * Searches Foursquare and returns venues normalized into NormalizedPlace.
 * Throws a descriptive Error if the key is missing or the API errors.
 */
export async function searchFoursquareVenues(
  input: FoursquareSearchInput
): Promise<NormalizedPlace[]> {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) {
    throw new Error(
      "FOURSQUARE_API_KEY is not set. Add it to your environment to import venues."
    );
  }

  const params = new URLSearchParams({
    categories: NIGHTLIFE_CATEGORIES,
    limit: String(Math.min(input.limit ?? 30, 50)),
    sort: "RELEVANCE",
    fields:
      "fsq_id,name,location,geocodes,categories,tel,website,rating,price,stats,photos",
  });
  if (typeof input.lat === "number" && typeof input.lng === "number") {
    params.set("ll", `${input.lat},${input.lng}`);
    params.set("radius", "8000"); // ~5 miles
  } else if (input.near) {
    params.set("near", input.near);
  } else {
    throw new Error("Provide either `near` (city name) or `lat`/`lng`.");
  }

  const res = await fetch(`${FSQ_BASE}/search?${params.toString()}`, {
    headers: { Authorization: key, Accept: "application/json" },
    // Never cache import calls — they are admin-triggered and rare.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Foursquare API error ${res.status}: ${detail.slice(0, 200) || res.statusText}`
    );
  }

  const data = (await res.json()) as { results?: FsqPlace[] };
  const results = data.results ?? [];

  return results
    .map((fsq): NormalizedPlace | null => {
      const lat = fsq.geocodes?.main?.latitude;
      const lng = fsq.geocodes?.main?.longitude;
      if (typeof lat !== "number" || typeof lng !== "number") return null;

      const address =
        fsq.location?.address ??
        fsq.location?.formatted_address ??
        [fsq.location?.locality, fsq.location?.region]
          .filter(Boolean)
          .join(", ") ??
        "Address unavailable";

      const { vibeTags, cuisineTags } = deriveTags(fsq.categories);
      const priceLevel = (Math.min(4, Math.max(1, fsq.price ?? 2)) as 1 | 2 | 3 | 4);
      // Foursquare rates 0-10; CitySip uses 0-5.
      const rating = fsq.rating != null ? Math.round((fsq.rating / 2) * 10) / 10 : 4.0;

      return {
        name: fsq.name,
        slug: slugify(`${fsq.name}-${fsq.fsq_id.slice(0, 6)}`),
        cityId: input.cityId,
        address,
        neighborhood: fsq.location?.neighborhood?.[0],
        lat,
        lng,
        phone: fsq.tel,
        website: fsq.website,
        imageUrl: photoUrl(fsq.photos),
        priceLevel,
        rating,
        reviewCount: fsq.stats?.total_ratings ?? 0,
        vibeTags,
        cuisineTags,
        source: "foursquare",
        sourceId: fsq.fsq_id,
        confidenceScore: 0.7, // imported metadata is decent; deals still need verifying
      };
    })
    .filter((p): p is NormalizedPlace => p !== null);
}
