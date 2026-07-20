"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { shortAddr } from "@/lib/format";

type Range = [number, number];
interface Entry {
  address: string; tickets: number; ranges: Range[]; balanceWei: string;
  recipient: string; phone: string; country: string; region: string; city: string;
  addressLine: string; postalCode: string; note: string; createdAt: string;
}
interface State {
  config: { status: string; deadline: string; tokensPerTicket: number; prizeSlug: string; prizeCount: number };
  prize: { name: string; image: string };
  totalTickets: number; participants: number;
  winner: null | { number: number; address: string; seedBlock: string; seedHash: string; drawnAt: string };
  entries: Entry[];
}

const pad = (n: number) => "#" + String(n).padStart(5, "0");
const toLocalInput = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

export default function AdminRafflePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [pw, setPw] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [st, setSt] = useState<State | null>(null);
  const [deadline, setDeadline] = useState("");
  const [perTicket, setPerTicket] = useState("100000");
  const [prizeCount, setPrizeCount] = useState("1");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/raffle");
    if (res.status === 401) { setAuthed(false); return; }
    const d = await res.json();
    if (d.ok) {
      setSt(d); setAuthed(true);
      setDeadline(toLocalInput(d.config.deadline));
      setPerTicket(String(d.config.tokensPerTicket));
      setPrizeCount(String(d.config.prizeCount));
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const login = async () => {
    setLoginErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) { setPw(""); load(); } else setLoginErr("Wrong password");
  };

  const post = async (body: Record<string, unknown>) => {
    const r = await fetch("/api/admin/raffle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).then((x) => x.json());
    return r;
  };

  const saveConfig = async () => {
    const iso = deadline ? new Date(deadline).toISOString() : "";
    await post({ action: "config", raffleDeadline: iso, raffleTokensPerTicket: perTicket, rafflePrizeCount: prizeCount });
    setMsg("Saved ✓"); setTimeout(() => setMsg(""), 1600); load();
  };
  const setStatus = async (s: string) => { await post({ action: "config", raffleStatus: s }); load(); };
  const draw = async () => {
    if (!confirm("Draw the winner now? This picks a block-hash seed and locks the result.")) return;
    const r = await post({ action: "draw", force: st?.config.status === "open" });
    if (!r.ok) { setMsg("Draw failed: " + r.error); setTimeout(() => setMsg(""), 3000); }
    load();
  };
  const reopen = async () => { if (confirm("Clear the draw result and re-open entries?")) { await post({ action: "reopen" }); load(); } };

  if (authed === null) return <div className="section wrap" style={{ paddingTop: 100 }}><p className="lead">Loading…</p></div>;
  if (authed === false) {
    return (
      <div className="section wrap" style={{ paddingTop: 90, maxWidth: 420 }}>
        <div className="card">
          <div className="kicker" style={{ marginBottom: 12 }}>ADMIN · RAFFLE</div>
          <h2 style={{ marginBottom: 16 }}>Raffle Console</h2>
          <div className="field" style={{ marginBottom: 14 }}>
            <input type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} />
          </div>
          {loginErr && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{loginErr}</p>}
          <button className="btn btn-primary btn-block" onClick={login}>Sign in</button>
        </div>
      </div>
    );
  }

  const winnerAddr = st?.winner?.address?.toLowerCase() || "";

  return (
    <div className="section wrap" style={{ paddingTop: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <div className="kicker">ADMIN · RAFFLE</div>
          <h2>Raffle Console</h2>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/admin" className="btn btn-ghost btn-sm">← Orders</Link>
          {msg && <span style={{ color: "var(--red)", alignSelf: "center", fontSize: 13 }}>{msg}</span>}
        </div>
      </div>

      {/* stats */}
      <div className="stats-strip card" style={{ padding: "8px 18px", marginBottom: 18 }}>
        <div className="stat"><div className="stat-num">{st?.totalTickets ?? 0}</div><div className="stat-label">Tickets issued</div></div>
        <div className="stat"><div className="stat-num">{st?.participants ?? 0}</div><div className="stat-label">Entrants</div></div>
        <div className="stat"><div className="stat-num" style={{ textTransform: "capitalize" }}>{st?.config.status}</div><div className="stat-label">Status</div></div>
        <div className="stat"><div className="stat-num">{st?.winner ? pad(st.winner.number) : "—"}</div><div className="stat-label">Winning #</div></div>
      </div>

      {/* config + draw */}
      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginBottom: 14 }}>Config</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          <label className="admin-field"><span>Deadline</span><input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></label>
          <label className="admin-field"><span>Tokens / ticket</span><input value={perTicket} onChange={(e) => setPerTicket(e.target.value)} /></label>
          <label className="admin-field"><span>Prize count</span><input value={prizeCount} onChange={(e) => setPrizeCount(e.target.value)} /></label>
          <label className="admin-field"><span>Prize</span><input value={st?.prize.name ?? ""} disabled /></label>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
          <button className="btn btn-primary btn-sm" onClick={saveConfig}>Save config</button>
          {st?.config.status === "soon" && <button className="btn btn-primary btn-sm" onClick={() => setStatus("open")}>▶ Open entries</button>}
          {st?.config.status === "open" && <button className="btn btn-ghost btn-sm" onClick={() => setStatus("soon")}>Set “Coming soon”</button>}
          {st?.config.status === "open" && <button className="btn btn-ghost btn-sm" onClick={() => setStatus("closed")}>Close entries</button>}
          {st?.config.status === "closed" && <button className="btn btn-ghost btn-sm" onClick={() => setStatus("open")}>Re-open entries</button>}
          {(st?.config.status === "open" || st?.config.status === "closed") && <button className="btn btn-primary btn-sm" onClick={draw} style={{ marginLeft: "auto" }}>🎲 Draw winner</button>}
          {st?.config.status === "drawn" && <button className="btn btn-ghost btn-sm" onClick={reopen} style={{ marginLeft: "auto", color: "var(--danger)" }}>Reset draw</button>}
        </div>
        {st?.winner && (
          <div style={{ marginTop: 14, padding: 12, border: "1px solid rgba(238,29,43,0.35)", borderRadius: 8, fontSize: 13 }}>
            <b style={{ color: "var(--red)" }}>Winner {pad(st.winner.number)}</b> · {st.winner.address || "(no holder — re-draw)"} · block #{st.winner.seedBlock}
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", wordBreak: "break-all", marginTop: 4 }}>{st.winner.seedHash}</div>
          </div>
        )}
      </div>

      {/* entries */}
      <div className="card" style={{ overflowX: "auto" }}>
        <h3 style={{ marginBottom: 14 }}>Entries ({st?.entries.length ?? 0})</h3>
        <table className="admin-table" style={{ width: "100%", fontSize: 13 }}>
          <thead>
            <tr><th>Address</th><th>Tickets</th><th>Numbers</th><th>Recipient</th><th>Phone</th><th>Ship to</th></tr>
          </thead>
          <tbody>
            {st?.entries.map((e) => (
              <tr key={e.address} style={winnerAddr === e.address.toLowerCase() ? { background: "rgba(238,29,43,0.12)" } : undefined}>
                <td style={{ fontFamily: "var(--mono)" }}>{shortAddr(e.address)}{winnerAddr === e.address.toLowerCase() ? " 🏆" : ""}</td>
                <td>{e.tickets}</td>
                <td style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{e.ranges.map(([s, a]) => (s === a ? pad(s) : `${pad(s)}–${pad(a)}`)).join(", ")}</td>
                <td>{e.recipient}</td>
                <td>{e.phone}</td>
                <td style={{ fontSize: 12, color: "var(--muted)" }}>{[e.country, e.region, e.city, e.addressLine, e.postalCode].filter(Boolean).join(", ")}{e.note ? ` · ${e.note}` : ""}</td>
              </tr>
            ))}
            {(!st || st.entries.length === 0) && <tr><td colSpan={6} style={{ color: "var(--muted)", padding: 16 }}>No entries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
