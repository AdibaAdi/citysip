import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { PlaceWithDeals } from "@/types";
import { formatDistance, priceLevelToDollar } from "@/lib/utils";
import LiveBadge from "./LiveBadge";

export default function PlaceCard({ place }: { place: PlaceWithDeals }) {
  const topDeal = place.deals[0];
  return (
    <Link
      href={`/place/${place.slug}`}
      className="group block glass rounded-2xl overflow-hidden hover:border-ember-500/30 transition shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
        {place.imageUrl && (
          <img
            src={place.imageUrl}
            alt={place.name}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition duration-700"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

        <div className="absolute top-3 left-3 flex gap-2">
          <LiveBadge status={place.liveStatus} />
          {place.isFeatured && (
            <span className="chip border-amber2/40 bg-amber2/10 text-amber2">
              ★ Featured
            </span>
          )}
        </div>

        {place.distanceKm != null && (
          <div className="absolute top-3 right-3 chip">
            <MapPin size={12} /> {formatDistance(place.distanceKm)}
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="display text-xl text-white drop-shadow">
            {place.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-amber2 text-amber2" />
              {place.rating.toFixed(1)}
            </span>
            <span className="text-white/30">·</span>
            <span>{priceLevelToDollar(place.priceLevel)}</span>
            <span className="text-white/30">·</span>
            <span className="truncate">{place.neighborhood}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {topDeal ? (
          <div>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-white/90 leading-tight">
                {topDeal.title}
              </p>
              {topDeal.priceHint && (
                <span className="mono text-[11px] text-ember-300 shrink-0">
                  {topDeal.priceHint}
                </span>
              )}
            </div>
            {topDeal.description && (
              <p className="text-xs text-white/55 mt-1.5 line-clamp-2">
                {topDeal.description}
              </p>
            )}
          </div>
        ) : (
          <p className="text-xs text-white/40">No deal information yet.</p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-3">
          {place.vibeTags.slice(0, 3).map((v) => (
            <span key={v} className="chip text-[10px]">
              {v}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
