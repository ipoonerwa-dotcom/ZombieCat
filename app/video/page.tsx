"use client";

import { useI18n } from "@/lib/i18n";
import Logo from "@/components/Logo";

// Video showcase — placeholder until the brand delivers film assets.
// Later: replace the TBC block with a <video> / player grid.
export default function VideoPage() {
  const { t } = useI18n();

  return (
    <div className="section" style={{ paddingTop: 56, minHeight: "72vh" }}>
      <div className="wrap">
        <div className="kicker">{t("video.kicker")}</div>
        <h1 className="h-section">{t("video.title")}</h1>

        <div className="tbc-stage">
          <div className="scanline" />
          <Logo size={84} />
          <div className="tbc-text">{t("video.tbc")}</div>
          <div className="tbc-bar"><span /></div>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>{t("video.sub")}</p>
        </div>
      </div>
    </div>
  );
}
