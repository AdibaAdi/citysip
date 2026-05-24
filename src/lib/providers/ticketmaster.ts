/**
 * Ticketmaster Discovery API provider.
 *
 * Searches Ticketmaster for events in a city and normalizes them into
 * CitySip's internal Event shape.
 *
 * Docs: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 *
 * Server-side ONLY. Reads TICKETMASTER_API_KEY from process.env.
 */
import type { NormalizedEvent } from "@/types";

const TM_BASE = "https://app.ticketmaster.com/discovery/v2/events.json";

/** True when a Ticketmaster API key is configured. */
export function isTicketmasterConfigured(): boolean {
  return !!process.env.TICKETMASTER_API_KEY;
}

export interface TicketmasterSearchInput {
  /** City name, e.g. "Chicago". */
  city: string;
  /** The CitySip city id these events will be attached to. */
  cityId: string;
  /** Max events to request (Ticketmaster page size, capped at 50). */
  limit?: number;
}

interface TmEvent {
  id: string;
  name: string;
  url?: string;
  info?: string;
  images?: { url: string; width: number; ratio?: string }[];
  dates?: {
    start?: { dateTime?: string; localDate?: string };
    end?: { dateTime?: string };
  };
  classifications?: {
    segment?: { name?: string };
    genre?: { name?: string };
  }[];
  priceRanges?: { min?: number }[];
  _embedded?: {
    venues?: {
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
      location?: { latitude?: string; longitude?: string };
    }[];
  };
}

/** Maps a Ticketmaster classification to a CitySip event category. */
function deriveCategory(ev: TmEvent): string {
  const seg = ev.classifications?.[0]?.segment?.name?.toLowerCase() ?? "";
  const genre = ev.classifications?.[0]?.genre?.name?.toLowerCase() ?? "";
  if (seg.includes("music") || genre.includes("music")) return "live-music";
  if (seg.includes("sports")) return "sports";
  if (genre.includes("comedy")) return "comedy";
  if (genre.includes("trivia")) return "trivia";
  if (genre.includes("karaoke")) return "karaoke";
  return "live-music";
}

/** Picks a reasonably large 16:9 image from the Ticketmaster image set. */
function pickImage(images?: { url: string; width: number; ratio?: string }[]): string | undefined {
  if (!images?.length) return undefined;
  const wide = images
    .filter((i) => i.ratio === "16_9")
    .sort((a, b) => b.width - a.width);
  return (wide[0] ?? images.sort((a, b) => b.width - a.width)[0])?.url;
}

/**
 * Searches Ticketmaster and returns events normalized into NormalizedEvent.
 * Throws a descriptive Error if the key is missing or the API errors.
 */
export async function searchTicketmasterEvents(
  input: TicketmasterSearchInput
): Promise<NormalizedEvent[]> {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) {
    throw new Error(
      "TICKETMASTER_API_KEY is not set. Add it to your environment to import events."
    );
  }

  const params = new URLSearchParams({
    apikey: key,
    city: input.city,
    size: String(Math.min(input.limit ?? 30, 50)),
    sort: "date,asc",
    classificationName: "music,comedy,sports",
  });

  const res = await fetch(`${TM_BASE}?${params.toString()}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Ticketmaster API error ${res.status}: ${detail.slice(0, 200) || res.statusText}`
    );
  }

  const data = (await res.json()) as { _embedded?: { events?: TmEvent[] } };
  const events = data._embedded?.events ?? [];

  return events
    .map((ev): NormalizedEvent | null => {
      const startsAt = ev.dates?.start?.dateTime ?? ev.dates?.start?.localDate;
      if (!startsAt) return null;

      const venue = ev._embedded?.venues?.[0];
      const lat = venue?.location?.latitude;
      const lng = venue?.location?.longitude;
      const minPrice = ev.priceRanges?.[0]?.min;

      return {
        cityId: input.cityId,
        title: ev.name,
        description: ev.info?.slice(0, 280),
        category: deriveCategory(ev),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: ev.dates?.end?.dateTime
          ? new Date(ev.dates.end.dateTime).toISOString()
          : undefined,
        isFree: minPrice != null ? minPrice === 0 : false,
        imageUrl: pickImage(ev.images),
        venueName: venue?.name,
        address: venue?.address?.line1,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined,
        url: ev.url,
        source: "ticketmaster",
        sourceId: ev.id,
      };
    })
    .filter((e): e is NormalizedEvent => e !== null);
}
