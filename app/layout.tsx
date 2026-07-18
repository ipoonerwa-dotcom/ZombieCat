import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

// Note: fonts come from the CSS stack (Inter/Archivo/JetBrains Mono → system
// fallbacks). We deliberately avoid next/font/google so local dev behind a
// restricted network never blocks on a font fetch.

export const metadata: Metadata = {
  title: "ZombiesCat · 魔鬼猫 — RWA Merch Store",
  description:
    "ZombiesCat (魔鬼猫) RWA merch store on Robinhood Chain. Spend $ZCAT on-chain, tokens burn, real gear ships to your door. 用魔鬼猫代币在链上消费,代币销毁,实物周边发到家。",
};

export const viewport: Viewport = {
  themeColor: "#08080b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Nav />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
