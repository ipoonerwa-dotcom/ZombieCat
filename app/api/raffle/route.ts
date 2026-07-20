import { NextResponse } from "next/server";
import { getPublicState } from "@/lib/raffle";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const state = await getPublicState();
    return NextResponse.json({ ok: true, ...state });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
