"use client";

import { useStore } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = ["PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { db, updateOrderStatus } = useStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-dairy">Orders</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border border-dairy/10">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-dairy/5 text-left text-xs uppercase text-foreground/60">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">User</th>
              <th className="p-3">Type</th>
              <th className="p-3">Total</th>
              <th className="p-3">Delivery date</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {db.orders.map((o) => {
              const user = db.users.find((u) => u.id === o.userId);
              return (
                <tr key={o.id} className="border-t border-dairy/10">
                  <td className="p-3 font-medium text-dairy">#{o.id}</td>
                  <td className="p-3">{user?.name ?? o.userId}</td>
                  <td className="p-3">{o.type}</td>
                  <td className="p-3">{formatPrice(o.total)}</td>
                  <td className="p-3">{formatDate(o.deliveryDate)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded border border-dairy/20 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
