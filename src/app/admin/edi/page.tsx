"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/format";
import type { EdiDocument } from "@/lib/types";

const TYPE_LABEL: Record<EdiDocument["type"], string> = {
  PURCHASE_ORDER_850: "850 · Purchase Order",
  ACK_997: "997 · Functional Ack",
  INVENTORY_846: "846 · Inventory Update",
  INVOICE_810: "810 · Invoice",
};

const STATUS_COLOR: Record<EdiDocument["status"], string> = {
  SENT: "bg-sky/10 text-sky",
  RECEIVED: "bg-gold/20 text-gold",
  ACKNOWLEDGED: "bg-green-100 text-green-700",
};

export default function AdminEdiPage() {
  const { db, adminSimulateLowStock, adminAdvanceEdi } = useStore();
  const [viewing, setViewing] = useState<EdiDocument | null>(null);

  const groups = useMemo(() => {
    const byPo = new Map<string, EdiDocument[]>();
    for (const d of db.ediDocuments) {
      if (!byPo.has(d.poId)) byPo.set(d.poId, []);
      byPo.get(d.poId)!.push(d);
    }
    return [...byPo.entries()]
      .map(([poId, docs]) => ({ poId, docs: docs.sort((a, b) => a.createdAt.localeCompare(b.createdAt)) }))
      .sort((a, b) => b.docs[0].createdAt.localeCompare(a.docs[0].createdAt));
  }, [db.ediDocuments]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-dairy">EDI documents</h1>
        <button onClick={() => adminSimulateLowStock()} className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-dairy">
          Simulate low stock → 850
        </button>
      </div>
      <p className="mt-1 text-sm text-foreground/60">850 (Purchase Order) → 997 (Ack) → 846 (Inventory update) → 810 (Invoice), per restock cycle.</p>

      <div className="mt-4 space-y-4">
        {groups.map(({ poId, docs }) => {
          const product = db.products.find((p) => p.id === docs[0].productId);
          const complete = docs.length >= 4;
          return (
            <div key={poId} className="rounded-xl border border-dairy/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold text-dairy">{poId} {product && <span className="font-normal text-foreground/60">· {product.name}</span>}</div>
                {!complete && (
                  <button onClick={() => void adminAdvanceEdi(poId)} className="rounded-full bg-sky px-3 py-1 text-xs font-medium text-white">
                    Advance cycle →
                  </button>
                )}
              </div>
              <ul className="mt-2 divide-y divide-dairy/10">
                {docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm">
                    <span>{TYPE_LABEL[d.type]}</span>
                    <span className="text-xs text-foreground/50">{formatDate(d.createdAt)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[d.status]}`}>{d.status}</span>
                    <button onClick={() => setViewing(d)} className="text-xs text-sky underline">View raw EDI</button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {groups.length === 0 && <p className="text-sm text-foreground/60">No EDI activity yet.</p>}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setViewing(null)}>
          <div className="max-h-[80vh] w-full max-w-xl overflow-auto rounded-xl bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-dairy">{TYPE_LABEL[viewing.type]} — {viewing.poId}</h3>
              <button onClick={() => setViewing(null)} className="flex items-center gap-1 text-sm text-foreground/60 hover:text-foreground">
                Close <X size={16} />
              </button>
            </div>
            <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-dairy/5 p-3 font-mono text-xs">{viewing.rawX12}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
