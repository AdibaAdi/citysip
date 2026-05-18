"use client";

import { useRouter } from "next/navigation";
import AiSearchBar from "@/components/AiSearchBar";
import type { SearchFilters } from "@/types";

export default function HeroSearch() {
  const router = useRouter();

  function onResult(filters: SearchFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v == null) return;
      if (typeof v === "boolean") { if (v) params.set(k, "1"); return; }
      if (Array.isArray(v))      { if (v.length) params.set(k, v.join(",")); return; }
      if (typeof v === "object") return; // skip "near"
      params.set(k, String(v));
    });
    router.push(`/explore?${params.toString()}`);
  }

  return <AiSearchBar onResult={onResult} />;
}
