import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

const ALLOWED = ["pending", "paid", "fulfilled", "cancelled"];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ orderNo: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { orderNo } = await params;
  const body = (await req.json().catch(() => ({}))) as { status?: string; note?: string };

  const data: Record<string, unknown> = {};
  if (body.status) {
    if (!ALLOWED.includes(body.status)) return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });
    data.status = body.status;
  }
  if (typeof body.note === "string") data.note = body.note;
  if (Object.keys(data).length === 0) return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 400 });

  try {
    const order = await prisma.order.update({ where: { orderNo }, data, include: { items: true } });
    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
}
