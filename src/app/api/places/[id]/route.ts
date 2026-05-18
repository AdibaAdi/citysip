import { NextRequest, NextResponse } from "next/server";
import { getPlaceById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const place = await getPlaceById(params.id);
  if (!place) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(place);
}
