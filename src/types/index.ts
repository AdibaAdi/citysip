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
