import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { setSetting, SETTING_KEYS } from "@/lib/settings";
import { getPublicState, drawWinner } from "@/lib/raffle";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const [state, participants] = await Promise.all([
    getPublicState(),
    prisma.raffleParticipant.findMany({ where: { tickets: { gt: 0 } }, orderBy: { tickets: "desc" }, take: 1000 }),
  ]);

  const entries = participants.map((p) => ({
    address: p.address,
    tickets: p.tickets,
    ranges: JSON.parse(p.ranges || "[]") as [number, number][],
    balanceWei: p.balanceWei,
    recipient: p.recipient,
    phone: p.phone,
    country: p.country,
    region: p.region,
    city: p.city,
    addressLine: p.addressLine,
    postalCode: p.postalCode,
    note: p.note,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({ ok: true, ...state, entries });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const action = String(body.action || "");

  if (action === "draw") {
    const res = await drawWinner(Boolean(body.force));
    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  }

  if (action === "config") {
    const map: Record<string, string> = {
      raffleStatus: SETTING_KEYS.raffleStatus,
      raffleDeadline: SETTING_KEYS.raffleDeadline,
      raffleTokensPerTicket: SETTING_KEYS.raffleTokensPerTicket,
      rafflePrizeSlug: SETTING_KEYS.rafflePrizeSlug,
      rafflePrizeCount: SETTING_KEYS.rafflePrizeCount,
    };
    await Promise.all(
      Object.entries(map)
        .filter(([k]) => body[k] !== undefined)
        .map(([k, key]) => setSetting(key, String(body[k])))
    );
    return NextResponse.json({ ok: true });
  }

  if (action === "reopen") {
    // clear the draw result and re-open entries
    await Promise.all([
      setSetting(SETTING_KEYS.raffleStatus, "open"),
      setSetting(SETTING_KEYS.raffleWinningNumber, ""),
      setSetting(SETTING_KEYS.raffleWinnerAddress, ""),
      setSetting(SETTING_KEYS.raffleSeedBlock, ""),
      setSetting(SETTING_KEYS.raffleSeedHash, ""),
      setSetting(SETTING_KEYS.raffleDrawnAt, ""),
    ]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
