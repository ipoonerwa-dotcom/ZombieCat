export function usd(cents: number): string {
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function shortAddr(a?: string): string {
  if (!a) return "";
  return a.slice(0, 6) + "…" + a.slice(-4);
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
