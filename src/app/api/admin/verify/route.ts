/**
 * PATCH /api/admin/verify
 *
 * Marks a place or deal as verified (or unverified).
 *
 * Body: { kind: "place" | "deal", id: string, verified?: boolean }
 *
 * Requires DATABASE_URL + ADMIN_TOKEN.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const Body = z.object({
  kind: z.enum(["place", "deal"]),
  id: z.string(),
  verified: z.boolean().default(true),
});

export async function PATCH(req: NextRequest) {
  const g = requireAdmin(req);
  if (g) return g;

  const json = await req.json().catch(() => ({}));
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prisma = getPrisma();
  const { kind, id, verified } = parsed.data;

  if (kind === "place") {
    const updated = await prisma.place.update({
      where: { id },
      data: { isVerified: verified },
      select: { id: true, name: true, isVerified: true },
    });
    return NextResponse.json({ ok: true, kind: "place", updated });
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { verified },
    select: { id: true, title: true, verified: true },
  });
  return NextResponse.json({ ok: true, kind: "deal", updated });
}
