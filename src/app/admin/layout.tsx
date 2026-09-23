"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/edi", label: "EDI" },
  { href: "/admin/promotions", label: "Promotions" },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  const pathname = usePathname();
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:gap-6">
      <nav className="scrollbar-none flex gap-1 overflow-x-auto text-sm md:w-40 md:shrink-0 md:flex-col md:gap-0 md:space-y-1 md:overflow-visible">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`shrink-0 rounded-lg px-3 py-2 font-medium ${pathname === l.href ? "bg-dairy text-white" : "text-dairy hover:bg-dairy/5"}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
