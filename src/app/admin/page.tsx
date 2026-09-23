"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice, todayIST } from "@/lib/format";

export default function AdminOverview() {
  const { db, adminGenerateTomorrowOrders, adminSimulateLowStock } = useStore();
  const [msg, setMsg] = useState("");

  const today = todayIST();
  const todaysOrders = db.orders.filter((o) => o.createdAt.startsWith(today));
  const revenue = todaysOrders.reduce((s, o) => s + o.total, 0);
  const activeSubs = db.subscriptions.filter((s) => s.status === "ACTIVE").length;
  const lowStock = db.products.filter((p) => p.stock <= p.lowStockThreshold);

  return (
    <div>
      <h1 className="text-2xl font-bold text-dairy">Admin overview</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Kpi label="Today's orders" value={String(todaysOrders.length)} />
        <Kpi label="Today's revenue" value={formatPrice(revenue)} />
        <Kpi label="Active subscriptions" value={String(activeSubs)} />
        <Kpi label="Low stock items" value={String(lowStock.length)} accent="text-red-600" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => {
            const n = adminGenerateTomorrowOrders();
            setMsg(`Generated ${n} order(s) for tomorrow from active subscriptions.`);
          }}
          className="rounded-full bg-sky px-4 py-2 text-sm font-medium text-white"
        >
          Generate tomorrow&apos;s orders
        </button>
        <button
          onClick={() => {
            const doc = adminSimulateLowStock();
            setMsg(doc ? `Low stock simulated — EDI 850 Purchase Order ${doc.poId} sent.` : "No product found.");
          }}
          className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-dairy"
        >
          Simulate low stock → send EDI 850
        </button>
      </div>
      {msg && (
        <p className="mt-2 text-sm text-green-700">
          {msg} <Link href="/admin/edi" className="underline">View EDI timeline →</Link>
        </p>
      )}

      {lowStock.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-dairy">Low stock</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {lowStock.map((p) => (
              <li key={p.id} className="flex justify-between rounded-lg border border-dairy/10 p-2">
                <span>{p.name} ({p.unit})</span>
                <span className="font-medium text-red-600">{p.stock} left</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl border border-dairy/10 p-4">
      <div className="text-xs text-foreground/60">{label}</div>
      <div className={`mt-1 text-xl font-bold ${accent ?? "text-dairy"}`}>{value}</div>
    </div>
  );
}
