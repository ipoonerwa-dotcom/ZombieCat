import "server-only";
import { getAddress, zeroAddress } from "viem";
import { publicClientFor } from "./serverChain";
import { getSetting, SETTING_KEYS } from "./settings";
import { DEFAULT_ZCAT_PER_USD } from "./pricing";
import { DEFAULT_CHAIN_ID } from "./tokenConfig";

// Live ZCAT/USD pricing.
// Source of truth: Flap Portal on Robinhood Chain.
//  - Bonding curve phase: Portal.getTokenV8Safe(token).price = ETH wei per 1 token
//    (previewBuy/Sell are disabled on Flap portals, V8Safe is the documented way).
//  - After DEX migration: state.pool is the pair → price from pool reserves (WETH/token).
// ETH/USD comes from Binance with Coinbase fallback. Everything cached 60s.
// If any leg fails, we fall back to the admin-set manual rate (Setting zcat_per_usd).

const PORTAL = (process.env.FLAP_PORTAL_ADDRESS ??
  "0x26605f322f7fF986f381bB9A6e3f5DAb0bEaEb09") as `0x${string}`;
const WETH = (process.env.WETH_ADDRESS ??
  "0x0bd7d308f8e1639fab988df18a8011f41eacad73") as `0x${string}`;

const PORTAL_ABI = [
  {
    type: "function",
    name: "getTokenV8Safe",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "status", type: "uint8" },
          { name: "reserve", type: "uint256" },
          { name: "circulatingSupply", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "tokenVersion", type: "uint8" },
          { name: "r", type: "uint256" },
          { name: "h", type: "uint256" },
          { name: "k", type: "uint256" },
          { name: "dexSupplyThresh", type: "uint256" },
          { name: "quoteTokenAddress", type: "address" },
          { name: "nativeToQuoteSwapEnabled", type: "bool" },
          { name: "extensionID", type: "bytes32" },
          { name: "buyTaxRate", type: "uint256" },
          { name: "sellTaxRate", type: "uint256" },
          { name: "pool", type: "address" },
          { name: "progress", type: "uint256" },
          { name: "lpFeeProfile", type: "uint8" },
          { name: "dexId", type: "uint8" },
        ],
      },
    ],
  },
] as const;

const ERC20_BAL_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "a", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export interface LiveRate {
  zcatPerUsd: number; // tokens per 1 USD (what pricing math consumes)
  priceUsd: number; // USD per token (display)
  ethUsd: number;
  source: "curve" | "pool" | "manual";
  at: number;
}

let cache: LiveRate | null = null;
const TTL_MS = 60_000;

async function fetchEthUsd(): Promise<number> {
  const t = (ms: number) => AbortSignal.timeout(ms);
  try {
    const r = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT", { signal: t(6000) });
    const j = (await r.json()) as { price?: string };
    const v = Number(j.price);
    if (v > 0) return v;
  } catch {
    // fall through
  }
  const r2 = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot", { signal: t(6000) });
  const j2 = (await r2.json()) as { data?: { amount?: string } };
  const v2 = Number(j2.data?.amount);
  if (v2 > 0) return v2;
  throw new Error("eth_usd_unavailable");
}

async function readTokenPriceEth(token: `0x${string}`): Promise<{ priceEth: number; source: "curve" | "pool" }> {
  const client = publicClientFor(DEFAULT_CHAIN_ID);
  const s = await client.readContract({
    address: PORTAL,
    abi: PORTAL_ABI,
    functionName: "getTokenV8Safe",
    args: [token],
  });

  // Migrated to DEX: price from pair reserves (WETH per token).
  if (s.pool !== zeroAddress) {
    const [tokenBal, wethBal] = await Promise.all([
      client.readContract({ address: token, abi: ERC20_BAL_ABI, functionName: "balanceOf", args: [s.pool] }),
      client.readContract({ address: WETH, abi: ERC20_BAL_ABI, functionName: "balanceOf", args: [s.pool] }),
    ]);
    if (tokenBal > 0n && wethBal > 0n) {
      return { priceEth: Number(wethBal) / Number(tokenBal), source: "pool" };
    }
  }

  // Bonding curve: V8Safe.price is ETH wei per whole token.
  if (s.price > 0n) {
    return { priceEth: Number(s.price) / 1e18, source: "curve" };
  }
  throw new Error("no_onchain_price");
}

export async function getLiveRate(): Promise<LiveRate> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache;

  const tokenAddr = await getSetting(SETTING_KEYS.tokenAddress);
  try {
    if (!tokenAddr) throw new Error("token_not_set");
    const token = getAddress(tokenAddr.toLowerCase() as `0x${string}`);
    const [{ priceEth, source }, ethUsd] = await Promise.all([readTokenPriceEth(token), fetchEthUsd()]);
    const priceUsd = priceEth * ethUsd;
    if (!(priceUsd > 0)) throw new Error("bad_price");
    cache = { zcatPerUsd: 1 / priceUsd, priceUsd, ethUsd, source, at: Date.now() };
    return cache;
  } catch {
    // manual fallback — admin-set rate keeps checkout alive if RPC/price APIs hiccup
    const manual = Number(await getSetting(SETTING_KEYS.zcatPerUsd)) || DEFAULT_ZCAT_PER_USD;
    cache = { zcatPerUsd: manual, priceUsd: 1 / manual, ethUsd: 0, source: "manual", at: Date.now() };
    return cache;
  }
}
