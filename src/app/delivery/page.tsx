"use client";

import { CheckCircle2, PartyPopper, Truck } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";

export default function DeliveryPage() {
  const { db, currentUser, updateOrderStatus } = useStore();
  if (!currentUser) return null;
  const me = currentUser.id;

  // Unassigned orders are open to any delivery person; once someone starts one it's theirs.
  const pending = db.orders
    .filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED" && (!o.deliveryStaffId || o.deliveryStaffId === me))
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate) || a.slot.localeCompare(b.slot));
  const outWithMe = pending.filter((o) => o.status === "OUT_FOR_DELIVERY").length;
  const delivered = db.orders.filter((o) => o.status === "DELIVERED" && o.deliveryStaffId === me);

  const stats = [
    { label: "Pending", value: pending.length, className: "text-dairy" },
    { label: "Out for delivery", value: outWithMe, className: "text-sky" },
    { label: "Delivered by you", value: delivered.length, className: "text-green-600" },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Hi, {currentUser.name.split(" ")[0]}</h1>
      <p className="mt-1 text-sm text-foreground/60">Your pending deliveries</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-dairy/10 p-3 text-center">
            <div className={`text-2xl font-bold ${s.className}`}>{s.value}</div>
            <div className="text-xs text-foreground/60">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {pending.map((o) => {
          const customer = db.users.find((u) => u.id === o.userId);
          return (
            <div key={o.id} className="rounded-xl border border-dairy/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 truncate font-medium text-dairy">{customer?.name ?? "Customer"}</div>
                <span className="shrink-0 rounded-full bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">
                  {formatDate(o.deliveryDate)} · {o.slot}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/70">
                {o.address.line}, {o.address.area}, {o.address.city} — {o.address.pincode}
                {customer?.phone && <> · <a href={`tel:${customer.phone}`} className="text-sky underline">{customer.phone}</a></>}
              </p>
              <ul className="mt-2 text-sm text-foreground/80">
                {o.items.map((i) => (
                  <li key={i.productId}>
                    {i.quantity} × {db.products.find((p) => p.id === i.productId)?.name ?? i.productId}
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-xs text-foreground/50">#{o.id} · {formatPrice(o.total)} · {o.status.replace(/_/g, " ")}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status !== "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => updateOrderStatus(o.id, "OUT_FOR_DELIVERY", me)}
                    className="inline-flex items-center gap-1 rounded-full bg-sky px-3 py-1.5 text-xs font-medium text-white"
                  >
                    <Truck size={14} /> Start delivery
                  </button>
                )}
                <button
                  onClick={() => updateOrderStatus(o.id, "DELIVERED", me)}
                  className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1.5 text-xs font-medium text-white"
                >
                  <CheckCircle2 size={14} /> Mark as delivered
                </button>
              </div>
            </div>
          );
        })}
        {pending.length === 0 && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-dairy/20 p-4 text-center text-sm text-foreground/60">
            <PartyPopper size={18} className="text-gold" /> No pending deliveries
          </p>
        )}
      </div>
    </div>
  );
}
