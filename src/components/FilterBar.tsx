"use client";

import { cn } from "@/lib/utils";
import type { SearchFilters } from "@/types";
import { Flame, Clock, Wine, UtensilsCrossed, Sparkles, X } from "lucide-react";

const VIBES = [
  "rooftop", "date-night", "after-work", "groups",
  "networking", "patio", "cocktails", "craft-beer",
  "wine", "student-budget", "sports"
];

export default function FilterBar({
  value,
  onChange
}: {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
}) {
  const toggle = (k: keyof SearchFilters, v: any) =>
    onChange({ ...value, [k]: value[k] === v ? undefined : v });

  const toggleVibe = (v: string) => {
    const has = value.vibes?.includes(v) ?? false;
    const next = has
      ? (value.vibes ?? []).filter((x) => x !== v)
      : [...(value.vibes ?? []), v];
    onChange({ ...value, vibes: next.length ? next : undefined });
  };

  const reset = () =>
    onChange({ q: value.q, citySlug: value.citySlug });

  const hasFilters =
    value.happeningNow || value.endingSoon || value.startsSoon ||
    value.dealType || value.minRating || value.maxPrice ||
    (value.vibes && value.vibes.length > 0);

  return (
    <div className="glass rounded-2xl p-3 lg:p-4 space-y-3">
      {/* Quick toggles */}
      <div className="flex flex-wrap gap-2">
        <Toggle
          active={!!value.happeningNow}
          onClick={() => toggle("happeningNow", true)}
          icon={<Flame size={13} />}
        >
          Happening now
        </Toggle>
        <Toggle
          active={!!value.endingSoon}
          onClick={() => toggle("endingSoon", true)}
          icon={<Clock size={13} />}
        >
          Ending soon
        </Toggle>
        <Toggle
          active={!!value.startsSoon}
          onClick={() => toggle("startsSoon", true)}
          icon={<Sparkles size={13} />}
        >
          Starts soon
        </Toggle>

        <span className="hidden sm:block w-px h-6 self-center bg-white/10 mx-1" />

        <Toggle
          active={value.dealType === "FOOD"}
          onClick={() => toggle("dealType", "FOOD")}
          icon={<UtensilsCrossed size={13} />}
        >
          Food
        </Toggle>
        <Toggle
          active={value.dealType === "DRINK"}
          onClick={() => toggle("dealType", "DRINK")}
          icon={<Wine size={13} />}
        >
          Drinks
        </Toggle>
        <Toggle
          active={value.dealType === "BOTH"}
          onClick={() => toggle("dealType", "BOTH")}
        >
          Food + Drinks
        </Toggle>

        {hasFilters && (
          <button
            onClick={reset}
            className="ml-auto text-xs text-white/50 hover:text-white inline-flex items-center gap-1"
          >
            <X size={12} /> Reset
          </button>
        )}
      </div>

      {/* Price + rating + sort */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-white/40 uppercase tracking-[0.18em] mr-1">Price</span>
        {[1, 2, 3, 4].map((p) => (
          <button
            key={p}
            onClick={() => toggle("maxPrice", p)}
            className={cn(
              "chip mono",
              value.maxPrice === p && "chip-active"
            )}
          >
            {"$".repeat(p)}
          </button>
        ))}

        <span className="ml-2 text-white/40 uppercase tracking-[0.18em] mr-1">Min ★</span>
        {[3.5, 4.0, 4.5].map((r) => (
          <button
            key={r}
            onClick={() => toggle("minRating", r)}
            className={cn(
              "chip mono",
              value.minRating === r && "chip-active"
            )}
          >
            {r.toFixed(1)}+
          </button>
        ))}

        <span className="ml-auto flex items-center gap-2">
          <span className="text-white/40 uppercase tracking-[0.18em]">Sort</span>
          <select
            value={value.sort ?? "best-match"}
            onChange={(e) => onChange({ ...value, sort: e.target.value as any })}
            className="bg-ink-800 border border-white/10 rounded-full text-xs px-3 py-1 text-white/80"
          >
            <option value="best-match">Best match</option>
            <option value="rating">Top rated</option>
            <option value="ending-soon">Ending soon</option>
            <option value="distance">Nearest</option>
          </select>
        </span>
      </div>

      {/* Vibe tags */}
      <div className="flex flex-wrap gap-1.5">
        {VIBES.map((v) => {
          const active = value.vibes?.includes(v);
          return (
            <button
              key={v}
              onClick={() => toggleVibe(v)}
              className={cn("chip", active && "chip-active")}
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({
  active, onClick, icon, children
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className={cn("chip", active && "chip-active")}>
      {icon}{children}
    </button>
  );
}
