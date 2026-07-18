"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { usd, shortAddr, fmtToken } from "@/lib/format";
import { TOKEN_DECIMALS, TOKEN_SYMBOL } from "@/lib/chain";

interface OrderItem { id: string; slug: string; nameSnap: string; unitUsdCents: number; qty: number }
interface Order {
  id: string; orderNo: string; orderRef: string; buyerAddress: string; status: string;
  usdCents: number; shipUsdCents: number; totalUsdCents: number; tokenAmount: string; tokenRate: string;
  txHash: string; demoPaid: boolean; paidAt: string | null;
  recipient: string; email: string; phone: string; country: string; region: string; city: string;
  addressLine: string; postalCode: string; shipKind: string; note: string; createdAt: string;
  items: OrderItem[];
}
interface Stats { total: number; paid: number; pending: number; fulfilled: number; burnedWei: string; usdPaidCents: number }

const STATUSES = ["all", "pending", "paid", "fulfilled", "cancelled"];
const NEXT_STATUS: Record<string, { label: string; to: string }[]> = {
  pending: [{ label: "Mark paid", to: "paid" }, { label: "Cancel", to: "cancelled" }],
  paid: [{ label: "Mark fulfilled", to: "fulfilled" }, { label: "Cancel", to: "cancelled" }],
  fulfilled: [{ label: "Reopen", to: "paid" }],
  cancelled: [{ label: "Reopen", to: "pending" }],
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savedMsg, setSavedMsg] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const res = await fetch(`/api/admin/orders?${params}`);
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    if (data.ok) { setOrders(data.orders); setStats(data.stats); setAuthed(true); }
  }, [status, q]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (authed) fetch("/api/admin/settings").then((r) => r.json()).then((d) => d.ok && setSettings(d.settings));
  }, [authed]);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }),
    });
    if (res.ok) { setPw(""); load(); } else setLoginErr("Wrong password");
  };
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); setAuthed(false); };

  const setOrderStatus = async (orderNo: string, to: string) => {
    await fetch(`/api/admin/orders/${orderNo}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status: to }),
    });
    load();
  };

  const saveSettings = async () => {
    const res = await fetch("/api/admin/settings", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(settings),
    }).then((r) => r.json());
    if (res.ok) { setSettings(res.settings); setSavedMsg("Saved ✓"); setTimeout(() => setSavedMsg(""), 1800); }
  };

  // ---- login gate ----
  if (authed === null) {
    return <div className="section wrap" style={{ paddingTop: 100 }}><p className="lead">Loading…</p></div>;
  }
  if (authed === false) {
    return (
      <div className="section wrap" style={{ paddingTop: 90, maxWidth: 420 }}>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 12 }}>ADMIN · CONSOLE</div>
          <h2 style={{ marginBottom: 16 }}>Consumption Dashboard</h2>
          <div className="field" style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()} />
          </div>
          {loginErr && <div className="notice" style={{ marginBottom: 12 }}>{loginErr}</div>}
          <button className="btn btn-primary btn-block" onClick={login}>Sign in</button>
        </div>
      </div>
    );
  }

  // ---- dashboard ----
  return (
    <div className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="kicker">ADMIN · CONSOLE</div>
            <h1 className="h-section" style={{ marginBottom: 0 }}>Consumption Dashboard</h1>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
        </div>

        {/* stats */}
        {stats && (
          <div className="card" style={{ padding: "6px 18px", marginTop: 24 }}>
            <div className="stats-strip">
              <div className="stat"><div className="stat-num">{stats.total}</div><div className="stat-label">Orders</div></div>
              <div className="stat"><div className="stat-num">{stats.paid + stats.fulfilled}</div><div className="stat-label">Paid</div></div>
              <div className="stat"><div className="stat-num">{fmtToken(stats.burnedWei, TOKEN_DECIMALS, 0)}</div><div className="stat-label">{TOKEN_SYMBOL} burned</div></div>
              <div className="stat"><div className="stat-num">{usd(stats.usdPaidCents)}</div><div className="stat-label">Goods value (fulfillment)</div></div>
            </div>
          </div>
        )}

        {/* settings */}
        <div className="card" style={{ marginTop: 18 }}>
          <div className="kicker" style={{ marginBottom: 14 }}>SETTINGS</div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>$ZCAT per 1 USD (burn rate)</label>
              <input className="input" value={settings.zcat_per_usd ?? ""} onChange={(e) => setSettings((s) => ({ ...s, zcat_per_usd: e.target.value }))} />
            </div>
            <div className="field">
              <label>Overseas shipping (USD cents)</label>
              <input className="input" value={settings.overseas_ship_cents ?? ""} onChange={(e) => setSettings((s) => ({ ...s, overseas_ship_cents: e.target.value }))} />
            </div>
          </div>
          <div className="field-row" style={{ marginBottom: 12 }}>
            <div className="field">
              <label>Token address ($ZCAT)</label>
              <input className="input" placeholder="0x… (empty = demo mode)" value={settings.token_address ?? ""} onChange={(e) => setSettings((s) => ({ ...s, token_address: e.target.value }))} />
            </div>
            <div className="field">
              <label>Store contract address</label>
              <input className="input" placeholder="0x… (empty = demo mode)" value={settings.store_address ?? ""} onChange={(e) => setSettings((s) => ({ ...s, store_address: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button className="btn btn-primary btn-sm" onClick={saveSettings}>Save settings</button>
            {savedMsg && <span style={{ color: "var(--red)", fontFamily: "var(--mono)", fontSize: 12 }}>{savedMsg}</span>}
            <span className="mini-note">Token + Store empty ⇒ checkout records orders in demo mode (no real burn).</span>
          </div>
        </div>

        {/* filters */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", margin: "22px 0 14px" }}>
          <div className="cat-tabs">
            {STATUSES.map((s) => (
              <button key={s} className={`cat-tab ${status === s ? "on" : ""}`} onClick={() => setStatus(s)}>{s}</button>
            ))}
          </div>
          <input className="input" style={{ maxWidth: 280, marginLeft: "auto" }} placeholder="Search address / order / email / name"
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>

        {/* orders table */}
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Order</th><th>Buyer</th><th>Items</th><th>{TOKEN_SYMBOL} burned</th><th>USD</th><th>Status</th><th>When</th><th></th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--dim)", padding: 28 }}>No orders yet.</td></tr>
              )}
              {orders.map((o) => (
                <Fragment key={o.orderNo}>
                  <tr style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === o.orderNo ? null : o.orderNo)}>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{o.orderNo}{o.demoPaid && <span className="badge-demo" style={{ marginLeft: 6 }}>demo</span>}</td>
                    <td style={{ fontFamily: "var(--mono)" }}>{shortAddr(o.buyerAddress)}</td>
                    <td>{o.items.map((i) => `${i.nameSnap} ×${i.qty}`).join(", ")}</td>
                    <td style={{ fontFamily: "var(--mono)", color: "var(--red)" }}>{fmtToken(o.tokenAmount, TOKEN_DECIMALS, 0)}</td>
                    <td style={{ fontFamily: "var(--mono)" }}>{usd(o.totalUsdCents)}</td>
                    <td><span className={`status-tag st-${o.status}`}>{o.status}</span></td>
                    <td style={{ color: "var(--dim)", fontSize: 12 }}>{new Date(o.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td style={{ color: "var(--dim)" }}>{expanded === o.orderNo ? "▾" : "▸"}</td>
                  </tr>
                  {expanded === o.orderNo && (
                    <tr>
                      <td colSpan={8} style={{ background: "rgba(238,29,43,0.03)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, padding: "6px 4px" }}>
                          <div>
                            <div className="kicker" style={{ marginBottom: 10 }}>SHIPPING · CONTACT (PII)</div>
                            <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
                              <div><b>{o.recipient}</b> · {o.phone} · {o.email}</div>
                              <div>{o.country} / {o.region} / {o.city} {o.postalCode}</div>
                              <div>{o.addressLine}</div>
                              <div style={{ color: "var(--dim)" }}>Ship: {o.shipKind === "overseas_paid" ? "Overseas (paid)" : "China (free)"}{o.note && ` · Note: ${o.note}`}</div>
                            </div>
                          </div>
                          <div>
                            <div className="kicker" style={{ marginBottom: 10 }}>ON-CHAIN</div>
                            <div style={{ display: "grid", gap: 4, fontSize: 12.5, fontFamily: "var(--mono)" }}>
                              <div>Burn: {fmtToken(o.tokenAmount, TOKEN_DECIMALS, 2)} {TOKEN_SYMBOL} @ {o.tokenRate}/USD</div>
                              <div>Goods {usd(o.usdCents)} + ship {usd(o.shipUsdCents)} = {usd(o.totalUsdCents)}</div>
                              <div style={{ wordBreak: "break-all" }}>Tx: {o.txHash || "—"}</div>
                              <div style={{ wordBreak: "break-all", color: "var(--dim)" }}>Ref: {o.orderRef}</div>
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                              {(NEXT_STATUS[o.status] ?? []).map((a) => (
                                <button key={a.to} className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setOrderStatus(o.orderNo, a.to); }}>{a.label}</button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mini-note" style={{ marginTop: 12 }}>
          Fulfillment: use each order&apos;s USD value to allocate treasury ETH → fiat → buy &amp; ship the goods, then mark fulfilled.
        </p>
      </div>
    </div>
  );
}
