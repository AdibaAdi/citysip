import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSubmission, listSubmissions } from "@/lib/db";

export const dynamic = "force-dynamic";

const Schema = z.object({
  type: z.enum(["new-place", "update-deal", "menu-photo", "report-error"]),
  placeId: z.string().optional(),
  payload: z.record(z.any())
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const sub = await createSubmission(parsed.data);
  return NextResponse.json({ ok: true, submission: sub });
}

export async function GET(req: NextRequest) {
  // Lightly gated — only used by admin UI
  const token = req.headers.get("x-admin-token") ?? req.nextUrl.searchParams.get("token");
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await listSubmissions();
  return NextResponse.json({ submissions: subs });
}
