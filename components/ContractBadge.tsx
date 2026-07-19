"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ZCAT_CA, EXPLORER_BASE, TOKEN_SYMBOL } from "@/lib/tokenConfig";

// Copyable official-contract badge. variant="hero" is the big homepage bar;
// variant="footer" is the compact inline row.
export default function ContractBadge({ variant = "footer" }: { variant?: "hero" | "footer" }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(ZCAT_CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`ca-badge ${variant === "hero" ? "ca-hero" : "ca-footer"}`}>
      <span className="ca-label">
        {t("token.official")} <span className="ca-sym">${TOKEN_SYMBOL.toUpperCase()}</span>
      </span>
      <button className="ca-addr" onClick={copy} title={t("token.copy")}>
        <span className="ca-full">{ZCAT_CA}</span>
        <span className="ca-short">{ZCAT_CA.slice(0, 8)}…{ZCAT_CA.slice(-6)}</span>
        <span className="ca-copy">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          )}
        </span>
      </button>
      <a className="ca-link" href={`${EXPLORER_BASE}/token/${ZCAT_CA}`} target="_blank" rel="noopener noreferrer" title={t("token.verify")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
      </a>
    </div>
  );
}
