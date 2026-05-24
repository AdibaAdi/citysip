/**
 * Import service.
 *
 * Takes provider-normalized data and upserts it into Postgres via Prisma,
 * de-duplicating along the way. Used by the admin import routes.
 *
 * De-dup strategy:
 *  - Places: match on (source, sourceId) first → update in place.
 *            Otherwise fuzzy-match on normalized name+address within the
 *            same city → skip as a duplicate.
 *            Otherwise → create.
 *  - Events: match on (source, sourceId) → update; otherwise create.
 *
 * Imported places/events are NOT auto-verified. `isVerified` stays false
 * until an admin confirms them — happy-hour deal data in particular is
 * only trusted after admin / business / user verification.
 */
import { getPrisma } from "@/lib/prisma";
import { dedupeKey } from "@/lib/utils";
import type { ImportSummary, NormalizedEvent, NormalizedPlace } from "@/types";

/** Upserts a batch of normalized places for one city. */
export async function importPlaces(
  cityId: string,
  places: NormalizedPlace[],
  provider: string
): Promise<ImportSummary> {
  const prisma = getPrisma();
  const summary: ImportSummary = {
    ok: true,
    provider,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  // Pre-load existing places in this city for fuzzy de-dup.
  const existing = await prisma.place.findMany({
    where: { cityId },
    select: { id: true, name: true, address: true, source: true, sourceId: true },
  });
  const byFuzzy = new Map(
    existing.map((p: { id: string; name: string; address: string | null }) => [dedupeKey(p.name, p.address ?? undefined), p.id])
  );

  for (const place of places) {
    try {
      // 1. exact provider-id match → update
      if (place.source && place.sourceId) {
        const hit = await prisma.place.findUnique({
          where: {
            source_sourceId: { source: place.source, sourceId: place.sourceId },
          },
        });
        if (hit) {
          await prisma.place.update({
            where: { id: hit.id },
            data: {
              name: place.name,
              address: place.address,
              neighborhood: place.neighborhood ?? null,
              lat: place.lat,
              lng: place.lng,
              phone: place.phone ?? null,
              website: place.website ?? null,
              imageUrl: place.imageUrl ?? null,
              priceLevel: place.priceLevel,
              rating: place.rating,
              reviewCount: place.reviewCount,
              vibeTags: place.vibeTags,
              cuisineTags: place.cuisineTags,
              confidenceScore: place.confidenceScore ?? null,
              lastSyncedAt: new Date(),
            },
          });
          summary.updated += 1;
          continue;
        }
      }

      // 2. fuzzy name+address match in same city → skip duplicate
      if (byFuzzy.has(dedupeKey(place.name, place.address))) {
        summary.skipped += 1;
        continue;
      }

      // 3. create new
      // Ensure slug uniqueness (slug has a unique constraint).
      let slug = place.slug;
      if (await prisma.place.findUnique({ where: { slug } })) {
        slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      }
      await prisma.place.create({
        data: {
          slug,
          name: place.name,
          cityId,
          address: place.address,
          neighborhood: place.neighborhood ?? null,
          lat: place.lat,
          lng: place.lng,
          phone: place.phone ?? null,
          website: place.website ?? null,
          imageUrl: place.imageUrl ?? null,
          priceLevel: place.priceLevel,
          rating: place.rating,
          reviewCount: place.reviewCount,
          vibeTags: place.vibeTags,
          cuisineTags: place.cuisineTags,
          isVerified: false,
          source: place.source,
          sourceId: place.sourceId,
          confidenceScore: place.confidenceScore ?? null,
          lastSyncedAt: new Date(),
        },
      });
      byFuzzy.set(dedupeKey(place.name, place.address), "new");
      summary.imported += 1;
    } catch (err) {
      summary.errors.push(
        `${place.name}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  summary.ok = summary.errors.length === 0;
  return summary;
}

/** Upserts a batch of normalized events for one city. */
export async function importEvents(
  cityId: string,
  events: NormalizedEvent[],
  provider: string
): Promise<ImportSummary> {
  const prisma = getPrisma();
  const summary: ImportSummary = {
    ok: true,
    provider,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  for (const ev of events) {
    try {
      const hit =
        ev.source && ev.sourceId
          ? await prisma.event.findUnique({
              where: {
                source_sourceId: { source: ev.source, sourceId: ev.sourceId },
              },
            })
          : null;

      const data = {
        cityId,
        title: ev.title,
        description: ev.description ?? null,
        category: ev.category,
        startsAt: new Date(ev.startsAt),
        endsAt: ev.endsAt ? new Date(ev.endsAt) : null,
        isFree: ev.isFree,
        imageUrl: ev.imageUrl ?? null,
        venueName: ev.venueName ?? null,
        address: ev.address ?? null,
        lat: ev.lat ?? null,
        lng: ev.lng ?? null,
        url: ev.url ?? null,
        source: ev.source,
        sourceId: ev.sourceId,
        lastSyncedAt: new Date(),
      };

      if (hit) {
        await prisma.event.update({ where: { id: hit.id }, data });
        summary.updated += 1;
      } else {
        await prisma.event.create({ data });
        summary.imported += 1;
      }
    } catch (err) {
      summary.errors.push(
        `${ev.title}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  summary.ok = summary.errors.length === 0;
  return summary;
}
