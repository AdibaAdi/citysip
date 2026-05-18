import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCityBySlug, listCities, searchPlaces, listEvents } from "@/lib/db";
import PlaceRail from "@/components/PlaceRail";
import CityChips from "@/components/CityChips";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  return {
    title: city ? `${city.name} happy hours · CitySip` : "CitySip"
  };
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  if (!city) notFound();

  const [cities, all, live, ending, events] = await Promise.all([
    listCities(),
    searchPlaces({ citySlug: city.slug }),
    searchPlaces({ citySlug: city.slug, happeningNow: true }),
    searchPlaces({ citySlug: city.slug, endingSoon: true, sort: "ending-soon" }),
    listEvents(city.slug)
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="h-[260px] md:h-[340px] relative overflow-hidden">
          {city.heroImage && (
            <img src={city.heroImage} alt={city.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-ink-950/30" />
        </div>
        <div className="mx-auto max-w-7xl px-5 lg:px-8 -mt-32 md:-mt-40 relative">
          <p className="chip mono text-[10px] mb-3">{city.state} · {city.country ?? "US"}</p>
          <h1 className="display text-5xl md:text-7xl tracking-tight">
            {city.name}
          </h1>
          {city.blurb && <p className="mt-3 text-white/70 max-w-xl">{city.blurb}</p>}
          <div className="mt-5 flex gap-3 flex-wrap">
            <Link href={`/explore?citySlug=${city.slug}&happeningNow=1`} className="ember-btn">
              Live now in {city.name.split(" ")[0]} <ArrowRight size={16} />
            </Link>
            <Link href={`/explore?citySlug=${city.slug}`} className="ghost-btn">
              Browse all places
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-8 mt-10">
        <CityChips cities={cities} activeSlug={city.slug} />

        <PlaceRail
          title="Happening now"
          caption={`Live deals across ${city.name}.`}
          places={live}
        />

        <PlaceRail
          title="Ending soon"
          caption="Last call within 90 minutes."
          places={ending}
        />

        <PlaceRail
          title={`All places in ${city.name}`}
          places={all}
        />

        {/* Events in this city */}
        {events.length > 0 && (
          <section className="mt-16">
            <h2 className="display text-3xl tracking-tight mb-5">Events in {city.name}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((e) => (
                <div key={e.id} className="glass rounded-2xl overflow-hidden">
                  {e.imageUrl && <img src={e.imageUrl} alt={e.title} className="w-full aspect-video object-cover opacity-80" />}
                  <div className="p-4">
                    <span className="chip text-[10px] uppercase tracking-[0.14em]">{e.category}</span>
                    <p className="display text-lg mt-2">{e.title}</p>
                    <p className="text-xs text-white/55 mt-1">
                      {e.placeName ?? city.name} ·{" "}
                      {new Date(e.startsAt).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}{" "}
                      · {new Date(e.startsAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
