import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Deal, DealWindow } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ── geo ──────────────────────────────────────────────────────────── */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function kmToMi(km: number) {
  return km * 0.621371;
}

export function formatDistance(km?: number) {
  if (km == null) return "";
  const mi = kmToMi(km);
  return mi < 0.1 ? "<0.1 mi" : `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
}

/* ── time / deals ─────────────────────────────────────────────────── */
const DAY_INDEX: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6
};

function minutesFrom(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Returns the live status of a deal relative to `now`. */
export function dealLiveStatus(deal: Deal, now = new Date()) {
  const todayIdx = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Active right now?
  for (const w of deal.schedule as DealWindow[]) {
    if (DAY_INDEX[w.day] !== todayIdx) continue;
    const s = minutesFrom(w.start);
    const e = minutesFrom(w.end);
    if (nowMin >= s && nowMin < e) return { active: true, endsInMin: e - nowMin };
  }

  // Starts soon today?
  for (const w of deal.schedule as DealWindow[]) {
    if (DAY_INDEX[w.day] !== todayIdx) continue;
    const s = minutesFrom(w.start);
    if (s > nowMin) return { active: false, startsInMin: s - nowMin };
  }
  return { active: false };
}

/** Aggregate status across all deals at a place. */
export function placeLiveStatus(deals: Deal[], now = new Date()) {
  let bestEndsInMin: number | undefined;
  let bestStartsInMin: number | undefined;
  let active = false;
  for (const d of deals) {
    const s = dealLiveStatus(d, now);
    if (s.active) {
      active = true;
      if (bestEndsInMin == null || (s.endsInMin ?? Infinity) < bestEndsInMin) {
        bestEndsInMin = s.endsInMin;
      }
    } else if (s.startsInMin != null) {
      if (bestStartsInMin == null || s.startsInMin < bestStartsInMin) {
        bestStartsInMin = s.startsInMin;
      }
    }
  }
  return { active, endsInMin: bestEndsInMin, startsInMin: bestStartsInMin };
}

export function priceLevelToDollar(level: number) {
  return "$".repeat(Math.max(1, Math.min(4, level)));
}

/** Pretty "Ends in 45 min" / "Starts in 1h 20m" / "Ends 7:00 PM" */
export function formatLiveLabel(s: { active: boolean; endsInMin?: number; startsInMin?: number }) {
  const minStr = (n: number) => (n >= 60 ? `${Math.floor(n / 60)}h ${n % 60}m` : `${n} min`);
  if (s.active && s.endsInMin != null) return `Ends in ${minStr(s.endsInMin)}`;
  if (!s.active && s.startsInMin != null) return `Starts in ${minStr(s.startsInMin)}`;
  return "Off-hours";
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function dollar(n: number) {
  return `$${n.toFixed(2)}`;
}

/** Tiny score for "best match" ranking. */
export function rankScore(opts: {
  rating: number;
  isActive: boolean;
  endsInMin?: number;
  isFeatured: boolean;
  distanceKm?: number;
}) {
  const r = opts.rating * 10;                              // 0-50
  const live = opts.isActive ? 25 : 0;
  const featured = opts.isFeatured ? 8 : 0;
  // Reward deals ending in 30–60 min (urgency!)
  const urgency = opts.isActive && opts.endsInMin != null
    ? Math.max(0, 15 - Math.abs(45 - opts.endsInMin) / 3)
    : 0;
  const dist = opts.distanceKm != null ? Math.max(0, 10 - opts.distanceKm) : 0;
  return r + live + featured + urgency + dist;
}
