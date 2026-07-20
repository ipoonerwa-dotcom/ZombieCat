import "server-only";
import { prisma } from "./prisma";
import { DEFAULT_ZCAT_PER_USD } from "./pricing";

// Admin-editable settings (DB) with env / hardcoded fallbacks.
export const SETTING_KEYS = {
  zcatPerUsd: "zcat_per_usd",
  overseasShipCents: "overseas_ship_cents",
  tokenAddress: "token_address",
  storeAddress: "store_address",
  // raffle
  raffleStatus: "raffle_status", // open | closed | drawn
  raffleDeadline: "raffle_deadline", // ISO string
  raffleTokensPerTicket: "raffle_tokens_per_ticket",
  raffleIssued: "raffle_issued", // monotonic ticket counter
  rafflePrizeSlug: "raffle_prize_slug",
  rafflePrizeCount: "raffle_prize_count",
  raffleWinningNumber: "raffle_winning_number",
  raffleWinnerAddress: "raffle_winner_address",
  raffleSeedBlock: "raffle_seed_block",
  raffleSeedHash: "raffle_seed_hash",
  raffleDrawnAt: "raffle_drawn_at",
} as const;

const DEFAULTS: Record<string, string> = {
  [SETTING_KEYS.zcatPerUsd]: String(DEFAULT_ZCAT_PER_USD),
  [SETTING_KEYS.overseasShipCents]: "1900",
  [SETTING_KEYS.tokenAddress]: process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "",
  [SETTING_KEYS.storeAddress]: process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "",
  [SETTING_KEYS.raffleStatus]: "open",
  [SETTING_KEYS.raffleDeadline]: "",
  [SETTING_KEYS.raffleTokensPerTicket]: "100000",
  [SETTING_KEYS.raffleIssued]: "0",
  [SETTING_KEYS.rafflePrizeSlug]: "doodle-headphones",
  [SETTING_KEYS.rafflePrizeCount]: "1",
  [SETTING_KEYS.raffleWinningNumber]: "",
  [SETTING_KEYS.raffleWinnerAddress]: "",
  [SETTING_KEYS.raffleSeedBlock]: "",
  [SETTING_KEYS.raffleSeedHash]: "",
  [SETTING_KEYS.raffleDrawnAt]: "",
};

export async function getSetting(key: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? DEFAULTS[key] ?? "";
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  const out: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) out[r.key] = r.value;
  return out;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getZcatPerUsd(): Promise<number> {
  const v = Number(await getSetting(SETTING_KEYS.zcatPerUsd));
  return v > 0 ? v : DEFAULT_ZCAT_PER_USD;
}

export async function getOverseasShipCents(): Promise<number> {
  const v = Number(await getSetting(SETTING_KEYS.overseasShipCents));
  return Number.isFinite(v) && v >= 0 ? v : 1900;
}
