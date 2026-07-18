import { NextRequest, NextResponse } from "next/server";
import { confirmOrder } from "@/lib/orders";

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNo: string }> }) {
  try {
    const { orderNo } = await params;
    const body = (await req.json().catch(() => ({}))) as { txHash?: string };
    const order = await confirmOrder(orderNo, body.txHash);
    return NextResponse.json({ ok: true, status: order.status, demoPaid: order.demoPaid });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
