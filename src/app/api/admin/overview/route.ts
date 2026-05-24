/**
 * GET /api/admin/overview
 *
 * Returns aggregate counts, data-health per city, recently-synced places,
 * and unverified deals for the admin dashboard. All in one round-trip.
 *
 * Admin-only (requires ADMIN_TOKEN).
 * Falls back to zeroed-out counts when no database is configured (dev).
 */
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getPrismaOrNull } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const p = getPrismaOrNull();

  if (!p) {
    return NextResponse.json({
      noDatabase: true,
      counts: { places: 0, deals: 0, events: 0, submissions: 0, claims: 0 },
      cityHealth: [],
      recentlySynced: [],
      unverifiedDeals: [],
    });
  }

  const [
    placeCount,
    dealCount,
    eventCount,
    submissionCount,
    claimCount,
    cities,
    recentlySynced,
    unverifiedDeals,
  ] = await Promise.all([
    p.place.count(),
    p.deal.count(),
    p.event.count(),
    p.submission.count(),
    p.businessClaim.count(),
    p.city.findMany({
      include: {
        _count: {
          select: { places: true, events: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    p.place.findMany({
      where: { lastSyncedAt: { not: null } },
      orderBy: { lastSyncedAt: "desc" },
      take: 20,
      select: {
        id: true,
        slug: true,
        name: true,
        source: true,
        isVerified: true,
        rating: true,
        reviewCount: true,
        lastSyncedAt: true,
        city: { select: { name: true, slug: true } },
      },
    }),
    p.deal.findMany({
      where: { verified: false },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { place: { select: { id: true, slug: true, name: true } } },
    }),
  ]);

  // Per-city data health
  const cityHealth = await Promise.all(
    cities.map(async (city: { id: string; slug: string; name: string; _count: { places: number; events: number } }) => {
      const [verifiedPlaces, unverifiedDealsCount] = await Promise.all([
        p.place.count({ where: { cityId: city.id, isVerified: true } }),
        p.deal.count({
          where: { verified: false, place: { cityId: city.id } },
        }),
      ]);
      return {
        id: city.id,
        slug: city.slug,
        name: city.name,
        places: city._count.places,
        events: city._count.events,
        verifiedPlaces,
        unverifiedDeals: unverifiedDealsCount,
      };
    })
  );

  return NextResponse.json({
    noDatabase: false,
    counts: {
      places: placeCount,
      deals: dealCount,
      events: eventCount,
      submissions: submissionCount,
      claims: claimCount,
    },
    cityHealth,
    recentlySynced,
    unverifiedDeals,
  });
}
