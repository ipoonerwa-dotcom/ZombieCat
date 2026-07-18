"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import WalletButton from "./WalletButton";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { t } = useI18n();
  const { count } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = (href: string, key: string) => (
    <Link href={href} className={pathname === href ? "active" : ""}>
      {t(key)}
    </Link>
  );

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="wrap nav-inner">
        <Link href="/" className="nav-logo">
          <Logo />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-official.png" alt="魔鬼猫 ZOMBIESCAT" style={{ height: 22, width: "auto" }} />
        </Link>
        <div className="nav-links">
          {link("/", "nav.home")}
          {link("/shop", "nav.shop")}
          {link("/ip", "nav.ip")}
          {link("/memes", "nav.memes")}
        </div>
        <div className="nav-right">
          <LangToggle />
          <Link href="/cart" className="cart-btn" aria-label={t("nav.cart")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
          <WalletButton />
        </div>
      </div>
    </nav>
  );
}
