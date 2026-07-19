"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { usd, shortAddr } from "@/lib/format";
import { usdCentsToTokens, DEFAULT_ZCAT_PER_USD } from "@/lib/pricing";
import { TOKEN_SYMBOL } from "@/lib/chain";
import { STORE_ABI, ERC20_ABI } from "@/lib/storeAbi";
import { WalletModal } from "@/components/WalletButton";

const OVERSEAS_FLAT_CENTS = 1900; // $19 flat overseas shipping (matches server default; admin-configurable)

type ShipRegion = "cn" | "overseas";
type Stage = "idle" | "creating" | "approving" | "burning" | "confirming";

export default function CartPage() {
  const { t, lang } = useI18n();
  const { detailed, subtotalUsdCents, lines, setQty, remove, clear, count } = useCart();
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const [region, setRegion] = useState<ShipRegion>("cn");
  const [form, setForm] = useState({
    recipient: "", email: "", phone: "", country: "", province: "", city: "", address: "", postal: "", note: "",
  });
  const [walletOpen, setWalletOpen] = useState(false);
  const [err, setErr] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [done, setDone] = useState<string | null>(null);
  const [liveRate, setLiveRate] = useState<number>(DEFAULT_ZCAT_PER_USD);
  const [rateSource, setRateSource] = useState<string>("manual");

  // live on-chain rate for display (checkout re-quotes server-side anyway)
  useEffect(() => {
    fetch("/api/rate")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && d.zcatPerUsd > 0) {
          setLiveRate(d.zcatPerUsd);
          setRateSource(d.source);
        }
      })
      .catch(() => {});
  }, []);

  const shipCents = region === "cn" ? 0 : OVERSEAS_FLAT_CENTS;
  const totalCents = subtotalUsdCents + shipCents;
  const zcatTotal = usdCentsToTokens(totalCents, liveRate);
  const busy = stage !== "idle";

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const stageLabel = () => {
    if (stage === "creating") return lang === "zh" ? "创建订单…" : "Creating order…";
    if (stage === "approving") return lang === "zh" ? "钱包授权…" : "Approve in wallet…";
    if (stage === "burning") return lang === "zh" ? "销毁 $ZCAT…" : "Burning $ZCAT…";
    if (stage === "confirming") return lang === "zh" ? "链上核验…" : "Verifying…";
    return t("checkout.pay");
  };

  const pay = async () => {
    setErr("");
    if (!isConnected || !address) {
      setWalletOpen(true);
      return;
    }
    const required = [form.recipient, form.email, form.phone, form.country, form.province, form.city, form.address];
    if (required.some((v) => !v.trim())) {
      setErr(t("checkout.required"));
      return;
    }
    try {
      setStage("creating");
      // 1) create the pending order server-side (prices recomputed from the catalog)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: lines,
          region,
          buyerAddress: address,
          recipient: form.recipient, email: form.email, phone: form.phone,
          country: form.country, province: form.province, city: form.city,
          address: form.address, postal: form.postal, note: form.note,
        }),
      }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error || "order_failed");

      const { orderNo, orderRef, tokenAmount, storeAddress, tokenAddress, demo } = res;

      if (demo || !storeAddress || !tokenAddress) {
        // Token/contract not live yet → record + confirm in demo mode (no real burn).
        await fetch(`/api/orders/${orderNo}/confirm`, { method: "POST" });
        setDone(orderNo);
        clear();
        setStage("idle");
        return;
      }

      // 2) real burn: approve the store to move the tokens, then purchase()
      const amount = BigInt(tokenAmount);
      setStage("approving");
      const approveHash = await writeContractAsync({
        address: tokenAddress, abi: ERC20_ABI, functionName: "approve", args: [storeAddress, amount],
      });
      await publicClient!.waitForTransactionReceipt({ hash: approveHash });

      setStage("burning");
      const burnHash = await writeContractAsync({
        address: storeAddress, abi: STORE_ABI, functionName: "purchase", args: [orderRef, amount],
      });
      await publicClient!.waitForTransactionReceipt({ hash: burnHash });

      // 3) confirm: backend verifies the Purchased event
      setStage("confirming");
      const conf = await fetch(`/api/orders/${orderNo}/confirm`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ txHash: burnHash }),
      }).then((r) => r.json());
      if (!conf.ok) throw new Error(conf.error || "verify_failed");

      setDone(orderNo);
      clear();
      setStage("idle");
    } catch (e) {
      const m = e instanceof Error ? e.message : "error";
      setErr(m.includes("User rejected") || m.includes("denied") ? (lang === "zh" ? "你在钱包里取消了" : "Cancelled in wallet") : m.slice(0, 140));
      setStage("idle");
    }
  };

  if (done) {
    return (
      <div className="section wrap" style={{ paddingTop: 60, maxWidth: 620 }}>
        <div className="card" style={{ textAlign: "center", padding: "48px 32px" }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔥</div>
          <h2 style={{ textTransform: "uppercase", marginBottom: 10 }}>
            {lang === "zh" ? "订单已提交" : "Order placed"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 8 }}>
            {lang === "zh" ? "订单号" : "Order No."} · <b style={{ fontFamily: "var(--mono)", color: "var(--toxic)" }}>{done}</b>
          </p>
          <p className="mini-note" style={{ maxWidth: 440, margin: "0 auto 24px" }}>{t("checkout.donenote")}</p>
          <Link href="/shop" className="btn btn-primary">{t("cart.continue")}</Link>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="section wrap" style={{ paddingTop: 70, textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>🛒</div>
        <h2 style={{ textTransform: "uppercase", marginBottom: 16 }}>{t("cart.empty")}</h2>
        <Link href="/shop" className="btn btn-primary">{t("cart.empty.cta")}</Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ paddingTop: 44 }}>
      <div className="wrap">
        <div className="kicker">{t("checkout.title")}</div>
        <h1 className="h-section" style={{ marginBottom: 26 }}>{t("cart.title")}</h1>

        <div className="checkout-grid">
          {/* LEFT: items + form */}
          <div style={{ display: "grid", gap: 18 }}>
            <div className="card">
              {detailed.map(({ product, qty }) => {
                const name = product.name;
                return (
                  <div className="line-item" key={product.slug} style={{ ["--li-accent" as string]: product.accent }}>
                    <div className="line-art">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt="" />
                      ) : (
                        <span>{product.art}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5 }}>{name}</div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>{usd(product.priceUsdCents)}</div>
                    </div>
                    <div className="qty">
                      <button onClick={() => setQty(product.slug, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => setQty(product.slug, qty + 1)}>+</button>
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontWeight: 800, minWidth: 74, textAlign: "right" }}>{usd(product.priceUsdCents * qty)}</div>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "6px 10px" }} onClick={() => remove(product.slug)}>✕</button>
                  </div>
                );
              })}
            </div>

            {/* shipping region */}
            <div className="card">
              <div className="kicker" style={{ marginBottom: 14 }}>{t("checkout.shipping")}</div>
              <div className="seg" style={{ marginBottom: 16 }}>
                <button className={region === "cn" ? "on" : ""} onClick={() => setRegion("cn")}>{t("checkout.china")}</button>
                <button className={region === "overseas" ? "on" : ""} onClick={() => setRegion("overseas")}>{t("checkout.overseas")}</button>
              </div>
              <div className={region === "cn" ? "notice-toxic" : "notice"} style={{ marginBottom: 18, padding: "10px 14px", borderRadius: 4, fontSize: 12.5 }}>
                {region === "cn" ? t("checkout.ship.free") : t("checkout.ship.overseas")}
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                <div className="field">
                  <label>{t("checkout.recipient")} <span className="req">*</span></label>
                  <input className="input" value={form.recipient} onChange={set("recipient")} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>{t("checkout.email")} <span className="req">*</span></label>
                    <input className="input" type="email" value={form.email} onChange={set("email")} />
                  </div>
                  <div className="field">
                    <label>{t("checkout.phone")} <span className="req">*</span></label>
                    <input className="input" value={form.phone} onChange={set("phone")} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>{t("checkout.country")} <span className="req">*</span></label>
                    <input className="input" placeholder={region === "cn" ? "中国" : "e.g. United States"} value={form.country} onChange={set("country")} />
                  </div>
                  <div className="field">
                    <label>{t("checkout.region")} <span className="req">*</span></label>
                    <input className="input" value={form.province} onChange={set("province")} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>{t("checkout.city")} <span className="req">*</span></label>
                    <input className="input" value={form.city} onChange={set("city")} />
                  </div>
                  <div className="field">
                    <label>{t("checkout.postal")}</label>
                    <input className="input" value={form.postal} onChange={set("postal")} />
                  </div>
                </div>
                <div className="field">
                  <label>{t("checkout.address")} <span className="req">*</span></label>
                  <input className="input" value={form.address} onChange={set("address")} />
                </div>
                <div className="field">
                  <label>{t("checkout.note")}</label>
                  <textarea className="textarea" value={form.note} onChange={set("note")} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: summary */}
          <div className="card" style={{ position: "sticky", top: 86 }}>
            <div className="kicker" style={{ marginBottom: 12 }}>{t("checkout.summary")}</div>
            <div className="summary-row"><span>{t("cart.goods")}</span><span className="v">{usd(subtotalUsdCents)}</span></div>
            <div className="summary-row"><span>{t("cart.shipping")}</span><span className="v">{shipCents === 0 ? (lang === "zh" ? "包邮" : "FREE") : usd(shipCents)}</span></div>
            <div className="summary-row total"><span>{t("cart.total")}</span><span className="v">{usd(totalCents)}</span></div>

            <div className="divider" />
            <div className="summary-row"><span style={{ color: "var(--muted)" }}>{t("checkout.willburn")}</span>
              <span className="v" style={{ color: "var(--toxic)" }}>{zcatTotal.toLocaleString("en-US")} {TOKEN_SYMBOL}</span></div>
            <div className="burn-note">🔥 {lang === "zh" ? "支付即销毁，永不回流" : "burned on payment, never returns"}</div>
            <div className="mini-note" style={{ marginTop: 6 }}>
              {t("checkout.rate")}: 1 USD ≈ {Math.round(liveRate).toLocaleString("en-US")} {TOKEN_SYMBOL}
              {rateSource !== "manual" && <span style={{ color: "var(--red)" }}> · LIVE</span>}
            </div>

            {err && <div className="notice" style={{ marginTop: 14 }}>{err}</div>}

            <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={pay} disabled={busy}>
              {busy ? stageLabel() : isConnected ? t("checkout.pay") : t("checkout.connectfirst")}
            </button>
            {isConnected && (
              <p className="mini-note" style={{ marginTop: 8, textAlign: "center" }}>
                {shortAddr(address)} · Robinhood Chain
              </p>
            )}
            <div className="notice-red" style={{ marginTop: 14, fontSize: 12 }}>{t("checkout.paynote")}</div>
          </div>
        </div>
      </div>
      {walletOpen && <WalletModal onClose={() => setWalletOpen(false)} />}
    </div>
  );
}
