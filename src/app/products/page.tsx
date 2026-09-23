"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import type { Category } from "@/lib/types";

const CATEGORIES: Category[] = ["Milk", "Curd", "Paneer", "Ghee", "Butter", "Sweets", "Festive Bundles"];
type Sort = "relevance" | "price-asc" | "price-desc" | "rating";

function Catalog() {
  const { db } = useStore();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<Category | "">((params.get("category") as Category) ?? "");
  const [vegOnly, setVegOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(90000);
  const [sort, setSort] = useState<Sort>("relevance");

  // Next.js reuses this page instance across query-only navigations (e.g. clicking a
  // different category chip while already on /products), so the URL can change without
  // remounting the component — resync local filter state whenever it does.
  useEffect(() => {
    setQ(params.get("q") ?? "");
    setCategory((params.get("category") as Category) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const results = useMemo(() => {
    let list = db.products.filter((p) => p.price <= maxPrice);
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()));
    if (category) list = list.filter((p) => p.category === category);
    if (vegOnly) list = list.filter((p) => p.isVeg);

    switch (sort) {
      case "price-asc": return [...list].sort((a, b) => a.price - b.price);
      case "price-desc": return [...list].sort((a, b) => b.price - a.price);
      case "rating": return [...list].sort((a, b) => avg(b) - avg(a));
      default: return list;
    }
  }, [db.products, q, category, vegOnly, maxPrice, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">All products</h1>

      <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dairy/10 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="flex-1 rounded-full border border-dairy/20 px-4 py-1.5 text-sm"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value as Category | "")} className="rounded-full border border-dairy/20 px-3 py-1.5 text-sm">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /> Veg only
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          Max ₹{(maxPrice / 100).toFixed(0)}
          <input type="range" min={2000} max={90000} step={1000} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-dairy/20 px-3 py-1.5 text-sm">
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <p className="mt-3 text-sm text-foreground/60">{results.length} products</p>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {results.length === 0 && <p className="py-10 text-center text-foreground/60">No products match your filters.</p>}
    </div>
  );
}

function avg(p: { reviews: { rating: number }[] }) {
  return p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;
}

export default function ProductsPage() {
  return (
    <Suspense>
      <Catalog />
    </Suspense>
  );
}
