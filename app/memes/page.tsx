"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

// Official sticker GIFs extracted from the brand sticker library (public/brand/memes).
const SERIES: { tag: string; count: number }[] = [
  { tag: "sport", count: 6 },
  { tag: "crazy", count: 6 },
  { tag: "social", count: 6 },
  { tag: "chat", count: 6 },
  { tag: "dance", count: 6 },
  { tag: "newyear", count: 4 },
];

interface Meme {
  src: string;
  tag: string;
  name: string;
}

const MEMES: Meme[] = SERIES.flatMap((s) =>
  Array.from({ length: s.count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return { src: `/brand/memes/${s.tag}-${n}.gif`, tag: s.tag, name: `zombiescat-${s.tag}-${n}.gif` };
  })
);

export default function MemesPage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<string>("all");
  const list = MEMES.filter((m) => cat === "all" || m.tag === cat);

  return (
    <div className="section" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="kicker">MEME ARMORY</div>
        <h1 className="h-section">{t("memes.title")}</h1>
        <p className="lead" style={{ marginBottom: 26 }}>{t("memes.sub")}</p>

        <div className="cat-tabs" style={{ marginBottom: 28 }}>
          <button className={`cat-tab ${cat === "all" ? "on" : ""}`} onClick={() => setCat("all")}>
            {t("memes.all")}
          </button>
          {SERIES.map((s) => (
            <button key={s.tag} className={`cat-tab ${cat === s.tag ? "on" : ""}`} onClick={() => setCat(s.tag)}>
              {t(`memes.${s.tag}`)}
            </button>
          ))}
        </div>

        <div className="meme-grid">
          {list.map((m) => (
            <div key={m.src} className="meme-card">
              <img src={m.src} alt={m.name} loading="lazy" />
              <span className="tag">{t(`memes.${m.tag}`)}</span>
              <a className="dl" href={m.src} download={m.name} aria-label={t("memes.download")} title={t("memes.download")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </a>
            </div>
          ))}
        </div>

        <p className="mini-note" style={{ marginTop: 22 }}>{t("memes.hint")}</p>
      </div>
    </div>
  );
}
