import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/db";
import type { SearchFilters } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const get = (k: string) => url.searchParams.get(k);
  const filters: SearchFilters = {
    citySlug:      get("citySlug")     ?? undefined,
    q:             get("q")            ?? undefined,
    happeningNow:  get("happeningNow") === "1",
    endingSoon:    get("endingSoon")   === "1",
    startsSoon:    get("startsSoon")   === "1",
    dealType:      (get("dealType")    as any) ?? undefined,
    minRating:     get("minRating")    ? Number(get("minRating")) : undefined,
    maxPrice:      get("maxPrice")     ? (Number(get("maxPrice")) as 1|2|3|4) : undefined,
    vibes:         get("vibes")        ? get("vibes")!.split(",").filter(Boolean) : undefined,
    sort:          (get("sort")        as any) ?? undefined
  };
  const lat = get("lat"), lng = get("lng"), radius = get("radiusKm");
  if (lat && lng) {
    filters.near = {
      lat: Number(lat),
      lng: Number(lng),
      radiusKm: radius ? Number(radius) : undefined
    };
  }

  const results = await searchPlaces(filters);
  return NextResponse.json({ count: results.length, results });
}
