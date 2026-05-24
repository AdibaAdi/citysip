/**
 * Yelp Fusion provider — STUB.
 *
 * Not yet implemented. This module exists so the provider interface is
 * complete and import code can reference it without runtime errors.
 *
 * Server-side ONLY. Would read YELP_API_KEY from process.env.
 *
 * TODO: implement using the Yelp Fusion business search endpoint:
 *   https://api.yelp.com/v3/businesses/search
 * Yelp returns rating (0-5) and price as "$"-"$$$$" strings — map the
 * price string length to priceLevel 1-4. Set source: "yelp".
 *
 * Note: Yelp's API terms restrict caching/storing some fields long-term.
 * Review https://docs.developer.yelp.com/docs/fusion-display-requirements
 * before persisting Yelp data into your database.
 */
import type { NormalizedPlace } from "@/types";

/** True when a Yelp API key is configured. */
export function isYelpConfigured(): boolean {
  return !!process.env.YELP_API_KEY;
}

export interface YelpSearchInput {
  near?: string;
  lat?: number;
  lng?: number;
  cityId: string;
  limit?: number;
}

/**
 * STUB — always returns an empty array. Does not throw, so callers that
 * loop over multiple providers keep working.
 *
 * @returns an empty NormalizedPlace[]
 */
export async function searchYelpVenues(
  _input: YelpSearchInput
): Promise<NormalizedPlace[]> {
  // TODO: implement Yelp Fusion business search.
  console.warn("[yelp] provider is a stub — returning no results.");
  return [];
}
