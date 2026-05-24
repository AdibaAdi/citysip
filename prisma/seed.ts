import { PrismaClient } from "@prisma/client";
import { CITIES, PLACES, DEALS, EVENTS } from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CitySip…");

  for (const c of CITIES) {
    await prisma.city.upsert({
      where: { id: c.id },
      update: { name: c.name, state: c.state, lat: c.lat, lng: c.lng },
      create: {
        id: c.id, slug: c.slug, name: c.name, state: c.state,
        lat: c.lat, lng: c.lng, blurb: c.blurb ?? null, heroImage: c.heroImage ?? null
      }
    });
  }

  for (const p of PLACES) {
    await prisma.place.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id, slug: p.slug, name: p.name, cityId: p.cityId,
        neighborhood: p.neighborhood ?? null, address: p.address, zip: p.zip ?? null,
        lat: p.lat, lng: p.lng, phone: p.phone ?? null, website: p.website ?? null,
        imageUrl: p.imageUrl ?? null, priceLevel: p.priceLevel, rating: p.rating,
        reviewCount: p.reviewCount, vibeTags: p.vibeTags, cuisineTags: p.cuisineTags,
        isFeatured: p.isFeatured, isClaimed: p.isClaimed, isVerified: p.isVerified,
        source: "manual", confidenceScore: 1.0
      }
    });
  }

  for (const d of DEALS) {
    await prisma.deal.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id, placeId: d.placeId, title: d.title,
        description: d.description ?? null, type: d.type,
        schedule: d.schedule as any,
        priceHint: d.priceHint ?? null,
        verified: true,   // seed deals are considered verified by default
        source: "manual"
      }
    });
  }

  for (const e of EVENTS) {
    await prisma.event.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id, cityId: e.cityId, placeId: e.placeId ?? null,
        title: e.title, description: e.description ?? null, category: e.category,
        startsAt: e.startsAt, endsAt: e.endsAt ?? null, isFree: e.isFree,
        imageUrl: e.imageUrl ?? null, source: "manual"
      }
    });
  }

  console.log(`✅ Seeded ${CITIES.length} cities, ${PLACES.length} places, ${DEALS.length} deals, ${EVENTS.length} events.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
