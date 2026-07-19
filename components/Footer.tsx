"use client";

import Link from "next/link";
import Logo from "./Logo";
import ContractBadge from "./ContractBadge";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <div className="nav-logo" style={{ marginBottom: 14 }}>
              <Logo size={26} />
              <span>ZOMBIESCAT</span>
            </div>
            <p className="muted">{t("footer.disc")}</p>
          </div>
          <div className="footer-links" style={{ alignItems: "flex-start" }}>
            <Link href="/">{t("nav.home")}</Link>
            <Link href="/shop">{t("nav.shop")}</Link>
            <Link href="/ip">{t("nav.ip")}</Link>
            <Link href="/founder">{t("nav.founder")}</Link>
            <Link href="/memes">{t("nav.memes")}</Link>
            <Link href="/video">{t("nav.video")}</Link>
            <Link href="/cart">{t("nav.cart")}</Link>
          </div>
        </div>
        <div className="divider" />
        <div style={{ marginBottom: 22 }}>
          <ContractBadge variant="footer" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--dim)", fontFamily: "var(--mono)", letterSpacing: "0.05em" }}>
          <span>© 2026 ZOMBIESCAT · {t("footer.tag")}</span>
          <span>ROBINHOOD CHAIN · 4663</span>
        </div>
      </div>
    </footer>
  );
}
