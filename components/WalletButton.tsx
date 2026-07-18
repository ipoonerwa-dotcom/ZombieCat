"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useI18n } from "@/lib/i18n";
import { shortAddr } from "@/lib/format";

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectors, connect, isPending, error } = useConnect();
  const { t } = useI18n();

  const seen = new Set<string>();
  const list = connectors.filter((c) => {
    if (seen.has(c.name)) return false;
    seen.add(c.name);
    return true;
  });

  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ fontSize: 20, marginBottom: 6 }}>{t("wallet.title")}</h3>
        <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 8 }}>{t("wallet.sub")}</p>
        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginBottom: 18 }}>
          {t("wallet.network")}
        </p>
        {list.map((c) => (
          <button
            key={c.uid}
            className="wallet-opt"
            disabled={isPending}
            onClick={() => connect({ connector: c }, { onSuccess: onClose })}
          >
            {c.icon ? (
              <img src={c.icon} alt="" width={24} height={24} style={{ borderRadius: 5 }} />
            ) : (
              <span style={{ fontSize: 20 }}>🐱</span>
            )}
            {c.name === "Injected" ? (t("nav.home") === "Home" ? "Browser wallet" : "浏览器钱包") : c.name}
            <span className="sub">{isPending ? t("wallet.connecting") : ""}</span>
          </button>
        ))}
        {list.length <= 1 && <p className="mini-note" style={{ marginTop: 6 }}>{t("wallet.noext")}</p>}
        {error && (
          <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>
            {error.message.includes("rejected") || error.message.includes("denied")
              ? t("wallet.cancelled")
              : error.message.slice(0, 120)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  if (isConnected && address) {
    return (
      <div style={{ position: "relative" }}>
        <button className="addr-pill" onClick={() => setMenu((v) => !v)}>
          <span className="status-dot" />
          {shortAddr(address)}
        </button>
        {menu && (
          <div
            style={{
              position: "absolute", right: 0, top: "calc(100% + 8px)", background: "var(--panel-solid)",
              border: "1px solid var(--line)", borderRadius: 6, padding: 6, minWidth: 170, zIndex: 150,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.85)",
            }}
          >
            <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: "flex-start", marginBottom: 6, border: "none" }}
              onClick={() => { navigator.clipboard?.writeText(address).catch(() => {}); setMenu(false); }}>
              {t("wallet.copy")}
            </button>
            <button className="btn btn-ghost btn-sm btn-block" style={{ justifyContent: "flex-start", border: "none", color: "var(--danger)" }}
              onClick={() => { setMenu(false); disconnect(); }}>
              {t("wallet.disconnect")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        {t("wallet.connect")}
      </button>
      {open && <WalletModal onClose={() => setOpen(false)} />}
    </>
  );
}
