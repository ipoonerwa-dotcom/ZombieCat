"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useReveal } from "@/lib/useReveal";

export default function FounderPage() {
  const { t } = useI18n();
  useReveal();

  return (
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
      </div>
    </div>
  );
}
