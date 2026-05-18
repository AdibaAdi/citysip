"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { City } from "@/types";

export default function CityChips({
  cities,
  activeSlug
}: {
  cities: City[];
  activeSlug?: string;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
      {cities.map((c) => (
        <Link
          key={c.id}
          href={`/city/${c.slug}`}
          className={cn(
            "chip shrink-0",
            activeSlug === c.slug && "chip-active"
          )}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
