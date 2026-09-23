"use client";

import { use } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, formatPrice } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";
import type { OrderStatus } from "@/lib/types";

const TIMELINE: OrderStatus[] = ["PLACED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];
const LABELS: Record<OrderStatus, string> = {
  PLACED: "Placed",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrderTrackingPage({ params }: PageProps<"/dashboard/orders/[id]">) {
  const { id } = use(params);
  const { db } = useStore();
  const order = db.orders.find((o) => o.id === id);
  if (!order) return <div className="mx-auto max-w-2xl px-4 py-10 text-center text-foreground/60">Order not found.</div>;

  const currentIdx = TIMELINE.indexOf(order.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link href="/dashboard" className="text-sm text-sky">← Back to dashboard</Link>
      <h1 className="mt-2 text-2xl font-bold text-dairy">Order #{order.id}</h1>
      <p className="text-sm text-foreground/60">{formatDate(order.createdAt)} · {order.slot} slot on {formatDate(order.deliveryDate)}</p>

      {order.status === "CANCELLED" ? (
        <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">This order was cancelled.</p>
      ) : (
        <ol className="mt-6 flex flex-col gap-4">
          {TIMELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${i <= currentIdx ? "bg-sky text-white" : "bg-dairy/10 text-dairy/40"}`}>
                {i <= currentIdx ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={i <= currentIdx ? "font-medium text-dairy" : "text-foreground/40"}>{LABELS[step]}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 space-y-1 rounded-xl border border-dairy/10 p-4 text-sm">
        {order.items.map((i) => {
          const product = db.products.find((p) => p.id === i.productId);
          return (
            <div key={i.productId} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                {product && <ProductThumb product={product} className="h-8 w-8 shrink-0 rounded-md" iconClassName="h-5 w-5" sizes="32px" />}
                <span className="truncate">{product?.name ?? i.productId} × {i.quantity}</span>
              </span>
              <span className="shrink-0">{formatPrice(i.price * i.quantity)}</span>
            </div>
          );
        })}
        <div className="mt-2 flex justify-between border-t border-dairy/10 pt-2 font-bold text-dairy">
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-dairy/10 p-4 text-sm">
        <div className="font-semibold text-dairy">Delivering to</div>
        <p className="mt-1 text-foreground/80">{order.address.line}, {order.address.area}, {order.address.city} — {order.address.pincode}</p>
      </div>
    </div>
  );
}
