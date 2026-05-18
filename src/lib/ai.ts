/**
 * AI search layer.
 *
 * Translates a natural-language query like
 *    "cheap apps and cocktails near me before 7"
 * into a structured SearchFilters object.
 *
 * Uses Anthropic's Claude when ANTHROPIC_API_KEY is set.
 * Falls back to a hand-rolled keyword parser otherwise so the
 * feature still works during local development.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { SearchFilters } from "@/types";

const VIBE_KEYWORDS: Record<string, string[]> = {
  rooftop: ["rooftop", "skyline", "roof"],
  "date-night": ["date", "romantic", "intimate", "anniversary"],
  "after-work": ["after work", "happy hour", "post work"],
  groups: ["group", "large group", "team", "crew"],
  networking: ["networking", "biz", "professional"],
  "student-budget": ["cheap", "budget", "student", "broke", "affordable"],
  patio: ["patio", "outdoor", "outside"],
  sports: ["game", "sports", "watch party"],
  cocktails: ["cocktail", "martini", "old fashioned", "mezcal"],
  "craft-beer": ["beer", "draft", "brewery", "ipa"],
  wine: ["wine", "vino", "bottle"]
};

/** Pure-JS fallback so the feature works even without an API key. */
function fallbackParse(query: string): SearchFilters {
  const q = query.toLowerCase();
  const filters: SearchFilters = { q: query.trim() };

  if (/\b(now|right now|asap|currently)\b/.test(q)) filters.happeningNow = true;
  if (/\b(end|ending|before|hurry|last call)\b/.test(q)) filters.endingSoon = true;
  if (/\b(starts|starting|tonight|later)\b/.test(q)) filters.startsSoon = true;

  if (/\b(food|app|appetizer|bite|eat|small plate)/.test(q)) filters.dealType = "FOOD";
  if (/\b(drink|cocktail|beer|wine|spritz|marg)/.test(q))    filters.dealType =
    filters.dealType === "FOOD" ? "BOTH" : "DRINK";

  if (/\b(cheap|budget|affordable|broke|student)\b/.test(q)) filters.maxPrice = 2;
  if (/\$+/.test(q)) {
    const dollars = (q.match(/\$/g) || []).length;
    filters.maxPrice = Math.min(4, Math.max(1, dollars)) as 1 | 2 | 3 | 4;
  }

  if (/\b(top|best|highest|great)\b/.test(q)) filters.minRating = 4.5;

  const vibes: string[] = [];
  for (const [vibe, kws] of Object.entries(VIBE_KEYWORDS)) {
    if (kws.some((k) => q.includes(k))) vibes.push(vibe);
  }
  if (vibes.length) filters.vibes = vibes;

  filters.sort = filters.endingSoon ? "ending-soon" : "best-match";
  return filters;
}

const SYSTEM_PROMPT = `You translate a user's free-text request for nightlife / happy-hour into a STRICT JSON object that matches this TypeScript type:

interface SearchFilters {
  q?: string;                 // free-text keywords from the request
  happeningNow?: boolean;     // "right now", "currently"
  endingSoon?: boolean;       // "before it ends", "in the next hour"
  startsSoon?: boolean;       // "later tonight", "starts soon"
  dealType?: "FOOD" | "DRINK" | "BOTH" | "EVENT" | "ANY";
  minRating?: number;         // 1-5, only when the user clearly asks for "top/best/highly-rated"
  maxPrice?: 1 | 2 | 3 | 4;   // 1=$, 4=$$$$, only when user mentions price
  vibes?: string[];           // any of: rooftop, date-night, after-work, groups, networking,
                              //   student-budget, patio, sports, cocktails, craft-beer, wine
  sort?: "best-match" | "rating" | "distance" | "ending-soon";
}

Rules:
- Output ONLY the JSON object. No markdown, no preface, no trailing text.
- Omit fields you aren't sure about.
- Never invent vibes outside the listed set.
- If the user mentions "near me" do NOT set coordinates; the client adds them.`;

export async function aiParseSearch(query: string): Promise<{
  filters: SearchFilters;
  rationale: string;
  source: "claude" | "fallback";
}> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      filters: fallbackParse(query),
      rationale: "Parsed locally (no ANTHROPIC_API_KEY set).",
      source: "fallback"
    };
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: query }]
    });
    const textBlock = msg.content.find((b: any) => b.type === "text") as
      | { type: "text"; text: string } | undefined;
    const raw = textBlock?.text?.trim() ?? "{}";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as SearchFilters;
    return {
      filters: parsed,
      rationale: "Interpreted by Claude.",
      source: "claude"
    };
  } catch (err) {
    console.error("[ai-search] Claude failed, using fallback:", err);
    return {
      filters: fallbackParse(query),
      rationale: "Fallback used after AI error.",
      source: "fallback"
    };
  }
}
