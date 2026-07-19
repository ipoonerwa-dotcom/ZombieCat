import "server-only";
import { keccak256, toHex, isAddress, decodeEventLog, getAddress } from "viem";
import { prisma } from "./prisma";
import { PRODUCTS } from "./products";
import { usdCentsToTokenWei } from "./pricing";
import { getOverseasShipCents, getSetting, SETTING_KEYS } from "./settings";
import { getLiveRate } from "./livePrice";
import { TOKEN_DECIMALS, DEFAULT_CHAIN_ID } from "./tokenConfig";
import { publicClientFor } from "./serverChain";
import { STORE_ABI } from "./storeAbi";

export interface CartItemInput {
  slug: string;
  qty: number;
}
export interface CheckoutInput {
  items: CartItemInput[];
  region: "cn" | "overseas";
  buyerAddress: string;
  recipient: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  city: string;
  address: string;
  postal?: string;
  note?: string;
}

// ZC + base36(time) + 4 random chars
function genOrderNo(): string {
  const t = Date.now().toString(36).toUpperCase();
  const r = Array.from({ length: 4 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("");
  return `ZC${t}${r}`;
}

export function computeOrderRef(orderNo: string): `0x${string}` {
  return keccak256(toHex(orderNo));
}

export async function createOrder(input: CheckoutInput) {
  // 1) validate + recompute prices from the trusted catalog (never trust client money)
  if (!Array.isArray(input.items) || input.items.length === 0) throw new Error("empty_cart");
  if (!isAddress(input.buyerAddress, { strict: false })) throw new Error("bad_address");

  const req = ["recipient", "email", "phone", "country", "province", "city", "address"] as const;
  for (const f of req) {
    if (!String(input[f] ?? "").trim()) throw new Error("missing_field:" + f);
  }

  const items = input.items
    .map((it) => {
      const p = PRODUCTS.find((x) => x.slug === it.slug);
      const qty = Math.max(1, Math.min(99, Math.floor(Number(it.qty) || 0)));
      return p ? { p, qty } : null;
    })
    .filter((x): x is { p: (typeof PRODUCTS)[number]; qty: number } => x !== null);
  if (items.length === 0) throw new Error("no_valid_items");

  const usdCents = items.reduce((a, { p, qty }) => a + p.priceUsdCents * qty, 0);
  const region = input.region === "overseas" ? "overseas" : "cn";
  const shipUsdCents = region === "overseas" ? await getOverseasShipCents() : 0;
  const totalUsdCents = usdCents + shipUsdCents;

  const live = await getLiveRate(); // on-chain price, manual fallback inside
  const rate = live.zcatPerUsd;
  const tokenAmount = usdCentsToTokenWei(totalUsdCents, rate, TOKEN_DECIMALS).toString();

  const orderNo = genOrderNo();
  const orderRef = computeOrderRef(orderNo);

  const order = await prisma.order.create({
    data: {
      orderNo,
      orderRef,
      buyerAddress: getAddress(input.buyerAddress.toLowerCase() as `0x${string}`),
      chainId: DEFAULT_CHAIN_ID,
      usdCents,
      shipUsdCents,
      totalUsdCents,
      tokenAmount,
      tokenRate: String(rate),
      shipKind: region === "overseas" ? "overseas_paid" : "domestic_free",
      recipient: input.recipient.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      country: input.country.trim(),
      region: input.province.trim(),
      city: input.city.trim(),
      addressLine: input.address.trim(),
      postalCode: (input.postal ?? "").trim(),
      note: (input.note ?? "").trim(),
      items: {
        create: items.map(({ p, qty }) => ({
          slug: p.slug,
          nameSnap: p.name,
          unitUsdCents: p.priceUsdCents,
          qty,
        })),
      },
    },
    include: { items: true },
  });

  const storeAddress = await getSetting(SETTING_KEYS.storeAddress);
  const tokenAddress = await getSetting(SETTING_KEYS.tokenAddress);

  return {
    orderNo: order.orderNo,
    orderRef,
    tokenAmount,
    tokenRate: rate,
    usdCents,
    shipUsdCents,
    totalUsdCents,
    chainId: DEFAULT_CHAIN_ID,
    storeAddress,
    tokenAddress,
    demo: !storeAddress || !tokenAddress,
  };
}

export async function getOrderByNo(orderNo: string) {
  return prisma.order.findUnique({ where: { orderNo }, include: { items: true } });
}

/// Confirm payment. If a store contract is configured, verify the on-chain
/// Purchased event matches this order; otherwise mark paid in demo mode.
export async function confirmOrder(orderNo: string, txHash?: string) {
  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order) throw new Error("not_found");
  if (order.status !== "pending") return order; // idempotent

  const storeAddress = await getSetting(SETTING_KEYS.storeAddress);

  // ---- demo mode: no contract deployed yet ----
  if (!storeAddress) {
    return prisma.order.update({
      where: { orderNo },
      data: { status: "paid", demoPaid: true, txHash: txHash ?? "", paidAt: new Date() },
    });
  }

  // ---- real mode: verify the burn on-chain ----
  if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) throw new Error("bad_txhash");
  const client = publicClientFor(order.chainId);
  const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
  if (receipt.status !== "success") throw new Error("tx_reverted");

  const store = storeAddress.toLowerCase();
  let matched = false;
  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== store) continue;
    try {
      const ev = decodeEventLog({ abi: STORE_ABI, data: log.data, topics: log.topics });
      if (ev.eventName !== "Purchased") continue;
      const a = ev.args as { buyer: string; orderRef: string; amount: bigint };
      if (
        a.orderRef.toLowerCase() === order.orderRef.toLowerCase() &&
        a.buyer.toLowerCase() === order.buyerAddress.toLowerCase() &&
        a.amount >= BigInt(order.tokenAmount)
      ) {
        matched = true;
        break;
      }
    } catch {
      // not our event
    }
  }
  if (!matched) throw new Error("no_matching_burn");

  return prisma.order.update({
    where: { orderNo },
    data: { status: "paid", demoPaid: false, txHash, paidAt: new Date() },
  });
}
