import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSetting, SETTING_KEYS } from "@/lib/settings";
import { publicClientFor } from "@/lib/serverChain";
import { ZCAT_CA, EXPLORER_BASE, DEFAULT_CHAIN_ID } from "@/lib/tokenConfig";
import { PRODUCTS } from "@/lib/products";

export const dynamic = "force-dynamic";

const STORE_STATS_ABI = [
  { type: "function", name: "totalBurned", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "orderCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

interface StatsCache { data: unknown; at: number }
let cache: StatsCache | null = null;
const TTL = 60_000;

export async function GET() {
  if (cache && Date.now() - cache.at < TTL) return NextResponse.json(cache.data);

  // orders paid/fulfilled from our DB
  let ordersPaid = 0;
  try {
    ordersPaid = await prisma.order.count({ where: { status: { in: ["paid", "fulfilled"] } } });
  } catch {
    // db hiccup
  }

  // burned $ZCAT from the Store contract (whole tokens)
  let burnedTokens = 0;
  try {
    const store = await getSetting(SETTING_KEYS.storeAddress);
    if (store) {
      const client = publicClientFor(DEFAULT_CHAIN_ID);
      const wei = (await client.readContract({
        address: store as `0x${string}`,
        abi: STORE_STATS_ABI,
        functionName: "totalBurned",
      })) as bigint;
      burnedTokens = Number(wei / 10n ** 18n);
    }
  } catch {
    // rpc hiccup
  }

  // holder count from Blockscout
  let holders = 0;
  try {
    const r = await fetch(`${EXPLORER_BASE}/api/v2/tokens/${ZCAT_CA}`, { signal: AbortSignal.timeout(6000) });
    const j = (await r.json()) as { holders_count?: string; holders?: string };
    holders = Number(j.holders_count ?? j.holders ?? 0);
  } catch {
    // ignore
  }

  const data = {
    ok: true,
    burnedTokens,
    ordersPaid,
    holders,
    products: PRODUCTS.length,
  };
  cache = { data, at: Date.now() };
  return NextResponse.json(data);
}
