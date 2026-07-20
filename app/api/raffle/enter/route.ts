import { NextRequest, NextResponse } from "next/server";
import { enterRaffle, type Shipping } from "@/lib/raffle";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { address?: string; quantity?: number; shipping?: Partial<Shipping> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const { address, quantity, shipping } = body;
  if (!address) return NextResponse.json({ ok: false, error: "bad_address" }, { status: 400 });

  const result = await enterRaffle(address, Number(quantity), shipping || {});
  if (!result.ok) return NextResponse.json(result, { status: 400 });
  return NextResponse.json(result);
}
