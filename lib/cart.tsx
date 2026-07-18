"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";

export interface CartLine {
  slug: string;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotalUsdCents: number;
  detailed: { product: Product; qty: number }[];
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "zc_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const add = (slug: string, qty = 1) => {
    const existing = lines.find((l) => l.slug === slug);
    if (existing) persist(lines.map((l) => (l.slug === slug ? { ...l, qty: l.qty + qty } : l)));
    else persist([...lines, { slug, qty }]);
  };
  const setQty = (slug: string, qty: number) => {
    if (qty <= 0) return remove(slug);
    persist(lines.map((l) => (l.slug === slug ? { ...l, qty } : l)));
  };
  const remove = (slug: string) => persist(lines.filter((l) => l.slug !== slug));
  const clear = () => persist([]);

  const detailed = lines
    .map((l) => {
      const product = PRODUCTS.find((p) => p.slug === l.slug);
      return product ? { product, qty: l.qty } : null;
    })
    .filter((x): x is { product: Product; qty: number } => x !== null);

  const count = lines.reduce((a, l) => a + l.qty, 0);
  const subtotalUsdCents = detailed.reduce((a, d) => a + d.product.priceUsdCents * d.qty, 0);

  return (
    <Ctx.Provider value={{ lines, add, setQty, remove, clear, count, subtotalUsdCents, detailed }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
