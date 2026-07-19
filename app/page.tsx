"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/lib/useReveal";
/* eslint-disable @next/next/no-img-element */
import { PRODUCTS } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function Home() {
  const { t } = useI18n();
  useReveal();
  // Featured picks per brand request: vinyl doll, graffiti ANC, Weidian doodle
  // headphones, Weidian cola power bank.
  const FEATURED_SLUGS = ["vinyl-doll", "anc-headphones", "doodle-headphones", "cola-powerbank"];
  const featured = FEATURED_SLUGS
    .map((s) => PRODUCTS.find((p) => p.slug === s))
    .filter((p): p is (typeof PRODUCTS)[number] => Boolean(p));

  const HOW = [
    { k: "1", accent: "var(--toxic)" },
    { k: "2", accent: "var(--magenta)" },
    { k: "3", accent: "var(--cyan)" },
    { k: "4", accent: "var(--purple)" },
  ];

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="chip">
              <span className="dot" />
              {t("home.hero.kicker")}
            </span>
            <h1 className="h-display" style={{ marginTop: 20 }}>
              {t("home.hero.title1")}
              <br />
              <span className="toxic-text">{t("home.hero.title2")}</span>
            </h1>
            <p className="hero-sub">{t("home.hero.sub")}</p>
            <div className="hero-cta">
              <Link href="/shop" className="btn btn-primary">
                {t("home.hero.cta")} →
              </Link>
              <a href="#how" className="btn btn-ghost">
                {t("home.hero.cta2")}
              </a>
            </div>
            <p style={{ marginTop: 20, fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", letterSpacing: "0.06em" }}>
              {t("home.hero.free")}
            </p>
          </div>
          <div className="hero-visual hero-visual-spin">
            <img src="/brand/zombiescat-spin.gif" alt="ZombiesCat spinning" className="hero-spin" />
          </div>
        </div>
      </header>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          <span>
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i}>吞噬负能量 ✦ THE INVASION HAS BEGUN ✦ $ZCAT ✦ BURN &amp; SHIP ✦ ZOMBIESCAT × THE WORLD ✦</span>
            ))}
          </span>
        </div>
      </div>

      {/* MEET THE IP */}
      <section className="section" id="ip">
        <div className="wrap">
          <div className="checkout-grid" style={{ alignItems: "center" }}>
            <div>
              <div className="kicker reveal">{t("home.ip.kicker")}</div>
              <h2 className="h-section reveal">{t("home.ip.title")}</h2>
              <p className="lead reveal reveal-d1" style={{ marginBottom: 22 }}>{t("home.ip.desc")}</p>
              <div className="grid grid-2 reveal reveal-d2" style={{ gap: 10, marginBottom: 26, maxWidth: 520 }}>
                {["f1", "f2", "f3", "f4"].map((f) => (
                  <div key={f} className="ip-fact">
                    <span className="v" style={{ fontSize: 13 }}>{t(`home.ip.${f}`)}</span>
                  </div>
                ))}
              </div>
              <Link href="/ip" className="btn btn-primary reveal reveal-d3">{t("home.ip.cta")}</Link>
            </div>
            <div className="hero-visual reveal reveal-d2" style={{ aspectRatio: "4/3" }}>
              <img src="/brand/standard-3d.jpg" alt="ZombiesCat standard model" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="kicker reveal">{t("home.how.kicker")}</div>
          <h2 className="h-section reveal">{t("home.how.title")}</h2>
          <div className="grid grid-4" style={{ marginTop: 34 }}>
            {HOW.map((h, i) => (
              <div key={h.k} className={`card reveal reveal-d${(i % 3) + 1}`} style={{ borderTop: `2px solid ${h.accent}` }}>
                <h3 style={{ fontSize: 18, marginBottom: 8, color: h.accent }}>{t(`home.how.${h.k}.t`)}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13.5 }}>{t(`home.how.${h.k}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div className="kicker reveal">{t("home.featured.kicker")}</div>
              <h2 className="h-section reveal" style={{ marginBottom: 0 }}>{t("home.featured.title")}</h2>
            </div>
            <Link href="/shop" className="btn btn-ghost btn-sm reveal">{t("home.featured.all")}</Link>
          </div>
          <div className="grid grid-4" style={{ marginTop: 28 }}>
            {featured.map((p) => (
              <div key={p.slug} className="reveal">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="card reveal" style={{ padding: "6px 18px" }}>
            <div className="stats-strip">
              <div className="stat">
                <div className="stat-num">1.2M</div>
                <div className="stat-label">{t("home.stats.burned")}</div>
              </div>
              <div className="stat">
                <div className="stat-num">340</div>
                <div className="stat-label">{t("home.stats.orders")}</div>
              </div>
              <div className="stat">
                <div className="stat-num">1,284</div>
                <div className="stat-label">{t("home.stats.holders")}</div>
              </div>
              <div className="stat">
                <div className="stat-num">{PRODUCTS.length}</div>
                <div className="stat-label">{t("home.stats.products")}</div>
              </div>
            </div>
          </div>
          <p className="mini-note" style={{ textAlign: "center", marginTop: 10 }}>
            * demo figures — burn/orders/holders are placeholders until launch
          </p>
        </div>
      </section>
    </>
  );
}
