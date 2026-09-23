"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice, priceFor } from "@/lib/format";
import { useStore } from "@/lib/store";
import ProductThumb from "@/components/ProductThumb";
import StarRating from "@/components/StarRating";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, currentUser } = useStore();
  const isB2B = currentUser?.role === "B2B";
  const avgRating = product.reviews.length
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-dairy/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-dairy/10">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative h-40 w-full">
          <ProductThumb
            product={product}
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            iconClassName="h-20 w-20 drop-shadow-sm"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 20vw"
          />
          {product.isSubscribable && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-gold shadow-sm">
              <RefreshCw size={10} /> Subscribe
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-3">
          <div className="text-sm font-semibold text-dairy">{product.name}</div>
          <div className="text-xs text-foreground/60">{product.unit}</div>
          {avgRating && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              <StarRating rating={avgRating} size={12} /> <span className="text-foreground/50">({product.reviews.length})</span>
            </div>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <span className="font-bold text-dairy">{formatPrice(priceFor(product, currentUser?.role))}</span>
            {isB2B && <span className="text-xs text-foreground/40 line-through">{formatPrice(product.price)}</span>}
          </div>
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <div className="text-[11px] font-medium text-red-600">Only {product.stock} left</div>
          )}
          {product.stock === 0 && <div className="text-[11px] font-medium text-red-600">Out of stock</div>}
        </div>
      </Link>
      <button
        onClick={() => addToCart(product.id, 1)}
        disabled={product.stock === 0}
        className="mx-3 mb-3 rounded-full bg-sky py-1.5 text-sm font-medium text-white transition-colors hover:bg-dairy disabled:bg-foreground/20"
      >
        Add to cart
      </button>
    </div>
  );
}
