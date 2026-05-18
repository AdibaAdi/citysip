import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, MapPin, Phone, Globe, Calendar, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { getPlaceById } from "@/lib/db";
import { priceLevelToDollar, dealLiveStatus, formatLiveLabel } from "@/lib/utils";
import LiveBadge from "@/components/LiveBadge";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export const revalidate = 30;

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default async function PlacePage({ params }: { params: { id: string } }) {
  const place = await getPlaceById(params.id);
  if (!place) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 lg:px-8 pt-6 lg:pt-10">
      <Link href={`/city/${place.city.slug}`} className="inline-flex items-center gap-1 text-sm text-white/55 hover:text-white">
        <ArrowLeft size={14} /> Back to {place.city.name}
      </Link>

      <header className="mt-5 grid md:grid-cols-[1.4fr_1fr] gap-8 items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <LiveBadge status={place.liveStatus} />
            {place.isFeatured && <span className="chip text-amber2 border-amber2/40 bg-amber2/10">★ Featured</span>}
            {place.isVerified && <span className="chip text-white/60">Verified</span>}
          </div>
          <h1 className="display text-4xl md:text-6xl tracking-tight">{place.name}</h1>
          <p className="mt-2 text-white/65">
            {place.neighborhood} · {place.city.name}, {place.city.state}
          </p>
          <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
            <span className="flex items-center gap-1"><Star size={14} className="fill-amber2 text-amber2" /> {place.rating.toFixed(1)} <span className="text-white/40">({place.reviewCount})</span></span>
            <span className="text-white/30">·</span>
            <span className="mono">{priceLevelToDollar(place.priceLevel)}</span>
            {place.cuisineTags.length > 0 && (
              <>
                <span className="text-white/30">·</span>
                <span>{place.cuisineTags.join(" · ")}</span>
              </>
            )}
          </div>
        </div>
        <div className="aspect-[4/3] rounded-2xl overflow-hidden">
          {place.imageUrl && <img src={place.imageUrl} className="w-full h-full object-cover" alt={place.name} />}
        </div>
      </header>

      <div className="mt-8 grid md:grid-cols-[1.4fr_1fr] gap-8">
        {/* Left: deals + map */}
        <div>
          <h2 className="display text-2xl mb-4">Happy hours & deals</h2>
          <div className="space-y-3">
            {place.deals.length === 0 && (
              <p className="text-sm text-white/55">No deals listed yet. Be the first to <Link className="text-ember-300 hover:underline" href={`/submit?placeId=${place.id}`}>submit one</Link>.</p>
            )}
            {place.deals.map((d) => {
              const status = dealLiveStatus(d);
              return (
                <div key={d.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="display text-xl">{d.title}</p>
                      {d.description && <p className="text-sm text-white/65 mt-1">{d.description}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      {d.priceHint && <p className="mono text-ember-300">{d.priceHint}</p>}
                      <p className="text-xs text-white/55 mt-1">{formatLiveLabel(status)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const windows = (d.schedule as any[]).filter((w) => w.day === day);
                      return (
                        <span
                          key={day}
                          className={`mono text-[10px] px-2 py-1 rounded border ${
                            windows.length
                              ? "border-ember-500/40 bg-ember-500/10 text-ember-200"
                              : "border-white/[0.06] text-white/30"
                          }`}
                        >
                          {day}{" "}
                          {windows.length > 0 && (
                            <span className="text-white/55">
                              {windows.map((w) => `${w.start}-${w.end}`).join(", ")}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="display text-2xl mt-12 mb-4">Vibe & details</h2>
          <div className="glass rounded-2xl p-5">
            <div className="flex flex-wrap gap-2">
              {place.vibeTags.map((v) => <span key={v} className="chip">{v}</span>)}
            </div>
            <div className="divider my-5" />
            <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/70">
              <div className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 text-ember-300" /> {place.address}</div>
              {place.phone   && <div className="flex items-start gap-2"><Phone size={14} className="mt-0.5 text-ember-300" /> {place.phone}</div>}
              {place.website && <div className="flex items-start gap-2"><Globe size={14} className="mt-0.5 text-ember-300" /> <a className="hover:underline" href={place.website}>{place.website}</a></div>}
              <div className="flex items-start gap-2"><Calendar size={14} className="mt-0.5 text-ember-300" /> Verified deal info</div>
            </div>
          </div>
        </div>

        {/* Right: map + actions */}
        <aside className="space-y-4">
          <MapView places={[place]} center={{ lat: place.lat, lng: place.lng }} />
          <Link href={`/submit?placeId=${place.id}&type=update-deal`} className="ghost-btn w-full">
            Suggest a correction
          </Link>
          <Link href={`/business?placeId=${place.id}`} className="ember-btn w-full">
            Claim this venue
          </Link>
        </aside>
      </div>
    </div>
  );
}
