/**
 * GET  /api/admin/claims   — list business claims
 * PATCH /api/admin/claims  — approve or reject a claim
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminAuth";
import { listBusinessClaims, updateBusinessClaimStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = requireAdmin(req);
  if (g) return g;
  return NextResponse.json({ claims: await listBusinessClaims() });
}

const PatchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"]),
});

export async function PATCH(req: NextRequest) {
  const g = requireAdmin(req);
  if (g) return g;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateBusinessClaimStatus(parsed.data.id, parsed.data.status);
  return NextResponse.json({ ok: true, updated });
}
