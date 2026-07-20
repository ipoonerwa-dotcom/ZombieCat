"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/lib/useReveal";

type Shot = { src: string; zh: string; en: string };

const PROFILE: Shot = { src: "/brand/founder/profile.jpg", zh: "官方艺术家介绍", en: "Official artist profile" };
const PRESS: Shot[] = [
  { src: "/brand/founder/press-ranking.jpg", zh: "四年上榜 · 国际潮流艺术家排行榜 TOP100", en: "Four years on the International Trend Artist TOP 100" },
  { src: "/brand/founder/press-stage.jpg", zh: "秀场发布 · 2021 全球第 61 位", en: "Runway reveal · ranked #61 worldwide, 2021" },
];
const EXH: Shot[] = [
  { src: "/brand/founder/exhibition-gallery.jpg", zh: "魔鬼猫 IP 潮流艺术展", en: "ZombiesCat IP trend-art exhibition" },
  { src: "/brand/founder/exhibition-booths.jpg", zh: "潮流艺术超市 · 深圳创意周", en: "Pop-Art Supermarket · Shenzhen Creative Week" },
];
const STUDIO: Shot[] = [
  { src: "/brand/founder/studio-painting.jpg", zh: "工作室手绘创作", en: "Hand-painting in the studio" },
  { src: "/brand/founder/works-collage.jpg", zh: "作品风格合集", en: "Selected works & styles" },
];

export default function FounderPage() {
  const { t, lang } = useI18n();
  const [lightbox, setLightbox] = useState<{ src: string; cap: string } | null>(null);
  useReveal();

  const cap = (s: Shot) => (lang === "zh" ? s.zh : s.en);
  const shot = (s: Shot) => (
    <div key={s.src} className="story-shot reveal" onClick={() => setLightbox({ src: s.src, cap: cap(s) })}>
      <img src={s.src} alt={cap(s)} loading="lazy" />
      <div className="story-cap">{cap(s)}</div>
    </div>
  );

  return (
    <>
      <div className="section" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="checkout-grid" style={{ alignItems: "start", gap: 40 }}>
            {/* portrait */}
            <div className="reveal">
              <div style={{ position: "relative" }}>
                <div className="hero-visual" style={{ aspectRatio: "3/4", background: "#0f0c0d" }}>
                  <img
                    src="/brand/founder.jpg"
                    alt="Yuhai — Founder of ZOMBIESCAT"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div className="scanline" />
                </div>
                <div
                  className="chip"
                  style={{ position: "absolute", left: 14, bottom: 14, background: "rgba(10,7,8,0.85)" }}
                >
                  <span className="dot" />
                  {t("founder.rank")}
                </div>
              </div>

              <div className="founder-honor">
                <div className="fh-head"><span className="dot" />{t("founder.honor.head")}</div>
                <p className="fh-body">{t("founder.honor.body")}</p>
              </div>
            </div>

            {/* bio */}
            <div>
              <div className="kicker reveal">{t("founder.kicker")}</div>
              <h1 className="h-display reveal" style={{ fontSize: "clamp(34px,5vw,60px)", margin: "10px 0 6px" }}>
                {t("founder.title")}
              </h1>
              <p className="reveal reveal-d1" style={{ color: "var(--red)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 22 }}>
                {t("founder.sub")}
              </p>

              <div className="ip-profile reveal reveal-d1" style={{ gridTemplateColumns: "1fr", gap: 8, marginBottom: 24 }}>
                {["1", "2", "3", "4"].map((n) => (
                  <div key={n} className="ip-fact">
                    <span className="k">◆</span>
                    <span className="v">{t(`founder.cred.${n}`)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gap: 16, color: "var(--muted)", fontSize: 15, lineHeight: 1.85 }}>
                <p className="reveal reveal-d2">{t("founder.bio.1")}</p>
                <p className="reveal reveal-d2">{t("founder.bio.2")}</p>
                <p className="reveal reveal-d3">{t("founder.bio.3")}</p>
              </div>

              <div className="hero-cta reveal reveal-d3" style={{ marginTop: 28 }}>
                <Link href="/ip" className="btn btn-primary">{t("nav.ip")} →</Link>
                <Link href="/shop" className="btn btn-ghost">{t("nav.shop")}</Link>
              </div>
            </div>
          </div>

          {/* ARTIST STORY */}
          <section className="founder-story">
            <div className="kicker reveal">ARTIST STORY</div>
            <h2 className="h-section reveal">{t("founder.story.title")}</h2>
            <p className="lead reveal reveal-d1" style={{ marginBottom: 24 }}>{t("founder.story.sub")}</p>

            {shot(PROFILE)}

            <h3 className="story-sub reveal">{t("founder.story.press")}</h3>
            {PRESS.map(shot)}

            <h3 className="story-sub reveal">{t("founder.story.exh")}</h3>
            <div className="story-grid">{EXH.map(shot)}</div>

            <h3 className="story-sub reveal">{t("founder.story.studio")}</h3>
            <div className="story-grid">{STUDIO.map(shot)}</div>
          </section>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.cap} />
          <div className="lb-cap">{lightbox.cap}</div>
        </div>
      )}
    </>
  );
}
