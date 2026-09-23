import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "How DairyFresh works — B2C, subscriptions, B2B and our vendor marketplace.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-dairy">About DairyFresh</h1>
      <p className="mt-3 text-foreground/80">
        DairyFresh is a digital-first alternative to Chitale Dairy and Mother Dairy — a single platform where
        households, cafés and hotels can buy dairy products online or set up recurring milk delivery they control
        themselves.
      </p>

      <h2 className="mt-8 text-xl font-bold text-dairy">Type of marketplace</h2>
      <p className="mt-2 text-foreground/80">
        A <b>seller-side vertical marketplace</b> — one industry (dairy) — with a hybrid vendor layer: local dairy
        co-operatives supply products under the DairyFresh brand.
      </p>

      <h2 className="mt-8 text-xl font-bold text-dairy">Business models</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-foreground/80">
        <li><b>B2C</b> — one-time product orders via cart and checkout, like any e-commerce store.</li>
        <li><b>Subscription (D2C)</b> — daily, alternate-day or weekly delivery plans customers pause, resume and modify from their dashboard. This is our core differentiator.</li>
        <li><b>B2B</b> — bulk pricing tiers for hotels, cafés and sweet shops ordering in volume.</li>
        <li><b>Marketplace (light)</b> — local dairy vendors listed as suppliers behind the scenes.</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold text-dairy">Revenue model</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-foreground/80">
        <li>Product margins on every order</li>
        <li>Monthly prepaid subscription plans</li>
        <li>Delivery fee on small one-time orders</li>
        <li>B2B bulk contracts</li>
        <li>Vendor commission and promoted/featured listings</li>
      </ul>

      <h2 className="mt-8 text-xl font-bold text-dairy">How supply is kept flowing</h2>
      <p className="mt-2 text-foreground/80">
        When stock for a product runs low, DairyFresh automatically raises an EDI 850 Purchase Order to that
        product&apos;s vendor, gets a 997 acknowledgement, receives an 846 inventory update once stock arrives, and
        reconciles the vendor&apos;s 810 invoice against the original order. See it live in the admin EDI page.
      </p>
    </div>
  );
}
