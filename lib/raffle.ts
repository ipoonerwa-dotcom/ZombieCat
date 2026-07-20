import "server-only";
import { getAddress, isAddress, keccak256, hexToBigInt } from "viem";
import { prisma } from "./prisma";
import { getSetting, setSetting, SETTING_KEYS } from "./settings";
import { publicClientFor } from "./serverChain";
import { ERC20_ABI } from "./storeAbi";
import { TOKEN_DECIMALS, DEFAULT_CHAIN_ID, ZCAT_CA } from "./tokenConfig";
import { PRODUCTS } from "./products";

// ---- HODL raffle core ----
// 1 numbered ticket per `tokensPerTicket` whole tokens held. Holders commit tickets
// (choose a quantity), each mapped to a contiguous number range. One winning number is
// drawn at the deadline from a Robinhood block hash (publicly verifiable).

export type Range = [number, number];

export interface RaffleConfig {
  status: "soon" | "open" | "closed" | "drawn";
  deadline: string; // ISO or ""
  tokensPerTicket: number;
  prizeSlug: string;
  prizeCount: number;
}

export interface Prize {
  slug: string;
  name: string;
  image: string;
  priceUsdCents: number;
}

function norm(a: string): string {
  return getAddress(a.toLowerCase() as `0x${string}`).toLowerCase();
}

export function ticketsFromBalanceWei(balanceWei: bigint, tokensPerTicket: number): number {
  if (tokensPerTicket <= 0) return 0;
  const per = BigInt(tokensPerTicket) * 10n ** BigInt(TOKEN_DECIMALS);
  if (per === 0n) return 0;
  const n = balanceWei / per;
  // cap to a sane int range
  return n > 1_000_000_000n ? 1_000_000_000 : Number(n);
}

export async function getRaffleConfig(): Promise<RaffleConfig> {
  const [status, deadline, tpt, prizeSlug, prizeCount] = await Promise.all([
    getSetting(SETTING_KEYS.raffleStatus),
    getSetting(SETTING_KEYS.raffleDeadline),
    getSetting(SETTING_KEYS.raffleTokensPerTicket),
    getSetting(SETTING_KEYS.rafflePrizeSlug),
    getSetting(SETTING_KEYS.rafflePrizeCount),
  ]);
  const perTicket = Number(tpt) > 0 ? Number(tpt) : 100000;
  let s = (status as RaffleConfig["status"]) || "soon";
  // auto-close once past the deadline (until drawn)
  if (s === "open" && deadline && Date.now() > new Date(deadline).getTime()) s = "closed";
  return {
    status: s,
    deadline: deadline || "",
    tokensPerTicket: perTicket,
    prizeSlug: prizeSlug || "doodle-headphones",
    prizeCount: Number(prizeCount) > 0 ? Number(prizeCount) : 1,
  };
}

export function getPrize(slug: string): Prize {
  const p = PRODUCTS.find((x) => x.slug === slug) || PRODUCTS[0];
  return { slug: p.slug, name: p.name, image: p.image, priceUsdCents: p.priceUsdCents };
}

export async function readBalanceWei(address: string, chainId = DEFAULT_CHAIN_ID): Promise<bigint> {
  const tokenAddr = (await getSetting(SETTING_KEYS.tokenAddress)) || ZCAT_CA;
  if (!tokenAddr) return 0n;
  const token = getAddress(tokenAddr.toLowerCase() as `0x${string}`);
  const client = publicClientFor(chainId);
  const bal = (await client.readContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [getAddress(address.toLowerCase() as `0x${string}`)],
  })) as bigint;
  return bal;
}

export interface PublicState {
  config: RaffleConfig;
  prize: Prize;
  totalTickets: number;
  participants: number;
  winner: null | { number: number; address: string; seedBlock: string; seedHash: string; drawnAt: string };
}

export async function getPublicState(): Promise<PublicState> {
  const config = await getRaffleConfig();
  const prize = getPrize(config.prizeSlug);
  const [issued, participants, winNum, winAddr, seedBlock, seedHash, drawnAt] = await Promise.all([
    getSetting(SETTING_KEYS.raffleIssued),
    prisma.raffleParticipant.count({ where: { tickets: { gt: 0 } } }),
    getSetting(SETTING_KEYS.raffleWinningNumber),
    getSetting(SETTING_KEYS.raffleWinnerAddress),
    getSetting(SETTING_KEYS.raffleSeedBlock),
    getSetting(SETTING_KEYS.raffleSeedHash),
    getSetting(SETTING_KEYS.raffleDrawnAt),
  ]);
  const winner = winNum
    ? { number: Number(winNum), address: winAddr, seedBlock, seedHash, drawnAt }
    : null;
  return { config, prize, totalTickets: Number(issued) || 0, participants, winner };
}

export interface MyState {
  address: string;
  balanceWei: string;
  available: number; // tickets entitled by live balance
  committed: number; // already entered
  canAdd: number;
  ranges: Range[];
  hasShipping: boolean;
  won: boolean;
}

export async function getMyState(addressRaw: string): Promise<MyState> {
  const address = norm(addressRaw);
  const config = await getRaffleConfig();
  const [balanceWei, p, winAddr] = await Promise.all([
    readBalanceWei(address).catch(() => 0n),
    prisma.raffleParticipant.findUnique({ where: { address } }),
    getSetting(SETTING_KEYS.raffleWinnerAddress),
  ]);
  const available = ticketsFromBalanceWei(balanceWei, config.tokensPerTicket);
  const committed = p?.tickets ?? 0;
  const ranges: Range[] = p ? (JSON.parse(p.ranges || "[]") as Range[]) : [];
  return {
    address,
    balanceWei: balanceWei.toString(),
    available,
    committed,
    canAdd: Math.max(0, available - committed),
    ranges,
    hasShipping: !!(p && p.recipient && p.addressLine),
    won: !!winAddr && winAddr.toLowerCase() === address,
  };
}

export interface Shipping {
  recipient: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  addressLine: string;
  postalCode: string;
  note: string;
}

export interface EnterResult {
  ok: boolean;
  error?: string;
  assigned?: Range;
  committed?: number;
  ranges?: Range[];
}

export async function enterRaffle(
  addressRaw: string,
  quantity: number,
  shipping: Partial<Shipping>
): Promise<EnterResult> {
  if (!isAddress(addressRaw)) return { ok: false, error: "bad_address" };
  const address = norm(addressRaw);
  const config = await getRaffleConfig();
  if (config.status !== "open") return { ok: false, error: "raffle_closed" };

  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1) return { ok: false, error: "bad_quantity" };

  const balanceWei = await readBalanceWei(address).catch(() => 0n);
  const available = ticketsFromBalanceWei(balanceWei, config.tokensPerTicket);

  const existing = await prisma.raffleParticipant.findUnique({ where: { address } });
  const committed = existing?.tickets ?? 0;
  const canAdd = Math.max(0, available - committed);
  if (canAdd < 1) return { ok: false, error: "no_tickets" };
  if (qty > canAdd) return { ok: false, error: "exceeds_available" };

  // shipping required on first entry (when no shipping on file yet)
  const needShipping = !(existing && existing.recipient && existing.addressLine);
  const ship: Shipping = {
    recipient: (shipping.recipient ?? existing?.recipient ?? "").trim(),
    phone: (shipping.phone ?? existing?.phone ?? "").trim(),
    country: (shipping.country ?? existing?.country ?? "").trim(),
    region: (shipping.region ?? existing?.region ?? "").trim(),
    city: (shipping.city ?? existing?.city ?? "").trim(),
    addressLine: (shipping.addressLine ?? existing?.addressLine ?? "").trim(),
    postalCode: (shipping.postalCode ?? existing?.postalCode ?? "").trim(),
    note: (shipping.note ?? existing?.note ?? "").trim(),
  };
  if (needShipping && (!ship.recipient || !ship.phone || !ship.country || !ship.addressLine)) {
    return { ok: false, error: "shipping_required" };
  }

  // allocate a contiguous number range atomically
  const assigned = await prisma.$transaction(async (tx) => {
    const issuedRow = await tx.setting.findUnique({ where: { key: SETTING_KEYS.raffleIssued } });
    const issued = Number(issuedRow?.value ?? "0") || 0;
    const start = issued + 1;
    const end = issued + qty;

    const cur = await tx.raffleParticipant.findUnique({ where: { address } });
    const ranges: Range[] = cur ? (JSON.parse(cur.ranges || "[]") as Range[]) : [];
    ranges.push([start, end]);

    const data = {
      tickets: (cur?.tickets ?? 0) + qty,
      ranges: JSON.stringify(ranges),
      balanceWei: balanceWei.toString(),
      ...ship,
    };
    if (cur) {
      await tx.raffleParticipant.update({ where: { address }, data });
    } else {
      await tx.raffleParticipant.create({ data: { address, chainId: DEFAULT_CHAIN_ID, ...data } });
    }
    await tx.setting.upsert({
      where: { key: SETTING_KEYS.raffleIssued },
      create: { key: SETTING_KEYS.raffleIssued, value: String(end) },
      update: { value: String(end) },
    });
    return [start, end] as Range;
  });

  const after = await prisma.raffleParticipant.findUnique({ where: { address } });
  return {
    ok: true,
    assigned,
    committed: after?.tickets ?? qty,
    ranges: after ? (JSON.parse(after.ranges || "[]") as Range[]) : [assigned],
  };
}

export interface DrawResult {
  ok: boolean;
  error?: string;
  number?: number;
  address?: string;
  seedBlock?: string;
  seedHash?: string;
}

// Verifiable draw: seed = keccak256(latest block hash), winning number =
// (uint256(seed) mod totalTickets) + 1. Block number + hash are published so anyone
// can recompute. The block is only known after the deadline, so it can't be gamed.
export async function drawWinner(force = false): Promise<DrawResult> {
  const config = await getRaffleConfig();
  if (config.status === "drawn") return { ok: false, error: "already_drawn" };
  if (!force && config.status === "open") return { ok: false, error: "still_open" };

  const total = Number(await getSetting(SETTING_KEYS.raffleIssued)) || 0;
  if (total < 1) return { ok: false, error: "no_tickets" };

  const client = publicClientFor(DEFAULT_CHAIN_ID);
  const block = await client.getBlock();
  if (!block.hash) return { ok: false, error: "no_block_hash" };
  const seed = keccak256(block.hash);
  const winningNumber = Number((hexToBigInt(seed) % BigInt(total)) + 1n);

  // find the participant whose ranges contain the winning number
  const all = await prisma.raffleParticipant.findMany({ where: { tickets: { gt: 0 } } });
  let winner = "";
  for (const p of all) {
    const ranges = JSON.parse(p.ranges || "[]") as Range[];
    if (ranges.some(([s, e]) => winningNumber >= s && winningNumber <= e)) {
      winner = p.address;
      break;
    }
  }

  await Promise.all([
    setSetting(SETTING_KEYS.raffleWinningNumber, String(winningNumber)),
    setSetting(SETTING_KEYS.raffleWinnerAddress, winner),
    setSetting(SETTING_KEYS.raffleSeedBlock, block.number.toString()),
    setSetting(SETTING_KEYS.raffleSeedHash, block.hash),
    setSetting(SETTING_KEYS.raffleDrawnAt, new Date().toISOString()),
    setSetting(SETTING_KEYS.raffleStatus, "drawn"),
  ]);

  return { ok: true, number: winningNumber, address: winner, seedBlock: block.number.toString(), seedHash: block.hash };
}
