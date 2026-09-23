"use client";

import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/format";
import ProductThumb from "@/components/ProductThumb";

export default function AdminProductsPage() {
  const { db } = useStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-dairy">Products</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border border-dairy/10">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-dairy/5 text-left text-xs uppercase text-foreground/60">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">B2B price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Subscribable</th>
            </tr>
          </thead>
          <tbody>
            {db.products.map((p) => (
              <tr key={p.id} className="border-t border-dairy/10">
                <td className="p-3 font-medium text-dairy">
                  <div className="flex items-center gap-2">
                    <ProductThumb product={p} className="h-8 w-8 shrink-0 rounded-md" iconClassName="h-5 w-5" sizes="32px" />
                    {p.name} <span className="text-foreground/50">({p.unit})</span>
                  </div>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{formatPrice(p.b2bPrice)}</td>
                <td className={`p-3 ${p.stock <= p.lowStockThreshold ? "font-semibold text-red-600" : ""}`}>{p.stock}</td>
                <td className="p-3">{p.isSubscribable ? "Yes" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
