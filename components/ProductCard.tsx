"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { useI18n } from "@/lib/i18n";
import { useCart } from "@/lib/cart";
import { usd } from "@/lib/format";

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useI18n();
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const name = product.name; // product copy is English-only per brand request
  const catLabel = t(`shop.${product.category}`);

  const onAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    add(product.slug);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <Link href={`/shop/${product.slug}`} className="product-card" style={{ ["--pc-accent" as string]: product.accent }}>
      <div className="product-art product-art-photo">
        <span className="tag">{catLabel}</span>
        {product.image ? (
          <img src={product.image} alt={name} loading="lazy" />
        ) : (
          <span className="emoji">{product.art}</span>
        )}
      </div>
      <div className="product-body">
        <div className="product-name">{name}</div>
        <div className="product-price-row">
          <div>
            <div className="product-usd">{usd(product.priceUsdCents)}</div>
          </div>
          <button className={added ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={onAdd}>
            {added ? t("shop.added") : t("shop.add")}
          </button>
        </div>
      </div>
    </Link>
  );
}
