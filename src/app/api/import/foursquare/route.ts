/**
 * POST /api/import/foursquare
 *
 * Admin-only. Imports venues from Foursquare into the database for one
 * city, then de-dupes and upserts them.
 *
 * Body: { citySlug?: string, cityName?: string, limit?: number }
 *
 * Auth: requires the ADMIN_TOKEN (header `x-admin-token` or `?token=`).
 * Rate limited so it cannot be hammered against the Foursquare API.
 *
 * This route must NEVER be called from the public client without the
 * admin token — the gate below enforces that.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, rateLimit } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";
import { searchFoursquareVenues, isFoursquareConfigured } from "@/lib/providers/foursquare";
import { importPlaces } from "@/lib/importService";

export const dynamic = "force-dynamic";

const Body = z.object({
  citySlug: z.string().optional(),
  cityName: z.string().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const limited = rateLimit("import:foursquare", 6, 60_000);
  if (limited) return limited;

  if (!isFoursquareConfigured()) {
    return NextResponse.json(
      { error: "FOURSQUARE_API_KEY is not set on the server." },
      { status: 503 }
    );
  }

  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { citySlug, cityName, limit } = parsed.data;
  if (!citySlug && !cityName) {
    return NextResponse.json(
      { error: "Provide citySlug or cityName." },
      { status: 400 }
    );
  }

  const prisma = getPrisma();
  const city = await prisma.city.findFirst({
    where: citySlug
      ? { slug: citySlug }
      : { name: { equals: cityName, mode: "insensitive" } },
  });
  if (!city) {
    return NextResponse.json(
      { error: `City not found: ${citySlug ?? cityName}` },
      { status: 404 }
    );
  }

  try {
    const venues = await searchFoursquareVenues({
      near: `${city.name}, ${city.state}`,
      lat: city.lat,
      lng: city.lng,
      cityId: city.id,
      limit,
    });
    const summary = await importPlaces(city.id, venues, "foursquare");
    return NextResponse.json({ ...summary, city: city.name });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        provider: "foursquare",
        city: city.name,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [err instanceof Error ? err.message : String(err)],
      },
      { status: 502 }
    );
  }
}
