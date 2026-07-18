import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getAllSettings, setSetting, SETTING_KEYS } from "@/lib/settings";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, settings: await getAllSettings() });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const allowed = new Set(Object.values(SETTING_KEYS));
  for (const [k, v] of Object.entries(body)) {
    if (allowed.has(k as never)) await setSetting(k, String(v));
  }
  return NextResponse.json({ ok: true, settings: await getAllSettings() });
}
