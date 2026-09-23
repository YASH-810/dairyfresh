"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { formatPrice, todayIST } from "@/lib/format";
import { simulateRazorpayCheckout } from "@/lib/payment";
import ProductThumb from "@/components/ProductThumb";
import type { Frequency, Slot, SubscriptionItem } from "@/lib/types";

function Builder() {
  const { db, currentUser, createSubscription } = useStore();
  const router = useRouter();
  const preselect = useSearchParams().get("productId");

  const subscribable = db.products.filter((p) => p.isSubscribable);
  const [items, setItems] = useState<SubscriptionItem[]>(preselect ? [{ productId: preselect, quantity: 1 }] : []);
  const [frequency, setFrequency] = useState<Frequency>("DAILY");
  const [slot, setSlot] = useState<Slot>("MORNING");
  const [startDate, setStartDate] = useState(todayIST());
  const [paying, setPaying] = useState(false);

  function toggle(productId: string) {
    setItems((prev) => (prev.some((i) => i.productId === productId) ? prev.filter((i) => i.productId !== productId) : [...prev, { productId, quantity: 1 }]));
  }
  function setQty(productId: string, quantity: number) {
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, quantity) } : i)));
  }

  const perDelivery = items.reduce((sum, i) => {
    const product = db.products.find((p) => p.id === i.productId);
    return sum + (product ? product.price * i.quantity : 0);
  }, 0);

  async function subscribe() {
    if (!currentUser) return router.push("/login?next=/subscribe");
    if (items.length === 0) return;
    setPaying(true);
    await simulateRazorpayCheckout();
    const sub = createSubscription({ userId: currentUser.id, items, frequency, deliverySlot: slot, startDate });
    router.push(`/dashboard/subscriptions/${sub.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Build your subscription</h1>
      <p className="mt-1 text-sm text-foreground/60">Pick products, choose how often, and we&apos;ll deliver automatically — pause or skip anytime.</p>

      <section className="mt-6">
        <h2 className="font-semibold text-dairy">1. Products</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {subscribable.map((p) => {
            const item = items.find((i) => i.productId === p.id);
            return (
              <div key={p.id} className={`rounded-xl border p-3 transition-colors ${item ? "border-sky bg-sky/5" : "border-dairy/10"}`}>
                <button onClick={() => toggle(p.id)} className="w-full text-left">
                  <ProductThumb product={p} className="h-16 w-16 rounded-lg" iconClassName="h-11 w-11" sizes="64px" />
                  <div className="mt-1 text-sm font-medium text-dairy">{p.name}</div>
                  <div className="text-xs text-foreground/60">{p.unit} · {formatPrice(p.price)}</div>
                </button>
                {item && (
                  <div className="mt-2 flex items-center rounded-full border border-dairy/20 w-fit">
                    <button className="px-2 py-0.5" onClick={() => setQty(p.id, item.quantity - 1)}>−</button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button className="px-2 py-0.5" onClick={() => setQty(p.id, item.quantity + 1)}>+</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-dairy">2. Frequency</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["DAILY", "ALTERNATE", "WEEKLY"] as Frequency[]).map((f) => (
            <button key={f} onClick={() => setFrequency(f)} className={`rounded-full border px-4 py-1.5 text-sm ${frequency === f ? "border-sky bg-sky text-white" : "border-dairy/20"}`}>
              {f === "DAILY" ? "Daily" : f === "ALTERNATE" ? "Alternate days" : "Weekly"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-dairy">3. Delivery slot</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(["MORNING", "EVENING"] as Slot[]).map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={`rounded-full border px-4 py-1.5 text-sm ${slot === s ? "border-sky bg-sky text-white" : "border-dairy/20"}`}>
              {s === "MORNING" ? "Morning" : "Evening"}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-dairy">4. Start date</h2>
        <input type="date" value={startDate} min={todayIST()} onChange={(e) => setStartDate(e.target.value)} className="mt-2 rounded border border-dairy/20 px-3 py-1.5 text-sm" />
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dairy/10 p-4">
        <div>
          <div className="text-sm text-foreground/60">Per delivery</div>
          <div className="text-xl font-bold text-dairy">{formatPrice(perDelivery)}</div>
        </div>
        <button onClick={subscribe} disabled={items.length === 0 || paying} className="rounded-full bg-gold px-6 py-2.5 font-semibold text-dairy disabled:opacity-50">
          {paying ? "Processing…" : "Subscribe & Pay"}
        </button>
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense>
      <Builder />
    </Suspense>
  );
}
