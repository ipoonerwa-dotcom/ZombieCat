import "server-only";
import { createPublicClient, http, defineChain } from "viem";

// Robinhood Chain definitions for server-side verification (viem, no wagmi).
export const robinhoodMainnet = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.mainnet.chain.robinhood.com"] } },
});

export const robinhoodTestnet = defineChain({
  id: 46630,
  name: "Robinhood Chain Testnet",
  nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.testnet.chain.robinhood.com/rpc"] } },
});

export function publicClientFor(chainId: number) {
  const chain = chainId === robinhoodTestnet.id ? robinhoodTestnet : robinhoodMainnet;
  const rpc = process.env.SERVER_RPC_URL || chain.rpcUrls.default.http[0];
  return createPublicClient({ chain, transport: http(rpc) });
}
