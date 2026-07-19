"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { usd } from "@/lib/format";

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = getProduct(params.slug);
  if (!product) {
    return (
      <div className="section wrap" style={{ paddingTop: 80 }}>
        <p className="lead">404 · {t("shop.empty")}</p>
        <Link href="/shop" className="btn btn-ghost btn-sm" style={{ marginTop: 16 }}>{t("product.back")}</Link>
      </div>
    );
  }

  const name = product.name; // English-only product copy
  const desc = product.desc;

  const doAdd = () => {
    add(product.slug, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };
  const buyNow = () => {
    add(product.slug, qty);
    router.push("/cart");
  };

  return (
    <div className="section" style={{ paddingTop: 40 }}>
      <div className="wrap">
        <Link href="/shop" className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }}>{t("product.back")}</Link>
        <div className="checkout-grid">
          <div
            className="hero-visual"
            style={{ aspectRatio: "1/1", background: product.image ? "#fff" : "var(--panel-solid)", border: `1px solid ${product.accent}33` }}
          >
            {product.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt={name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 18 }} />
            ) : (
              <span className="emoji" style={{ filter: `drop-shadow(0 0 40px ${product.accent})` }}>{product.art}</span>
            )}
          </div>

          <div>
            <div className="kicker">{t(`shop.${product.category}`)}</div>
            <h1 style={{ fontSize: "clamp(28px,4vw,42px)", textTransform: "uppercase", marginBottom: 14 }}>{name}</h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--mono)", fontWeight: 800, fontSize: 30 }}>{usd(product.priceUsdCents)}</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{t("common.usd")}</span>
            </div>

            <p style={{ color: "var(--muted)", fontSize: 14.5, lineHeight: 1.75, marginBottom: 22 }}>{desc}</p>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)", textTransform: "uppercase" }}>{t("product.qty")}</span>
              <div className="qty">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((q) => Math.min(99, q + 1))}>+</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-punk" onClick={buyNow}>{t("product.buy")}</button>
              <button className={added ? "btn btn-primary" : "btn btn-ghost"} onClick={doAdd}>
                {added ? t("shop.added") : t("product.add")}
              </button>
            </div>

            <div className="notice-toxic" style={{ marginTop: 22, padding: "12px 15px", borderRadius: 4, fontSize: 12.5 }}>
              {t("product.ship")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
