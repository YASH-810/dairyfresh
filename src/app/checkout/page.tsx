"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { computeDeliveryFee, formatPrice, priceFor, todayIST } from "@/lib/format";
import { simulateRazorpayCheckout } from "@/lib/payment";
import type { Slot } from "@/lib/types";

function CheckoutForm() {
  const { db, currentUser, placeOrder } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const couponFromCart = params.get("coupon") ?? "";

  const [slot, setSlot] = useState<Slot>("MORNING");
  const [useWallet, setUseWallet] = useState(false);
  const [paying, setPaying] = useState(false);

  const address = currentUser?.addresses.find((a) => a.isDefault) ?? currentUser?.addresses[0];
  const lines = db.cart.map((c) => ({ product: db.products.find((p) => p.id === c.productId)!, quantity: c.quantity })).filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + priceFor(l.product, currentUser?.role) * l.quantity, 0);
  const coupon = couponFromCart ? db.coupons.find((c) => c.code === couponFromCart) : undefined;
  const discount = coupon ? (coupon.discountType === "PERCENT" ? Math.round(subtotal * (coupon.value / 100)) : Math.min(coupon.value, subtotal)) : 0;
  const deliveryFee = computeDeliveryFee(subtotal);
  const preWalletTotal = subtotal - discount + deliveryFee;
  const walletUsed = useWallet && currentUser ? Math.min(currentUser.walletBalance, preWalletTotal) : 0;
  const total = preWalletTotal - walletUsed;

  if (!currentUser || !address) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-foreground/60">Add a delivery address to your account before checking out.</div>;
  }
  if (lines.length === 0) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-foreground/60">Your cart is empty.</div>;
  }

  async function pay() {
    setPaying(true);
    await simulateRazorpayCheckout();
    const order = placeOrder({
      userId: currentUser!.id,
      type: currentUser!.role === "B2B" ? "B2B" : "ONE_TIME",
      items: db.cart,
      address: address!,
      slot,
      deliveryDate: todayIST(),
      couponCode: coupon?.code,
      walletUsed,
    });
    router.push(`/order/${order.id}/success`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Checkout</h1>

      <div className="mt-4 rounded-xl border border-dairy/10 p-4">
        <div className="font-semibold text-dairy">Delivery address</div>
        <p className="mt-1 text-sm text-foreground/80">{address.line}, {address.area}, {address.city} — {address.pincode}</p>
      </div>

      <div className="mt-4 rounded-xl border border-dairy/10 p-4">
        <div className="font-semibold text-dairy">Delivery slot</div>
        <div className="mt-2 flex flex-wrap gap-3">
          {(["MORNING", "EVENING"] as Slot[]).map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={`rounded-full border px-4 py-1.5 text-sm ${slot === s ? "border-sky bg-sky text-white" : "border-dairy/20"}`}>
              {s === "MORNING" ? "Morning (6–9 AM)" : "Evening (5–8 PM)"}
            </button>
          ))}
        </div>
      </div>

      {currentUser.walletBalance > 0 && (
        <label className="mt-4 flex items-center gap-2 rounded-xl border border-dairy/10 p-4 text-sm">
          <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} />
          Use wallet balance ({formatPrice(currentUser.walletBalance)} available)
        </label>
      )}

      <div className="mt-4 space-y-1 rounded-xl border border-dairy/10 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon ({coupon!.code})</span><span>−{formatPrice(discount)}</span></div>}
        <div className="flex justify-between"><span>Delivery fee</span><span>{deliveryFee ? formatPrice(deliveryFee) : "Free"}</span></div>
        {walletUsed > 0 && <div className="flex justify-between text-green-700"><span>Wallet used</span><span>−{formatPrice(walletUsed)}</span></div>}
        <div className="mt-2 flex justify-between border-t border-dairy/10 pt-2 text-base font-bold text-dairy"><span>To pay</span><span>{formatPrice(total)}</span></div>
      </div>

      <button onClick={pay} disabled={paying} className="mt-4 w-full rounded-full bg-gold py-3 font-semibold text-dairy disabled:opacity-60">
        {paying ? "Processing payment…" : `Pay ${formatPrice(total)} (Razorpay test mode)`}
      </button>
      <p className="mt-2 text-center text-xs text-foreground/50">Test payment simulation — no real charge is made.</p>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
