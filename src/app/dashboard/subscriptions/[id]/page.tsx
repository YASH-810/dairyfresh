"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatDate, formatPrice, isPastPauseCutoff, todayIST } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";

export default function SubscriptionDetailPage({ params }: PageProps<"/dashboard/subscriptions/[id]">) {
  const { id } = use(params);
  const { db, pauseSubscription, resumeSubscription, cancelSubscription } = useStore();
  const [pauseUntil, setPauseUntil] = useState(todayIST());
  const cutoffPassed = isPastPauseCutoff();

  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub) return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-foreground/60">Subscription not found.</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/dashboard" className="text-sm text-sky">← Back to dashboard</Link>
      <h1 className="mt-2 text-2xl font-bold text-dairy">Subscription #{sub.id}</h1>
      <span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ${sub.status === "ACTIVE" ? "bg-green-100 text-green-700" : sub.status === "PAUSED" ? "bg-gold/20 text-gold" : "bg-red-100 text-red-700"}`}>
        {sub.status}
      </span>

      <div className="mt-4 space-y-1 rounded-xl border border-dairy/10 p-4 text-sm">
        <div>Frequency: <b>{sub.frequency}</b></div>
        <div>Slot: <b>{sub.deliverySlot}</b></div>
        <div>Started: <b>{formatDate(sub.startDate)}</b></div>
        {sub.pausedUntil && <div>Paused until: <b>{formatDate(sub.pausedUntil)}</b></div>}
      </div>

      <div className="mt-4">
        <h2 className="font-semibold text-dairy">Items</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {sub.items.map((i) => {
            const product = db.products.find((p) => p.id === i.productId);
            return (
              <li key={i.productId} className="flex items-center justify-between gap-2 rounded-lg border border-dairy/10 p-2">
                <span className="flex min-w-0 items-center gap-2">
                  {product && <ProductThumb product={product} className="h-8 w-8 shrink-0 rounded-md" iconClassName="h-5 w-5" sizes="32px" />}
                  <span className="truncate">{product?.name ?? i.productId} × {i.quantity}</span>
                </span>
                <span className="shrink-0">{product && formatPrice(product.price * i.quantity)}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {cutoffPassed && sub.status === "ACTIVE" && (
        <p className="mt-4 rounded-lg bg-gold/10 p-3 text-xs text-gold">
          It&apos;s past 10 PM — pause/skip changes made now apply from the day after tomorrow.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {sub.status === "ACTIVE" && (
          <>
            <input type="date" value={pauseUntil} min={todayIST()} onChange={(e) => setPauseUntil(e.target.value)} className="rounded border border-dairy/20 px-3 py-1.5 text-sm" />
            <button onClick={() => pauseSubscription(sub.id, pauseUntil)} className="rounded-full bg-gold px-4 py-1.5 text-sm font-semibold text-dairy">Pause until date</button>
          </>
        )}
        {sub.status === "PAUSED" && (
          <button onClick={() => resumeSubscription(sub.id)} className="rounded-full bg-sky px-4 py-1.5 text-sm font-semibold text-white">Resume now</button>
        )}
        {sub.status !== "CANCELLED" && (
          <button onClick={() => cancelSubscription(sub.id)} className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-semibold text-red-600">Cancel subscription</button>
        )}
      </div>
    </div>
  );
}
