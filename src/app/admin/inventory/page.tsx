"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import ProductThumb from "@/components/ProductThumb";

export default function AdminInventoryPage() {
  const { db, adminUpdateStock, adminSimulateLowStock } = useStore();
  const [drafts, setDrafts] = useState<Record<string, number>>({});

  return (
    <div>
      <h1 className="text-2xl font-bold text-dairy">Inventory</h1>
      <p className="mt-1 text-sm text-foreground/60">Adjust stock levels, or trigger a restock purchase order for anything below threshold.</p>

      <div className="mt-4 space-y-2">
        {db.products.map((p) => {
          const low = p.stock <= p.lowStockThreshold;
          return (
            <div key={p.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${low ? "border-red-200 bg-red-50" : "border-dairy/10"}`}>
              <ProductThumb product={p} className="h-10 w-10 shrink-0 rounded-lg" iconClassName="h-7 w-7" sizes="40px" />
              <div className="flex-1 min-w-[10rem]">
                <div className="font-medium text-dairy">{p.name}</div>
                <div className="text-xs text-foreground/60">{p.unit} · threshold {p.lowStockThreshold}</div>
              </div>
              <input
                type="number"
                min={0}
                value={drafts[p.id] ?? p.stock}
                onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: Number(e.target.value) }))}
                className="w-20 rounded border border-dairy/20 px-2 py-1 text-sm"
              />
              <button
                onClick={() => adminUpdateStock(p.id, drafts[p.id] ?? p.stock)}
                className="rounded-full bg-dairy px-3 py-1 text-xs font-medium text-white"
              >
                Save
              </button>
              {low && (
                <button
                  onClick={() => adminSimulateLowStock(p.id)}
                  className="rounded-full bg-gold px-3 py-1 text-xs font-medium text-dairy"
                >
                  Send EDI 850
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
