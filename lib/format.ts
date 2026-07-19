export function usd(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function shortAddr(a?: string): string {
  if (!a) return "";
  return a.slice(0, 6) + "…" + a.slice(-4);
}

// Compact number: 1234 -> 1.2K, 1_200_000 -> 1.2M, 3_000_000_000 -> 3B
export function fmtCompact(x: number): string {
  if (!isFinite(x)) return "0";
  const a = Math.abs(x);
  if (a >= 1e9) return (x / 1e9).toFixed(2).replace(/\.?0+$/, "") + "B";
  if (a >= 1e6) return (x / 1e6).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (a >= 1e3) return (x / 1e3).toFixed(1).replace(/\.?0+$/, "") + "K";
  return x.toLocaleString("en-US");
}

// Format a wei-string token amount to a human string with the token's decimals.
export function fmtToken(weiStr: string, decimals = 18, maxFrac = 2): string {
  try {
    const neg = weiStr.startsWith("-");
    const s = (neg ? weiStr.slice(1) : weiStr).padStart(decimals + 1, "0");
    const intPart = s.slice(0, s.length - decimals) || "0";
    let frac = s.slice(s.length - decimals);
    frac = frac.slice(0, maxFrac).replace(/0+$/, "");
    const intFmt = BigInt(intPart).toLocaleString("en-US");
    return (neg ? "-" : "") + (frac ? `${intFmt}.${frac}` : intFmt);
  } catch {
    return "0";
  }
}
