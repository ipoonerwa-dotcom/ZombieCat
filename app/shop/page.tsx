"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { PRODUCTS, CATEGORIES, type Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ShopPage() {
  const { t } = useI18n();
  const [cat, setCat] = useState<Category>("all");

  const list = PRODUCTS.filter((p) => cat === "all" || p.category === cat).sort((a, b) => a.sort - b.sort);

  return (
    <div className="section" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="kicker">{t("shop.title")}</div>
        <h1 className="h-section">{t("shop.title")}</h1>
        <p className="lead" style={{ marginBottom: 26 }}>{t("shop.sub")}</p>

        <div className="cat-tabs" style={{ marginBottom: 28 }}>
          {CATEGORIES.map((c) => (
            <button key={c} className={`cat-tab ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>
              {t(`shop.${c}`)}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="lead">{t("shop.empty")}</p>
        ) : (
          <div className="grid grid-4">
            {list.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
