"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { db, currentUser } = useStore();
  if (!currentUser) return null;

  const orders = db.orders.filter((o) => o.userId === currentUser.id);
  const subscriptions = db.subscriptions.filter((s) => s.userId === currentUser.id);
  const isB2B = currentUser.role === "B2B";

  // B2B: what wholesale pricing saved vs. the retail price
  const b2bSaved = orders
    .filter((o) => o.type === "B2B")
    .flatMap((o) => o.items)
    .reduce((sum, i) => sum + ((db.products.find((p) => p.id === i.productId)?.price ?? i.price) - i.price) * i.quantity, 0);
  const totalSpent = orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.total, 0);

  const cards = isB2B
    ? [
        { label: "Total purchases", value: formatPrice(totalSpent), className: "text-dairy" },
        { label: "Saved with B2B pricing", value: formatPrice(b2bSaved), className: "text-green-600" },
        { label: "Wallet balance", value: formatPrice(currentUser.walletBalance), className: "text-dairy" },
      ]
    : [
        { label: "Wallet balance", value: formatPrice(currentUser.walletBalance), className: "text-dairy" },
        { label: "Loyalty points", value: `${currentUser.loyaltyPoints} pts`, className: "text-gold" },
      ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Hi, {currentUser.name.split(" ")[0]}</h1>

      {isB2B && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-dairy p-4 text-white">
          <div className="flex items-center gap-3">
            <Building2 size={28} className="shrink-0 text-gold" />
            <div>
              <div className="font-semibold">Business account</div>
              <div className="text-sm text-white/80">Wholesale B2B prices are applied automatically on every product.</div>
            </div>
          </div>
          <Link href="/products" className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-white hover:bg-gold/90">
            Order in bulk
          </Link>
        </div>
      )}

      <div className={`mt-4 grid gap-3 ${isB2B ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-dairy/10 p-4">
            <div className="text-sm text-foreground/60">{c.label}</div>
            <div className={`text-xl font-bold ${c.className}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-dairy">Subscriptions</h2>
        <div className="mt-3 space-y-2">
          {subscriptions.map((s) => (
            <Link key={s.id} href={`/dashboard/subscriptions/${s.id}`} className="block rounded-xl border border-dairy/10 p-4 hover:border-sky">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-dairy">{s.items.length} item(s) · {s.frequency} · {s.deliverySlot}</div>
                  <div className="text-xs text-foreground/60">Since {formatDate(s.startDate)}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : s.status === "PAUSED" ? "bg-gold/20 text-gold" : "bg-red-100 text-red-700"}`}>
                  {s.status}
                </span>
              </div>
            </Link>
          ))}
          {subscriptions.length === 0 && (
            <div className="rounded-xl border border-dashed border-dairy/20 p-4 text-center text-sm text-foreground/60">
              No subscriptions yet. <Link href="/subscribe" className="text-sky underline">Start one</Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-dairy">Orders</h2>
        <div className="mt-3 space-y-2">
          {orders.map((o) => (
            <Link key={o.id} href={`/dashboard/orders/${o.id}`} className="block rounded-xl border border-dairy/10 p-4 hover:border-sky">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-dairy">#{o.id} · {formatPrice(o.total)}</div>
                  <div className="text-xs text-foreground/60">{formatDate(o.createdAt)} · {o.type}</div>
                </div>
                <span className="rounded-full bg-sky/10 px-2 py-1 text-xs font-medium text-sky">{o.status.replace(/_/g, " ")}</span>
              </div>
            </Link>
          ))}
          {orders.length === 0 && <div className="rounded-xl border border-dashed border-dairy/20 p-4 text-center text-sm text-foreground/60">No orders yet.</div>}
        </div>
      </section>
    </div>
  );
}
