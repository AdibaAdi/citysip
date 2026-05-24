/**
 * POST /api/business
 *
 * Accepts a venue owner claim from the /business page and persists it
 * into the BusinessClaim table (or in-memory mock in dev without a DB).
 *
 * This is a public route — no admin token required. Rate limiting is
 * handled at the infrastructure level (Vercel edge) in production.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBusinessClaim } from "@/lib/db";

export const dynamic = "force-dynamic";

const Schema = z.object({
  venueName: z.string().min(1),
  city: z.string().optional(),
  role: z.string().optional(),
  ownerName: z.string().min(1),
  ownerEmail: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  message: z.string().optional(),
  placeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ownerName, ownerEmail, venueName, placeId, message, ...rest } = parsed.data;
  const claim = await createBusinessClaim({
    placeId,
    email: ownerEmail,
    fullName: ownerName,
    venueName,
    message,
    payload: { ...rest, ownerName, venueName },
  });

  return NextResponse.json({ ok: true, claim });
}
