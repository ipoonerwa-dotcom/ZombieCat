// Plain constants shared by client (wagmi) and server (API routes) — no wagmi import,
// so server bundles stay light.
export const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as `0x${string}` | "";
export const STORE_ADDRESS = (process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "") as `0x${string}` | "";
export const TOKEN_DECIMALS = Number(process.env.NEXT_PUBLIC_TOKEN_DECIMALS ?? 18);
export const TOKEN_SYMBOL = process.env.NEXT_PUBLIC_TOKEN_SYMBOL ?? "ZCAT";
export const DEFAULT_CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 4663);
export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

// Official, live $ZCAT contract on Robinhood Chain — shown on the site for verification.
export const ZCAT_CA = "0x9db8665c94b06330f3cfd62386a379aec7707777" as const;
export const EXPLORER_BASE = "https://robinhoodchain.blockscout.com" as const;
// DexScreener pair page for live chart / trading.
export const DEXSCREENER_URL = "https://dexscreener.com/robinhood/0x78794436c7b2b44ffcb62899c265e951d032ed91" as const;
