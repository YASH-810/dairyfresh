"use client";

import { use } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatPrice, formatDate } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";

export default function OrderSuccessPage({ params }: PageProps<"/order/[id]/success">) {
  const { id } = use(params);
  const { db } = useStore();
  const order = db.orders.find((o) => o.id === id);

  if (!order) return <div className="mx-auto max-w-xl px-4 py-16 text-center text-foreground/60">Order not found.</div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 shadow-inner">
        <Check size={40} strokeWidth={3} />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-dairy">Order placed!</h1>
      <p className="mt-1 text-foreground/70">Order #{order.id} · {formatDate(order.createdAt)}</p>

      <div className="mt-6 space-y-1 rounded-xl border border-dairy/10 p-4 text-left text-sm">
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
          <span>Total paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/dashboard" className="rounded-full bg-dairy px-5 py-2 font-medium text-white">View in dashboard</Link>
        <Link href="/products" className="rounded-full border border-dairy/20 px-5 py-2 font-medium text-dairy">Keep shopping</Link>
      </div>
    </div>
  );
}
