"use client";

import { useI18n } from "@/lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label="language">
      <button className={lang === "zh" ? "on" : ""} onClick={() => setLang("zh")}>
        中
      </button>
      <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}
