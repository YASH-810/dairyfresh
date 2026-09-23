"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { z } from "zod";
import { useStore } from "@/lib/store";
import ProductThumb from "@/components/ProductThumb";

const couponSchema = z.object({
  code: z.string().trim().min(3).max(20).transform((s) => s.toUpperCase()),
  discountType: z.enum(["PERCENT", "FLAT"]),
  value: z.coerce.number().positive(),
  validTill: z.string().min(1),
});

export default function AdminPromotionsPage() {
  const { db, adminAddCoupon } = useStore();
  const [form, setForm] = useState({ code: "", discountType: "PERCENT" as "PERCENT" | "FLAT", value: "", validTill: "2026-12-31" });
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = couponSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid coupon");
      return;
    }
    adminAddCoupon(parsed.data);
    setError("");
    setForm({ code: "", discountType: "PERCENT", value: "", validTill: "2026-12-31" });
  }

  function handleQuickFill() {
    setForm({
      code: "FESTIVE25",
      discountType: "PERCENT",
      value: "25",
      validTill: "2026-12-31",
    });
    setError("");
  }

  const festiveBundles = db.products.filter((p) => p.category === "Festive Bundles");

  return (
    <div>
      <h1 className="text-2xl font-bold text-dairy">Promotions</h1>

      <section className="mt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-dairy">Coupons</h2>
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1 rounded-full border border-sky/30 bg-sky/10 px-2.5 py-1 text-xs font-medium text-sky hover:bg-sky/20 transition"
          >
            <Sparkles size={12} className="text-gold" />
            <span>Quick Fill</span>
          </button>
        </div>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-xs uppercase text-foreground/60">
            <tr><th className="py-1">Code</th><th>Discount</th><th>Valid till</th></tr>
          </thead>
          <tbody>
            {db.coupons.map((c) => (
              <tr key={c.code} className="border-t border-dairy/10">
                <td className="py-1.5 font-medium text-dairy">{c.code}</td>
                <td>{c.discountType === "PERCENT" ? `${c.value}%` : `₹${c.value / 100}`}</td>
                <td>{c.validTill}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-dairy/10 p-3">
          <div>
            <label className="block text-xs text-foreground/60">Code</label>
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="rounded border border-dairy/20 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-foreground/60">Type</label>
            <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as "PERCENT" | "FLAT" }))} className="rounded border border-dairy/20 px-2 py-1 text-sm">
              <option value="PERCENT">% off</option>
              <option value="FLAT">₹ off (flat, in paise)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-foreground/60">Value</label>
            <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} className="w-24 rounded border border-dairy/20 px-2 py-1 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-foreground/60">Valid till</label>
            <input type="date" value={form.validTill} onChange={(e) => setForm((f) => ({ ...f, validTill: e.target.value }))} className="rounded border border-dairy/20 px-2 py-1 text-sm" />
          </div>
          <button type="submit" className="rounded-full bg-dairy px-4 py-1.5 text-sm font-medium text-white hover:bg-sky transition">Add coupon</button>
        </form>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-dairy">Festive bundles &amp; banners</h2>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {festiveBundles.map((p) => (
            <div key={p.id} className="rounded-xl border border-dairy/10 p-3 text-center">
              <ProductThumb product={p} className="mx-auto h-14 w-14 rounded-lg" iconClassName="h-10 w-10" sizes="56px" />
              <div className="mt-1 text-sm font-medium text-dairy">{p.name}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-foreground/60">Homepage banners are managed in the code today (app/page.tsx) — no CMS needed for a college demo.</p>
      </section>
    </div>
  );
}
