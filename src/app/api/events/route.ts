import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const citySlug = req.nextUrl.searchParams.get("citySlug") ?? undefined;
  return NextResponse.json({ events: await listEvents(citySlug) });
}
