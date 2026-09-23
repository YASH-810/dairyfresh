import Image from "next/image";
import Link from "next/link";
import { Camera, MessageCircle, Users, X as XIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-dairy/10 bg-gradient-to-b from-dairy to-[#123249] text-white/90 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-xl bg-white px-3 py-2">
            <Image src="/logo.png" alt="DairyFresh" width={178} height={89} className="h-8 w-auto object-contain" />
          </div>
          <p className="mt-2 text-sm text-white/70">Farm-fresh dairy, delivered daily. B2C, subscriptions and B2B — one platform.</p>
        </div>
        <div>
          <div className="font-semibold">Shop</div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li><Link href="/products">All products</Link></li>
            <li><Link href="/subscribe">Subscriptions</Link></li>
            <li><Link href="/about">About us</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Offers</div>
          <ul className="mt-2 space-y-1 text-sm text-white/70">
            <li>Coupon <code className="rounded bg-white/10 px-1">FRESH10</code> — 10% off</li>
            <li>Coupon <code className="rounded bg-white/10 px-1">FIRSTWEEK</code> — ₹100 off</li>
            <li>Referral code: <code className="rounded bg-white/10 px-1">DAIRY50</code></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold">Follow &amp; chat</div>
          <div className="mt-2 flex gap-2">
            {[
              { href: "https://wa.me/919876500000", label: "WhatsApp", Icon: MessageCircle },
              { href: "https://facebook.com", label: "Facebook", Icon: Users },
              { href: "https://x.com", label: "X", Icon: XIcon },
              { href: "https://instagram.com", label: "Instagram", Icon: Camera },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/60">
        © 2026 DairyFresh — a student E-Commerce project.
      </div>
    </footer>
  );
}
