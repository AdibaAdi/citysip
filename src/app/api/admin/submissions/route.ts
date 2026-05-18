import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listSubmissions, updateSubmissionStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

function gate(req: NextRequest) {
  const token =
    req.headers.get("x-admin-token") ??
    req.nextUrl.searchParams.get("token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const g = gate(req);
  if (g) return g;
  return NextResponse.json({ submissions: await listSubmissions() });
}

const PatchSchema = z.object({
  id: z.string(),
  status: z.enum(["approved", "rejected"])
});

export async function PATCH(req: NextRequest) {
  const g = gate(req);
  if (g) return g;
  const body = await req.json();
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateSubmissionStatus(parsed.data.id, parsed.data.status);
  return NextResponse.json({ ok: true, updated });
}
