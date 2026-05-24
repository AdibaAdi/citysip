/**
 * POST /api/import/events
 *
 * Admin-only. Imports events from Ticketmaster into the database for one
 * city, de-duped on (source, sourceId).
 *
 * Body: { citySlug?: string, cityName?: string, limit?: number }
 *
 * Auth: requires the ADMIN_TOKEN (header `x-admin-token` or `?token=`).
 * Rate limited so it cannot be hammered against the Ticketmaster API.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, rateLimit } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";
import {
  searchTicketmasterEvents,
  isTicketmasterConfigured,
} from "@/lib/providers/ticketmaster";
import { importEvents } from "@/lib/importService";

export const dynamic = "force-dynamic";

const Body = z.object({
  citySlug: z.string().optional(),
  cityName: z.string().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const limited = rateLimit("import:events", 6, 60_000);
  if (limited) return limited;

  if (!isTicketmasterConfigured()) {
    return NextResponse.json(
      { error: "TICKETMASTER_API_KEY is not set on the server." },
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
    const events = await searchTicketmasterEvents({
      city: city.name,
      cityId: city.id,
      limit,
    });
    const summary = await importEvents(city.id, events, "ticketmaster");
    return NextResponse.json({ ...summary, city: city.name });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        provider: "ticketmaster",
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
