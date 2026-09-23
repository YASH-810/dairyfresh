"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { computeDeliveryFee, formatPrice, priceFor } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";

export default function CartPage() {
  const { db, updateCartQty, removeFromCart, currentUser } = useStore();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState("");

  const lines = db.cart
    .map((c) => ({ product: db.products.find((p) => p.id === c.productId), quantity: c.quantity }))
    .filter((l): l is { product: NonNullable<typeof l.product>; quantity: number } => !!l.product);

  const subtotal = lines.reduce((s, l) => s + priceFor(l.product, currentUser?.role) * l.quantity, 0);
  const coupon = applied ? db.coupons.find((c) => c.code === applied) : undefined;
  const discount = coupon ? (coupon.discountType === "PERCENT" ? Math.round(subtotal * (coupon.value / 100)) : Math.min(coupon.value, subtotal)) : 0;
  const deliveryFee = computeDeliveryFee(subtotal);
  const total = subtotal - discount + deliveryFee;

  function applyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const found = db.coupons.find((c) => c.code === code.trim().toUpperCase());
    if (!found) {
      setError("Invalid coupon code");
      setApplied(null);
      return;
    }
    setError("");
    setApplied(found.code);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Your cart</h1>

      {lines.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-foreground/60">Your cart is empty.</p>
          <Link href="/products" className="mt-3 inline-block rounded-full bg-sky px-5 py-2 font-medium text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {lines.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3 rounded-xl border border-dairy/10 p-3">
                <ProductThumb product={product} className="h-14 w-14 shrink-0 rounded-lg" iconClassName="h-9 w-9" sizes="56px" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-dairy">{product.name}</div>
                  <div className="text-xs text-foreground/60">{product.unit} · {formatPrice(priceFor(product, currentUser?.role))}</div>
                </div>
                <div className="flex items-center rounded-full border border-dairy/20">
                  <button className="px-2.5 py-1" onClick={() => updateCartQty(product.id, quantity - 1)}>−</button>
                  <span className="w-6 text-center text-sm">{quantity}</span>
                  <button className="px-2.5 py-1" onClick={() => updateCartQty(product.id, quantity + 1)} disabled={quantity >= product.stock}>+</button>
                </div>
                <button onClick={() => removeFromCart(product.id)} className="text-sm text-red-600">Remove</button>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-xl border border-dairy/10 p-4">
            <form onSubmit={applyCoupon} className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="flex-1 rounded border border-dairy/20 px-2 py-1.5 text-sm" />
              <button className="rounded bg-dairy px-3 py-1.5 text-sm text-white">Apply</button>
            </form>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
            {applied && <p className="mt-1 text-xs text-green-700">Coupon {applied} applied</p>}

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatPrice(discount)}</span></div>}
              <div className="flex justify-between"><span>Delivery fee</span><span>{deliveryFee ? formatPrice(deliveryFee) : "Free"}</span></div>
              <div className="mt-2 flex justify-between border-t border-dairy/10 pt-2 text-base font-bold text-dairy"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>

            <button
              onClick={() => {
                if (!currentUser) return router.push("/login?next=/checkout");
                router.push(applied ? `/checkout?coupon=${applied}` : "/checkout");
              }}
              className="mt-4 w-full rounded-full bg-gold py-2.5 font-semibold text-dairy"
            >
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
