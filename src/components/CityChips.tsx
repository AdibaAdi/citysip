"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { City } from "@/types";

/**
 * Horizontal scrollable list of city chips.
 *
 * Two modes:
 *  - Link mode (default): each chip navigates to /city/[slug].
 *  - Select mode: pass `onSelect` and chips become buttons that call it.
 *    Used on /explore so picking a city filters in place (and the map
 *    recenters immediately) instead of leaving the page.
 */
export default function CityChips({
  cities,
  activeSlug,
  onSelect,
  showAll = false
}: {
  cities: City[];
  activeSlug?: string;
  onSelect?: (slug: string | undefined) => void;
  showAll?: boolean;
}) {
  if (onSelect) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
        {showAll && (
          <button
            onClick={() => onSelect(undefined)}
            className={cn("chip shrink-0", !activeSlug && "chip-active")}
          >
            All cities
          </button>
        )}
        {cities.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.slug)}
            className={cn(
              "chip shrink-0",
              activeSlug === c.slug && "chip-active"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
      {cities.map((c) => (
        <Link
          key={c.id}
          href={`/city/${c.slug}`}
          className={cn("chip shrink-0", activeSlug === c.slug && "chip-active")}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
