"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Building2, Flame, PartyPopper } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/lib/store";

export default function Home() {
  const { db, currentUser } = useStore();

  const featured = db.products.slice(0, 8);

  const buyAgain = useMemo(() => {
    if (!currentUser) return [];
    const ids = new Set<string>();
    db.orders
      .filter((o) => o.userId === currentUser.id)
      .forEach((o) => o.items.forEach((i) => ids.add(i.productId)));
    return db.products.filter((p) => ids.has(p.id)).slice(0, 4);
  }, [db.orders, db.products, currentUser]);

  const recentlyViewed = db.recentlyViewed
    .map((id) => db.products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 4);

  return (
    <div>
      <section className="relative w-full overflow-hidden bg-dairy">
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/7] lg:aspect-[21/7]">
          <Image
            src="/hero.png"
            alt="Dairyfresh — Pure milk, pure goodness. From our farms to your family."
            fill
            priority
            sizes="100vw"
            className="object-cover object-[68%_center] sm:object-center"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl bg-gold/15 p-4 text-sm font-medium text-dairy transition-shadow hover:shadow-md">
            <PartyPopper size={22} className="shrink-0 text-gold" />
            <span>Use <code className="rounded bg-white px-1.5 py-0.5">FRESH10</code> for 10% off your first order</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-sky/15 p-4 text-sm font-medium text-dairy transition-shadow hover:shadow-md">
            <Flame size={22} className="shrink-0 text-sky" />
            <span>Diwali Festive Bundles now live</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-dairy/10 p-4 text-sm font-medium text-dairy transition-shadow hover:shadow-md">
            <Building2 size={22} className="shrink-0 text-dairy" />
            <span>Bulk pricing for hotels &amp; cafés — <Link href="/about" className="underline">B2B accounts</Link></span>
          </div>
        </div>
      </section>

      {buyAgain.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="mb-3 border-l-4 border-gold pl-3 text-xl font-bold text-dairy">Buy again</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {buyAgain.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-3 flex items-center justify-between border-l-4 border-sky pl-3">
          <h2 className="text-xl font-bold text-dairy">Featured products</h2>
          <Link href="/products" className="text-sm font-medium text-sky hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-6">
          <h2 className="mb-3 border-l-4 border-dairy/40 pl-3 text-xl font-bold text-dairy">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
