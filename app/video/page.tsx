"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

// Video showcase — the brand promo reel (vertical 9:16). Autoplays muted
// on loop like a reel; a tap-to-unmute overlay enables sound.
export default function VideoPage() {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const unmute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    void v.play();
    setMuted(false);
  };

  return (
    <div className="section" style={{ paddingTop: 56, minHeight: "72vh" }}>
      <div className="wrap">
        <div className="kicker">{t("video.kicker")}</div>
        <h1 className="h-section">{t("video.title")}</h1>

        <div className="film-stage">
          <div className="film-frame">
            <video
              ref={videoRef}
              className="film-video"
              src="/brand/promo.mp4"
              poster="/brand/promo-poster.jpg"
              controls
              playsInline
              loop
              muted
              autoPlay
              preload="metadata"
              onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            />
            <span className="film-badge">15s</span>
            {muted && (
              <button className="film-unmute" onClick={unmute} aria-label="unmute">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
                <span>{t("video.hint")}</span>
              </button>
            )}
          </div>

          <div className="film-caption">
            <span className="film-dot" />
            {t("video.tagline")}
          </div>
        </div>
      </div>
    </div>
  );
}
