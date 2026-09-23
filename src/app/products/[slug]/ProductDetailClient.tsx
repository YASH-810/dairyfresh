"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";
import StarRating from "@/components/StarRating";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const { db, currentUser, addToCart, addReview, addRecentlyViewed } = useStore();
  const router = useRouter();
  const product = db.products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (product) addRecentlyViewed(product.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  if (!product) return <div className="mx-auto max-w-6xl px-4 py-10">Loading…</div>;

  const avgRating = product.reviews.length ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length : null;

  function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    addReview(product.id, currentUser?.name ?? "Guest", rating, comment);
    setComment("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductThumb
          product={product}
          className="h-72 rounded-2xl border border-dairy/10"
          iconClassName="h-48 w-48 drop-shadow-md"
          sizes="(max-width: 768px) 90vw, 45vw"
        />

        <div>
          <div className="text-xs font-medium uppercase text-sky">{product.category}</div>
          <h1 className="mt-1 text-2xl font-bold text-dairy">{product.name}</h1>
          <div className="mt-1 text-sm text-foreground/60">{product.unit}</div>
          {avgRating && (
            <div className="mt-1 flex items-center gap-1.5 text-sm">
              <StarRating rating={avgRating} size={16} /> <span className="text-foreground/50">({product.reviews.length} reviews)</span>
            </div>
          )}
          <p className="mt-3 text-sm text-foreground/80">{product.description}</p>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-bold text-dairy">{formatPrice(product.price)}</span>
            {currentUser?.role === "B2B" && <span className="text-sm text-foreground/60">B2B: {formatPrice(product.b2bPrice)}</span>}
          </div>

          {product.stock === 0 ? (
            <div className="mt-4 font-medium text-red-600">Out of stock</div>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex items-center rounded-full border border-dairy/20">
                  <button className="px-3 py-1" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                  <span className="w-8 text-center">{qty}</span>
                  <button className="px-3 py-1" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
                </div>
                <button onClick={() => addToCart(product.id, qty)} className="flex-1 rounded-full bg-sky py-2 font-medium text-white">
                  Buy once — Add to cart
                </button>
              </div>
              {product.isSubscribable && (
                <button
                  onClick={() => router.push(`/subscribe?productId=${product.id}`)}
                  className="mt-3 w-full rounded-full border border-gold py-2 font-medium text-gold"
                >
                  Subscribe &amp; Save
                </button>
              )}
              {product.stock <= product.lowStockThreshold && <div className="mt-2 text-xs text-red-600">Only {product.stock} left in stock</div>}
            </>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-dairy">Reviews</h2>
        <form onSubmit={submitReview} className="mt-3 flex flex-col gap-2 rounded-xl border border-dairy/10 p-4 sm:flex-row sm:items-center">
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="rounded border border-dairy/20 px-2 py-1.5 text-sm">
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{"★".repeat(r)}</option>
            ))}
          </select>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience…"
            required
            className="flex-1 rounded border border-dairy/20 px-3 py-1.5 text-sm"
          />
          <button className="rounded-full bg-dairy px-4 py-1.5 text-sm font-medium text-white">Post review</button>
        </form>
        <ul className="mt-4 space-y-3">
          {product.reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-dairy/10 p-3 text-sm">
              <div className="flex items-center gap-1.5 font-medium text-dairy">{r.userName} <StarRating rating={r.rating} size={13} /></div>
              <div className="text-foreground/50 text-xs">{formatDate(r.createdAt)}</div>
              <p className="mt-1">{r.comment}</p>
            </li>
          ))}
          {product.reviews.length === 0 && <li className="text-sm text-foreground/60">No reviews yet — be the first!</li>}
        </ul>
      </section>
    </div>
  );
}
