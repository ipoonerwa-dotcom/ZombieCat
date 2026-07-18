import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const q = url.searchParams.get("q")?.trim();

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { buyerAddress: { contains: q } },
      { orderNo: { contains: q } },
      { email: { contains: q } },
      { recipient: { contains: q } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  // aggregate stats
  const all = await prisma.order.findMany({ select: { status: true, tokenAmount: true, totalUsdCents: true } });
  const paid = all.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const burnedWei = paid.reduce((a, o) => a + BigInt(o.tokenAmount), 0n).toString();
  const usdPaid = paid.reduce((a, o) => a + o.totalUsdCents, 0);

  return NextResponse.json({
    ok: true,
    orders,
    stats: {
      total: all.length,
      paid: paid.length,
      pending: all.filter((o) => o.status === "pending").length,
      fulfilled: all.filter((o) => o.status === "fulfilled").length,
      burnedWei,
      usdPaidCents: usdPaid,
    },
  });
}
