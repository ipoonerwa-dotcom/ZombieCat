"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/lib/useReveal";

const FACTS = [
  "name", "en", "birthday", "height", "weight", "attr",
  "color", "planet", "skill", "likes", "dislikes", "motto", "personality", "fun",
] as const;

const GALLERY = [
  { src: "/brand/art/art-01.png", cap: "Masterpiece · The Fifer" },
  { src: "/brand/art/art-02.jpg", cap: "Masterpiece E20" },
  { src: "/brand/art/art-03.jpg", cap: "Masterpiece E33" },
  { src: "/brand/art/art-04.jpg", cap: "Masterpiece E34" },
  { src: "/brand/art/art-05.jpg", cap: "Fine-art A29" },
  { src: "/brand/art/art-06.jpg", cap: "Fine-art A65" },
  { src: "/brand/art/art-07.png", cap: "Kung-fu E02" },
  { src: "/brand/art/art-08.jpg", cap: "Street A13" },
  { src: "/brand/art/art-09.png", cap: "Poker C20" },
  { src: "/brand/art/art-10.jpg", cap: "Comic D03" },
];

export default function IpPage() {
  const { t, lang } = useI18n();
  const [lightbox, setLightbox] = useState<{ src: string; cap: string } | null>(null);
  useReveal();

  return (
    <>
      {/* HERO */}
      <header className="ip-hero">
        <div className="wrap hero-grid">
          <div>
            <div className="kicker">{t("ip.kicker")}</div>
            <h1 className="h-display" style={{ margin: "14px 0" }}>
              {t("ip.title")}
              <br />
              <span className="red-text">{t("ip.slogan")}</span>
            </h1>
            <p className="hero-sub">{t("ip.sub")}</p>
            <div className="hero-cta">
              <Link href="/shop" className="btn btn-primary">{t("home.hero.cta")} →</Link>
              <Link href="/memes" className="btn btn-ghost">{t("memes.title")}</Link>
            </div>
          </div>
          <div className="hero-visual" style={{ background: "radial-gradient(circle at 50% 42%, rgba(238,29,43,0.22), transparent 62%), var(--panel-solid)" }}>
            <img src="/brand/poses2-transparent.png" alt="ZombiesCat poses" className="hero-mascot" />
            <div className="scanline" />
          </div>
        </div>
      </header>

      {/* BRAND STATS */}
      <section className="section" style={{ paddingTop: 30, paddingBottom: 50 }}>
        <div className="wrap">
          <div className="card reveal" style={{ padding: "6px 18px" }}>
            <div className="stats-strip">
              <div className="stat"><div className="stat-num">¥1B+</div><div className="stat-label">{t("ip.stats.revenue")}</div></div>
              <div className="stat"><div className="stat-num">~10,000</div><div className="stat-label">{t("ip.stats.stores")}</div></div>
              <div className="stat"><div className="stat-num">100+</div><div className="stat-label">{t("ip.stats.collabs")}</div></div>
              <div className="stat"><div className="stat-num">4×</div><div className="stat-label">{t("ip.stats.top")}</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* PROFILE */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="kicker reveal">{t("ip.profile")}</div>
          <h2 className="h-section reveal">{t("ip.profile")}</h2>
          <div className="ip-profile" style={{ marginTop: 26 }}>
            {FACTS.map((k, i) => (
              <div key={k} className={`ip-fact reveal reveal-d${(i % 3) + 1}`}>
                <span className="k">{t(`ip.k.${k}`)}</span>
                <span className="v">{t(`ip.v.${k}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <div className="checkout-grid" style={{ alignItems: "center" }}>
            <div>
              <div className="kicker reveal">{t("ip.story")}</div>
              <h2 className="h-section reveal">{lang === "zh" ? "从 ZC66 到地球" : "From ZC66 to Earth"}</h2>
              <p className="reveal reveal-d1" style={{ color: "var(--muted)", fontSize: 15.5, lineHeight: 1.9 }}>
                {t("ip.story.text")}
              </p>
            </div>
            <div className="hero-visual reveal reveal-d2" style={{ aspectRatio: "16/10" }}>
              <img src="/brand/standard-3d.jpg" alt="ZombiesCat standard 3D turnaround" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <div className="kicker reveal">{t("ip.gallery")}</div>
          <h2 className="h-section reveal">{t("ip.gallery")}</h2>
          <p className="lead reveal reveal-d1" style={{ marginBottom: 26 }}>{t("ip.gallery.sub")}</p>
          <div className="gallery">
            {GALLERY.map((g, i) => (
              <div
                key={g.src}
                className={`gallery-item reveal reveal-d${(i % 3) + 1}`}
                onClick={() => setLightbox(g)}
              >
                <img src={g.src} alt={g.cap} loading="lazy" />
                <div className="cap">{g.cap}</div>
                <a
                  className="dl"
                  href={g.src}
                  download={`zombiescat-${g.cap.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}${g.src.slice(g.src.lastIndexOf("."))}`}
                  title={t("gallery.download")}
                  aria-label={t("gallery.download")}
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.cap} />
          <div className="lb-cap">{lightbox.cap}</div>
          <a
            className="btn btn-primary btn-sm lb-dl"
            href={lightbox.src}
            download
            onClick={(e) => e.stopPropagation()}
          >
            ↓ {t("gallery.download")}
          </a>
        </div>
      )}
    </>
  );
}
