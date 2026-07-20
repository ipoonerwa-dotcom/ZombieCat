import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getMyState } from "@/lib/raffle";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const address = new URL(req.url).searchParams.get("address") || "";
  if (!isAddress(address)) return NextResponse.json({ ok: false, error: "bad_address" }, { status: 400 });
  try {
    const me = await getMyState(address);
    return NextResponse.json({ ok: true, ...me });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
