"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/format";

export default function DashboardPage() {
  const { db, currentUser } = useStore();
  if (!currentUser) return null;

  const orders = db.orders.filter((o) => o.userId === currentUser.id);
  const subscriptions = db.subscriptions.filter((s) => s.userId === currentUser.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Hi, {currentUser.name.split(" ")[0]}</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-dairy/10 p-4">
          <div className="text-sm text-foreground/60">Wallet balance</div>
          <div className="text-xl font-bold text-dairy">{formatPrice(currentUser.walletBalance)}</div>
        </div>
        <div className="rounded-xl border border-dairy/10 p-4">
          <div className="text-sm text-foreground/60">Loyalty points</div>
          <div className="text-xl font-bold text-gold">{currentUser.loyaltyPoints} pts</div>
        </div>
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
