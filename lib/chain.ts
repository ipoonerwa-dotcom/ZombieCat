import { createConfig, http } from "wagmi";
import { robinhood, robinhoodTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Robinhood Chain: Arbitrum Orbit L2, native currency ETH, settles to Ethereum.
// mainnet 4663 · testnet 46630 (Sepolia settlement)
export const wagmiConfig = createConfig({
  chains: [robinhood, robinhoodTestnet],
  connectors: [injected()],
  transports: {
    [robinhood.id]: http(),
    [robinhoodTestnet.id]: http(),
  },
  ssr: true,
});

// Re-export plain constants (defined without wagmi) for convenience.
export {
  TOKEN_ADDRESS,
  STORE_ADDRESS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
  DEFAULT_CHAIN_ID,
  DEAD_ADDRESS,
} from "./tokenConfig";
