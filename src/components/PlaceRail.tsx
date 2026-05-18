import type { PlaceWithDeals } from "@/types";
import PlaceCard from "./PlaceCard";

export default function PlaceRail({
  title,
  caption,
  places,
  emptyText = "Nothing here right now — try a different filter."
}: {
  title: string;
  caption?: string;
  places: PlaceWithDeals[];
  emptyText?: string;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="display text-2xl md:text-3xl tracking-tight">{title}</h2>
          {caption && <p className="text-sm text-white/55 mt-1">{caption}</p>}
        </div>
      </div>
      {places.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-white/50 text-sm">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {places.slice(0, 8).map((p) => (
            <PlaceCard key={p.id} place={p} />
          ))}
        </div>
      )}
    </section>
  );
}
