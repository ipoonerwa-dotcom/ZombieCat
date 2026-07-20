"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";
import WalletButton from "@/components/WalletButton";
import { TOKEN_SYMBOL, EXPLORER_BASE } from "@/lib/tokenConfig";
import { shortAddr } from "@/lib/format";

type Range = [number, number];
interface PublicState {
  config: { status: "soon" | "open" | "closed" | "drawn"; deadline: string; tokensPerTicket: number; prizeSlug: string; prizeCount: number };
  prize: { slug: string; name: string; image: string; priceUsdCents: number };
  totalTickets: number;
  participants: number;
  winner: null | { number: number; address: string; seedBlock: string; seedHash: string; drawnAt: string };
}
interface MyState {
  balanceWei: string; available: number; committed: number; canAdd: number; ranges: Range[]; hasShipping: boolean; won: boolean;
}

const pad = (n: number) => "#" + String(n).padStart(5, "0");
const fmtNum = (n: number) => n.toLocaleString("en-US");

function tokensFromWei(wei: string): number {
  try { return Number(BigInt(wei) / 10n ** 18n); } catch { return 0; }
}

export default function RafflePage() {
  const { t, lang } = useI18n();
  const { address, isConnected } = useAccount();
  const zh = lang === "zh";

  const [pub, setPub] = useState<PublicState | null>(null);
  const [me, setMe] = useState<MyState | null>(null);
  const [qty, setQty] = useState(1);
  const [ship, setShip] = useState({ recipient: "", phone: "", country: zh ? "中国" : "China", region: "", city: "", addressLine: "", postalCode: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [now, setNow] = useState(0);

  const L = useMemo(() => (zh ? ZH : EN), [zh]);

  const loadPub = useCallback(async () => {
    const r = await fetch("/api/raffle").then((x) => x.json()).catch(() => null);
    if (r?.ok) setPub(r);
  }, []);
  const loadMe = useCallback(async () => {
    if (!address) { setMe(null); return; }
    const r = await fetch(`/api/raffle/me?address=${address}`).then((x) => x.json()).catch(() => null);
    if (r?.ok) { setMe(r); setQty((q) => Math.min(Math.max(1, q), Math.max(1, r.canAdd))); }
  }, [address]);

  useEffect(() => { loadPub(); }, [loadPub]);
  useEffect(() => { loadMe(); }, [loadMe]);
  useEffect(() => {
    const id = setInterval(() => { loadPub(); loadMe(); }, 25000);
    return () => clearInterval(id);
  }, [loadPub, loadMe]);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = pub?.config.status ?? "open";
  const perTicket = pub?.config.tokensPerTicket ?? 100000;
  const deadlineMs = pub?.config.deadline ? new Date(pub.config.deadline).getTime() : 0;
  const remaining = deadlineMs && now ? deadlineMs - now : 0;

  const submit = async () => {
    if (!address || !me) return;
    setBusy(true); setMsg(null);
    try {
      const needShip = !me.hasShipping;
      const r = await fetch("/api/raffle/enter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, quantity: qty, shipping: needShip ? ship : undefined }),
      }).then((x) => x.json());
      if (r.ok) {
        setMsg({ kind: "ok", text: L.entered(r.assigned as Range) });
        await Promise.all([loadPub(), loadMe()]);
      } else {
        setMsg({ kind: "err", text: L.err(r.error) });
      }
    } catch {
      setMsg({ kind: "err", text: L.err("network") });
    } finally {
      setBusy(false);
    }
  };

  const balTokens = me ? tokensFromWei(me.balanceWei) : 0;
  const chance = pub && me && pub.totalTickets > 0 ? (me.committed / pub.totalTickets) * 100 : 0;

  return (
    <div className="section" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="kicker">{L.kicker}</div>
        <h1 className="h-section" style={{ marginBottom: 6 }}>{L.title}</h1>
        <p className="lead" style={{ marginBottom: 30 }}>{L.sub(perTicket)}</p>

        <div className="raffle-grid">
          {/* PRIZE */}
          <div className="raffle-prize card">
            <div className="rp-media">
              {pub && <img src={pub.prize.image} alt={pub.prize.name} />}
              <span className="rp-count">×{pub?.config.prizeCount ?? 1}</span>
            </div>
            <div className="rp-tag">{L.prizeTag}</div>
            <h3 className="rp-name">{pub?.prize.name ?? "—"}</h3>
            <div className={`rp-status rp-${status}`}>
              <span className="dot" />
              {status === "open" ? L.open : status === "soon" ? L.soonS : status === "closed" ? L.closedS : L.drawnS}
            </div>
            <div className="rp-count-row">
              <div><div className="rp-k">{L.totalTickets}</div><div className="rp-v">{fmtNum(pub?.totalTickets ?? 0)}</div></div>
              <div><div className="rp-k">{L.players}</div><div className="rp-v">{fmtNum(pub?.participants ?? 0)}</div></div>
            </div>
            {deadlineMs > 0 && (status === "open" || status === "closed") && (
              <div className="rp-countdown">
                <div className="rp-k">{remaining > 0 ? L.endsIn : L.ended}</div>
                {remaining > 0 && <Countdown ms={remaining} zh={zh} />}
                {remaining <= 0 && <div className="rp-v" style={{ color: "var(--red)" }}>{L.awaitingDraw}</div>}
              </div>
            )}
            {!deadlineMs && status === "open" && <div className="rp-countdown"><div className="rp-k">{L.endsIn}</div><div className="rp-v">{L.tba}</div></div>}
          </div>

          {/* ENTRY / STATUS */}
          <div className="raffle-panel card">
            {status === "soon" && (
              <div className="raffle-connect">
                <div className="rc-emoji">⏳</div>
                <h3>{L.soonTitle}</h3>
                <p>{L.soonSub(perTicket)}</p>
                {isConnected && me ? (
                  <div className="soon-preview">{L.soonEligible(me.available)}</div>
                ) : (
                  <WalletButton />
                )}
              </div>
            )}

            {status !== "soon" && !isConnected && (
              <div className="raffle-connect">
                <div className="rc-emoji">🎟️</div>
                <h3>{L.connectTitle}</h3>
                <p>{L.connectSub(perTicket)}</p>
                <WalletButton />
              </div>
            )}

            {status !== "soon" && isConnected && me && (
              <>
                <div className="raffle-stats">
                  <div className="rs"><div className="rs-k">{L.balance}</div><div className="rs-v">{fmtNum(balTokens)} <span>${TOKEN_SYMBOL}</span></div></div>
                  <div className="rs"><div className="rs-k">{L.available}</div><div className="rs-v red">{me.available}</div></div>
                  <div className="rs"><div className="rs-k">{L.committed}</div><div className="rs-v">{me.committed}</div></div>
                  <div className="rs"><div className="rs-k">{L.odds}</div><div className="rs-v">{chance ? chance.toFixed(2) + "%" : "—"}</div></div>
                </div>

                {me.ranges.length > 0 && (
                  <div className="raffle-numbers">
                    <div className="rn-head">{L.yourNumbers}</div>
                    <div className="rn-list">
                      {me.ranges.map(([s, e], i) => (
                        <span className="rn-chip" key={i}>{s === e ? pad(s) : `${pad(s)}–${pad(e)}`}</span>
                      ))}
                    </div>
                  </div>
                )}

                {status === "open" && me.canAdd > 0 && (
                  <div className="raffle-enter">
                    <div className="re-qty">
                      <span className="re-label">{L.enterQty}</span>
                      <div className="qty-box">
                        <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</button>
                        <input
                          type="number" min={1} max={me.canAdd} value={qty}
                          onChange={(e) => setQty(Math.max(1, Math.min(me.canAdd, Math.floor(Number(e.target.value) || 1))))}
                        />
                        <button onClick={() => setQty((q) => Math.min(me.canAdd, q + 1))} disabled={qty >= me.canAdd}>+</button>
                      </div>
                      <button className="re-max" onClick={() => setQty(me.canAdd)}>{L.max} ({me.canAdd})</button>
                    </div>

                    {!me.hasShipping && (
                      <div className="re-ship">
                        <div className="re-ship-head">{L.shipHead}</div>
                        <div className="re-ship-grid">
                          <input placeholder={L.f.recipient} value={ship.recipient} onChange={(e) => setShip({ ...ship, recipient: e.target.value })} />
                          <input placeholder={L.f.phone} value={ship.phone} onChange={(e) => setShip({ ...ship, phone: e.target.value })} />
                          <input placeholder={L.f.country} value={ship.country} onChange={(e) => setShip({ ...ship, country: e.target.value })} />
                          <input placeholder={L.f.region} value={ship.region} onChange={(e) => setShip({ ...ship, region: e.target.value })} />
                          <input placeholder={L.f.city} value={ship.city} onChange={(e) => setShip({ ...ship, city: e.target.value })} />
                          <input placeholder={L.f.postal} value={ship.postalCode} onChange={(e) => setShip({ ...ship, postalCode: e.target.value })} />
                          <input className="span2" placeholder={L.f.address} value={ship.addressLine} onChange={(e) => setShip({ ...ship, addressLine: e.target.value })} />
                          <input className="span2" placeholder={L.f.note} value={ship.note} onChange={(e) => setShip({ ...ship, note: e.target.value })} />
                        </div>
                        <p className="re-ship-note">{L.shipNote}</p>
                      </div>
                    )}

                    <button className="btn btn-primary btn-block" onClick={submit} disabled={busy}>
                      {busy ? L.submitting : L.enterBtn(qty)}
                    </button>
                  </div>
                )}

                {status === "open" && me.canAdd <= 0 && me.available <= 0 && (
                  <div className="raffle-hint">{L.needTokens(perTicket)} <Link href="/shop" className="red-text">{L.goShop}</Link></div>
                )}
                {status === "open" && me.canAdd <= 0 && me.available > 0 && (
                  <div className="raffle-hint">{L.allCommitted}</div>
                )}
                {status === "closed" && <div className="raffle-hint">{L.closedHint}</div>}

                {msg && <div className={`raffle-msg ${msg.kind}`}>{msg.text}</div>}
              </>
            )}
          </div>
        </div>

        {/* WINNER */}
        {pub?.winner && (
          <div className={`raffle-winner ${me?.won ? "you-won" : ""}`}>
            <div className="rw-badge">{me?.won ? L.youWon : L.winnerTitle}</div>
            <div className="rw-number">{pad(pub.winner.number)}</div>
            <div className="rw-addr">
              {L.winnerAddr}: <a href={`${EXPLORER_BASE}/address/${pub.winner.address}`} target="_blank" rel="noopener noreferrer">{shortAddr(pub.winner.address)}</a>
            </div>
            <div className="rw-verify">
              <div>{L.verifyHead}</div>
              <code>winningNumber = keccak256(blockHash) mod {fmtNum(pub.totalTickets)} + 1</code>
              <div className="rw-seed">
                <span>block <a href={`${EXPLORER_BASE}/block/${pub.winner.seedBlock}`} target="_blank" rel="noopener noreferrer">#{pub.winner.seedBlock}</a></span>
                <span className="rw-hash">{pub.winner.seedHash}</span>
              </div>
            </div>
          </div>
        )}

        {/* RULES */}
        <div className="raffle-rules">
          <h3>{L.rulesTitle}</h3>
          <ol>
            {L.rules(perTicket).map((r, i) => <li key={i}>{r}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Countdown({ ms, zh }: { ms: number; zh: boolean }) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const unit = zh ? ["天", "时", "分", "秒"] : ["d", "h", "m", "s"];
  const cells: [number, string][] = [[d, unit[0]], [h, unit[1]], [m, unit[2]], [sec, unit[3]]];
  return (
    <div className="countdown">
      {cells.map(([v, u], i) => (
        <div className="cd-cell" key={i}><b>{String(v).padStart(2, "0")}</b><span>{u}</span></div>
      ))}
    </div>
  );
}

// -------- page copy (bilingual) --------
const errMap: Record<string, { zh: string; en: string }> = {
  raffle_closed: { zh: "活动已截止,无法参与。", en: "The raffle is closed." },
  no_tickets: { zh: "当前持仓不足,无可用奖券。", en: "Not enough holdings for a ticket." },
  exceeds_available: { zh: "超过你的可用奖券数量。", en: "Exceeds your available tickets." },
  shipping_required: { zh: "请填写收货信息(姓名/电话/国家/地址)。", en: "Please fill in shipping (name / phone / country / address)." },
  bad_quantity: { zh: "数量不合法。", en: "Invalid quantity." },
  bad_address: { zh: "钱包地址无效。", en: "Invalid wallet address." },
  network: { zh: "网络错误,请重试。", en: "Network error, try again." },
};

const ZH = {
  kicker: "HODL RAFFLE · 持币抽奖",
  title: "持币抽奖",
  sub: (n: number) => `每持有 ${n.toLocaleString()} 枚 $${TOKEN_SYMBOL} = 1 张带编号奖券。截止后链上开出一个中奖号,赢取实物奖品。`,
  prizeTag: "本期奖品",
  open: "进行中 · 可参与", soonS: "即将开放", closedS: "已截止 · 待开奖", drawnS: "已开奖",
  soonTitle: "抽奖即将开放",
  soonSub: (n: number) => `报名暂未开放,敬请期待。开放后每持有 ${n.toLocaleString()} 枚 $${TOKEN_SYMBOL} 即可获得 1 张带编号奖券。`,
  soonEligible: (a: number) => `按你当前持仓,开放后你将拥有约 ${a} 张奖券。`,
  totalTickets: "奖券总数", players: "参与人数",
  endsIn: "距截止", ended: "已到截止", awaitingDraw: "等待开奖", tba: "待定",
  connectTitle: "连接钱包参与抽奖",
  connectSub: (n: number) => `连接后自动读取你的 $${TOKEN_SYMBOL} 持仓,每 ${n.toLocaleString()} 枚可换 1 张奖券。`,
  balance: "持仓", available: "可用奖券", committed: "已投入", odds: "中奖概率",
  yourNumbers: "你的奖券号",
  enterQty: "投入奖券数量", max: "全部",
  shipHead: "收货信息(中奖后寄送,仅本站可见)",
  f: { recipient: "收件人姓名", phone: "手机号", country: "国家/地区", region: "省/州", city: "城市", postal: "邮编", address: "详细地址", note: "备注(选填)" },
  shipNote: "地址信息仅用于中奖寄送,不上链、不公开。",
  submitting: "提交中…",
  enterBtn: (q: number) => `投入 ${q} 张奖券参与`,
  entered: (r: Range) => `参与成功!已分配奖券号 ${r[0] === r[1] ? pad(r[0]) : `${pad(r[0])}–${pad(r[1])}`}。`,
  needTokens: (n: number) => `你还没有足够的 $${TOKEN_SYMBOL}(每 ${n.toLocaleString()} 枚 = 1 券)。`,
  goShop: "去商城 →",
  allCommitted: "你已投入全部可用奖券。加仓后可继续追加。",
  closedHint: "活动已截止,正在等待开奖。",
  youWon: "🎉 恭喜你中奖了!",
  winnerTitle: "中奖号码",
  winnerAddr: "中奖地址",
  verifyHead: "开奖可验证 · 任何人可复算:",
  rulesTitle: "活动规则",
  rules: (n: number) => [
    `连接钱包,系统按链上持仓计算奖券:每 ${n.toLocaleString()} 枚 $${TOKEN_SYMBOL} = 1 张奖券。`,
    "点击参与并选择投入的奖券数量,首次参与需填写收货信息(仅本站可见,不上链)。",
    "每张投入的奖券会分配到一个唯一编号,加仓后可追加投入。",
    "活动截止后,取一个 Robinhood 区块哈希作为随机种子:中奖号 = keccak256(区块哈希) mod 奖券总数 + 1,区块号与哈希公开可复算。",
    "持有该中奖编号的地址赢得奖品;我们按其收货信息寄出。",
  ],
  err: (code: string) => errMap[code]?.zh ?? `参与失败(${code})。`,
};

const EN = {
  kicker: "HODL RAFFLE",
  title: "Holder Raffle",
  sub: (n: number) => `Every ${n.toLocaleString()} $${TOKEN_SYMBOL} you hold = 1 numbered ticket. One winning number is drawn on-chain at the deadline for a real prize.`,
  prizeTag: "This round's prize",
  open: "Live · open", soonS: "Coming soon", closedS: "Closed · awaiting draw", drawnS: "Drawn",
  soonTitle: "Raffle opens soon",
  soonSub: (n: number) => `Entries aren't open yet — stay tuned. When it goes live, every ${n.toLocaleString()} $${TOKEN_SYMBOL} you hold earns 1 numbered ticket.`,
  soonEligible: (a: number) => `Based on your current holdings, you'll have about ${a} ticket(s) when it opens.`,
  totalTickets: "Total tickets", players: "Entrants",
  endsIn: "Ends in", ended: "Deadline reached", awaitingDraw: "Awaiting draw", tba: "TBA",
  connectTitle: "Connect wallet to enter",
  connectSub: (n: number) => `We read your $${TOKEN_SYMBOL} balance — every ${n.toLocaleString()} tokens is worth 1 ticket.`,
  balance: "Balance", available: "Available tickets", committed: "Entered", odds: "Win chance",
  yourNumbers: "Your ticket numbers",
  enterQty: "Tickets to enter", max: "Max",
  shipHead: "Shipping (used only if you win · off-chain)",
  f: { recipient: "Recipient name", phone: "Phone", country: "Country", region: "State/Province", city: "City", postal: "Postal code", address: "Full address", note: "Note (optional)" },
  shipNote: "Address is used only to ship a prize — never on-chain, never public.",
  submitting: "Submitting…",
  enterBtn: (q: number) => `Enter with ${q} ticket${q > 1 ? "s" : ""}`,
  entered: (r: Range) => `You're in! Assigned ${r[0] === r[1] ? pad(r[0]) : `${pad(r[0])}–${pad(r[1])}`}.`,
  needTokens: (n: number) => `You don't hold enough $${TOKEN_SYMBOL} yet (every ${n.toLocaleString()} = 1 ticket).`,
  goShop: "Go to shop →",
  allCommitted: "You've entered all available tickets. Buy more to add.",
  closedHint: "Entries closed — awaiting the draw.",
  youWon: "🎉 You won!",
  winnerTitle: "Winning number",
  winnerAddr: "Winner",
  verifyHead: "Provably fair · anyone can recompute:",
  rulesTitle: "How it works",
  rules: (n: number) => [
    `Connect your wallet; tickets are computed from your on-chain balance: every ${n.toLocaleString()} $${TOKEN_SYMBOL} = 1 ticket.`,
    "Click enter and choose how many tickets to commit; first entry collects shipping (off-chain, private).",
    "Each committed ticket gets a unique number; buy more and you can add more.",
    "At the deadline a Robinhood block hash seeds the draw: winningNumber = keccak256(blockHash) mod total + 1. Block number and hash are published to recompute.",
    "The address holding that number wins the prize; we ship to the details on file.",
  ],
  err: (code: string) => errMap[code]?.en ?? `Entry failed (${code}).`,
};
