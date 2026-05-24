export type DealType = "FOOD" | "DRINK" | "BOTH" | "EVENT";

export interface DealWindow {
  day: "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
  start: string; // "16:00"
  end: string;   // "19:00"
}

export interface City {
  id: string;
  slug: string;
  name: string;
  state: string;
  country?: string;
  lat: number;
  lng: number;
  blurb?: string;
  heroImage?: string;
}

export interface Place {
  id: string;
  slug: string;
  name: string;
  cityId: string;
  neighborhood?: string;
  address: string;
  zip?: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  imageUrl?: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  vibeTags: string[];
  cuisineTags: string[];
  isFeatured: boolean;
  isClaimed: boolean;
  isVerified: boolean;
  /* provenance — present on externally-imported rows */
  source?: string | null;
  sourceId?: string | null;
  confidenceScore?: number | null;
  lastSyncedAt?: Date | string | null;
}

export interface Deal {
  id: string;
  placeId: string;
  title: string;
  description?: string;
  type: DealType;
  schedule: DealWindow[];
  startsAt?: Date | string | null;
  endsAt?: Date | string | null;
  priceHint?: string;
  verified?: boolean;
  source?: string;
  confidenceScore?: number | null;
}

export interface Event {
  id: string;
  cityId: string;
  placeId?: string;
  title: string;
  description?: string;
  category: string;
  startsAt: Date | string;
  endsAt?: Date | string;
  isFree: boolean;
  imageUrl?: string;
  venueName?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  url?: string | null;
  source?: string | null;
  sourceId?: string | null;
  lastSyncedAt?: Date | string | null;
}

/** Computed shape returned by the API to the UI. */
export interface PlaceWithDeals extends Place {
  city: Pick<City, "id" | "slug" | "name" | "state">;
  deals: Deal[];
  /** Distance from the user (km) if provided. */
  distanceKm?: number;
  /** Active right now? */
  liveStatus: { active: boolean; endsInMin?: number; startsInMin?: number };
}

export interface SearchFilters {
  citySlug?: string;
  q?: string;
  neighborhood?: string;
  happeningNow?: boolean;
  endingSoon?: boolean;
  startsSoon?: boolean;
  dealType?: DealType | "ANY";
  minRating?: number;
  maxPrice?: 1 | 2 | 3 | 4;
  vibes?: string[];
  near?: { lat: number; lng: number; radiusKm?: number };
  sort?: "best-match" | "rating" | "distance" | "ending-soon";
}

/** Standard shape returned by every admin import route. */
export interface ImportSummary {
  ok: boolean;
  provider: string;
  city?: string;
  imported: number;
  updated: number;
  skipped: number;
  errors: string[];
}

/** A venue normalized into CitySip's internal shape by a provider module. */
export interface NormalizedPlace {
  name: string;
  slug: string;
  cityId: string;
  address: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  imageUrl?: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  reviewCount: number;
  vibeTags: string[];
  cuisineTags: string[];
  source: string;
  sourceId: string;
  confidenceScore?: number;
}

/** An event normalized into CitySip's internal shape by a provider module. */
export interface NormalizedEvent {
  cityId: string;
  title: string;
  description?: string;
  category: string;
  startsAt: string;
  endsAt?: string;
  isFree: boolean;
  imageUrl?: string;
  venueName?: string;
  address?: string;
  lat?: number;
  lng?: number;
  url?: string;
  source: string;
  sourceId: string;
}
