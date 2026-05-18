import { NextRequest, NextResponse } from "next/server";
import { aiParseSearch } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { query } = await req.json().catch(() => ({ query: "" }));
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }
  const { filters, rationale, source } = await aiParseSearch(query);
  return NextResponse.json({ filters, rationale, source });
}
