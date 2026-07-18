// USD -> $ZCAT conversion.
//
// The token isn't launched yet, so there's no market price. The rate
// (ZCAT per 1 USD, i.e. how many tokens = $1) is admin-configured for now,
// stored in the Setting table. Later this can be swapped to read an on-chain
// pool / oracle price without touching callers.
//
// DEMO default: 1 USD = 1000 ZCAT (i.e. token ~ $0.001).

export const DEFAULT_ZCAT_PER_USD = 1000;

// Compute token amount (wei, bigint) for a USD-cents price at a given rate.
// rate = tokens per 1 USD.
export function usdCentsToTokenWei(usdCents: number, zcatPerUsd: number, decimals = 18): bigint {
  // tokens = (usdCents/100) * zcatPerUsd  -> to wei * 10^decimals
  // do it in integer-friendly steps to keep precision
  const usdMicros = BigInt(Math.round(usdCents * 10_000)); // usd * 1e6
  const rateMicros = BigInt(Math.round(zcatPerUsd * 1_000_000)); // zcatPerUsd * 1e6
  // tokens(whole) = usdMicros/1e6 * rateMicros/1e6 = usdMicros*rateMicros/1e12
  // wei = tokens * 10^decimals
  const pow = 10n ** BigInt(decimals);
  return (usdMicros * rateMicros * pow) / 1_000_000_000_000n;
}

// Human-friendly whole-token count (number) for display math (not for payment).
export function usdCentsToTokens(usdCents: number, zcatPerUsd: number): number {
  return (usdCents / 100) * zcatPerUsd;
}
