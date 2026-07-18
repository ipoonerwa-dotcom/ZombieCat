import { NextRequest, NextResponse } from "next/server";
import { getOrderByNo } from "@/lib/orders";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await params;
  const order = await getOrderByNo(orderNo);
  if (!order) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  return NextResponse.json({
    ok: true,
    orderNo: order.orderNo,
    status: order.status,
    txHash: order.txHash,
    totalUsdCents: order.totalUsdCents,
    tokenAmount: order.tokenAmount,
  });
}
