import { NextResponse } from "next/server";
import { getLiveRate } from "@/lib/livePrice";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = await getLiveRate();
  return NextResponse.json({
    ok: true,
    zcatPerUsd: rate.zcatPerUsd,
    priceUsd: rate.priceUsd,
    ethUsd: rate.ethUsd,
    source: rate.source,
  });
}
