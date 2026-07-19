"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import LangToggle from "./LangToggle";
import WalletButton from "./WalletButton";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";

const LINKS: { href: string; key: string }[] = [
  { href: "/", key: "nav.home" },
  { href: "/shop", key: "nav.shop" },
  { href: "/ip", key: "nav.ip" },
  { href: "/founder", key: "nav.founder" },
  { href: "/memes", key: "nav.memes" },
  { href: "/video", key: "nav.video" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  const { count } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the drawer on route change
  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav className={`nav ${scrolled || open ? "scrolled" : ""}`}>
      <div className="wrap nav-inner">
        <Link href="/" className="nav-logo">
          <Logo />
          <img src="/brand/logo-official.png" alt="魔鬼猫 ZOMBIESCAT" style={{ height: 22, width: "auto" }} />
        </Link>
        <div className="nav-links">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
              {t(l.key)}
            </Link>
          ))}
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
          {/* mobile hamburger */}
          <button className={`burger ${open ? "on" : ""}`} aria-label="menu" onClick={() => setOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* mobile drawer */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
            {t(l.key)}
          </Link>
        ))}
        <Link href="/cart">{t("nav.cart")}{count > 0 ? ` (${count})` : ""}</Link>
      </div>
    </nav>
  );
}
