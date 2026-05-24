/**
 * Google Places provider — STUB.
 *
 * Not yet implemented. CitySip intentionally ships without a hard Google
 * Maps / Places dependency to stay on the free tier (Google Places billing
 * requires a credit card and can incur real charges).
 *
 * This module exists so the provider interface is complete and import
 * code can reference it without runtime errors. Implement later if you
 * want Google as an additional venue source.
 *
 * Server-side ONLY. Would read GOOGLE_PLACES_API_KEY from process.env.
 *
 * TODO: implement using the Places API (New) Text Search endpoint:
 *   https://places.googleapis.com/v1/places:searchText
 * Remember to normalize results into NormalizedPlace, map the 0-5 rating
 * and 0-4 priceLevel directly, and set source: "googlePlaces".
 */
import type { NormalizedPlace } from "@/types";

/** True when a Google Places API key is configured. */
export function isGooglePlacesConfigured(): boolean {
  return !!process.env.GOOGLE_PLACES_API_KEY;
}

export interface GooglePlacesSearchInput {
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
export async function searchGooglePlacesVenues(
  _input: GooglePlacesSearchInput
): Promise<NormalizedPlace[]> {
  // TODO: implement Google Places (New) Text Search.
  console.warn("[googlePlaces] provider is a stub — returning no results.");
  return [];
}
