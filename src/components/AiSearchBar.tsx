"use client";

import { Sparkles, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import type { SearchFilters } from "@/types";

export default function AiSearchBar({
  onResult,
  placeholder = "Try: cheap apps and cocktails near me before 7"
}: {
  onResult: (filters: SearchFilters, rationale: string) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
      });
      const data = await res.json();
      onResult(data.filters as SearchFilters, data.rationale ?? "");
    } catch {
      onResult({ q }, "Search failed — showing keyword match.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-ember-500/40 via-coral/30 to-amber2/40 blur-md opacity-60 group-focus-within:opacity-90 transition" />
      <div className="relative flex items-stretch glass-strong rounded-2xl overflow-hidden">
        <div className="pl-4 flex items-center text-ember-300">
          <Sparkles size={18} />
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3 py-4 text-sm md:text-base placeholder:text-white/35 focus:outline-none"
        />
        <button
          onClick={run}
          disabled={loading || !q.trim()}
          className="ember-btn !rounded-none !rounded-r-2xl px-5 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span className="hidden sm:inline">Ask CitySip</span>
        </button>
      </div>
    </div>
  );
}
