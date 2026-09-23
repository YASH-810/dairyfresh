"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { useStore } from "@/lib/store";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/about", label: "About" },
];

function SearchBar({ q, setQ, onSearch, placeholder }: { q: string; setQ: (v: string) => void; onSearch: (e: React.FormEvent) => void; placeholder: string }) {
  return (
    <form onSubmit={onSearch} className="relative w-full">
      <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dairy/40" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        type="search"
        placeholder={placeholder}
        className="w-full rounded-full border border-dairy/15 bg-dairy/[0.03] py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-sky focus:bg-white focus:ring-2 focus:ring-sky/15"
      />
    </form>
  );
}

export default function Header() {
  const { db, currentUser, logout } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const cartCount = db.cart.reduce((sum, c) => sum + c.quantity, 0);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-dairy/10 bg-white/95 shadow-sm backdrop-blur pt-[env(safe-area-inset-top,0px)]">
      <div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-3">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="DairyFresh" width={178} height={89} className="h-11 w-auto object-contain sm:h-14" priority />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar q={q} setQ={setQ} onSearch={onSearch} placeholder="Search milk, paneer, ghee…" />
        </div>

        <nav className="ml-auto hidden items-center gap-1 text-sm font-medium text-dairy md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 transition-colors hover:bg-dairy/5">
              {l.label}
            </Link>
          ))}
          {currentUser?.role === "ADMIN" && (
            <Link href="/admin" className="rounded-full px-3.5 py-2 transition-colors hover:bg-dairy/5">
              Admin
            </Link>
          )}
          {currentUser?.role === "DELIVERY" && (
            <Link href="/delivery" className="rounded-full px-3.5 py-2 transition-colors hover:bg-dairy/5">
              Delivery
            </Link>
          )}
        </nav>

        <Link href="/cart" className="relative shrink-0 rounded-full p-2 text-dairy transition-colors hover:bg-dairy/5" aria-label="Cart">
          <ShoppingCart size={21} />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>

        {currentUser ? (
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <Link href="/dashboard" className="flex items-center gap-2 font-medium text-dairy">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dairy text-xs font-bold text-white">
                {currentUser.name[0]}
              </span>
              <span className="hidden sm:inline">{currentUser.name.split(" ")[0]}</span>
            </Link>
            <button onClick={logout} className="text-foreground/50 transition-colors hover:text-dairy" aria-label="Logout">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="shrink-0 rounded-full bg-dairy px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky">
            Login
          </Link>
        )}
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar q={q} setQ={setQ} onSearch={onSearch} placeholder="Search products…" />
      </div>
    </header>
  );
}
