import { NextRequest, NextResponse } from "next/server";
import { createOrder, type CheckoutInput } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutInput;
    const result = await createOrder(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
