"use client";

import { PartyPopper } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";

export default function DeliveryPage() {
  const { db, currentUser, deliveryMarkDelivered, updateOrderStatus } = useStore();
  if (!currentUser) return null;

  const route = db.orders.filter(
    (o) => o.deliveryStaffId === currentUser.id && o.status !== "DELIVERED" && o.status !== "CANCELLED",
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold text-dairy">Today&apos;s route</h1>
      <p className="mt-1 text-sm text-foreground/60">{route.length} stop(s) assigned to you.</p>

      <div className="mt-4 space-y-3">
        {route.map((o) => {
          const user = db.users.find((u) => u.id === o.userId);
          return (
            <div key={o.id} className="rounded-xl border border-dairy/10 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 truncate font-medium text-dairy">#{o.id} · {user?.name}</div>
                <span className="shrink-0 rounded-full bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky">{o.slot}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/70">{o.address.line}, {o.address.area}, {o.address.city} — {o.address.pincode}</p>
              <p className="mt-1 text-sm text-foreground/60">{o.items.length} item(s) · {formatPrice(o.total)} · {o.status.replace(/_/g, " ")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {o.status !== "OUT_FOR_DELIVERY" && (
                  <button onClick={() => updateOrderStatus(o.id, "OUT_FOR_DELIVERY")} className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-white">
                    Start delivery
                  </button>
                )}
                <button onClick={() => deliveryMarkDelivered(o.id)} className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                  Mark delivered
                </button>
              </div>
            </div>
          );
        })}
        {route.length === 0 && (
          <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-dairy/20 p-4 text-center text-sm text-foreground/60">
            <PartyPopper size={18} className="text-gold" /> No stops left for today
          </p>
        )}
      </div>
    </div>
  );
}
