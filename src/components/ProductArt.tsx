// Hand-drawn SVG product illustrations, one per category. No external images/network
// calls — crisp at any size and always on-brand. Swap for real photography later by
// giving Product an `imageUrl` and rendering that instead when present.
import { useId, type ReactElement } from "react";
import type { Category } from "@/lib/types";

const DAIRY = "#1b4965";
const SKY = "#2e86ab";
const GOLD = "#f4a340";

function Milk() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <path d="M48 14h24l4 16v10c8 8 12 20 12 32v28a6 6 0 0 1-6 6H38a6 6 0 0 1-6-6V72c0-12 4-24 12-32V30z" fill="#eaf6fb" stroke={SKY} strokeWidth="3" />
      <path d="M32 72c0-12 4-24 12-32v-10h32v10c8 8 12 20 12 32v6H32z" fill={SKY} opacity="0.18" />
      <rect x="44" y="10" width="32" height="12" rx="3" fill={GOLD} />
      <path d="M44 70h32M40 84h40M40 96h40" stroke={SKY} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      <circle cx="60" cy="56" r="5" fill={SKY} opacity="0.25" />
    </svg>
  );
}

function Curd() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <ellipse cx="60" cy="100" rx="34" ry="8" fill={DAIRY} opacity="0.12" />
      <path d="M26 54c0-4 3-7 7-7h54c4 0 7 3 7 7l-6 40a10 10 0 0 1-10 9H42a10 10 0 0 1-10-9z" fill="#fffaf0" stroke={GOLD} strokeWidth="3" />
      <path d="M26 54c0-4 3-7 7-7h54c4 0 7 3 7 7" fill="none" stroke={GOLD} strokeWidth="3" />
      <path d="M36 60q24 14 48 0" stroke={GOLD} strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M40 74q20 10 40 0" stroke={GOLD} strokeWidth="3" fill="none" opacity="0.5" />
      <path d="M44 88q16 8 32 0" stroke={GOLD} strokeWidth="3" fill="none" opacity="0.5" />
    </svg>
  );
}

function Paneer() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect x="20" y="60" width="80" height="34" rx="6" fill="#fffdf5" stroke={GOLD} strokeWidth="3" />
      <rect x="30" y="30" width="60" height="34" rx="6" fill="#fffaf0" stroke={GOLD} strokeWidth="3" />
      <path d="M30 47h60M60 30v34M20 77h80M50 60v34M75 60v34" stroke={GOLD} strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

function Ghee() {
  const clipId = `gheeJar-${useId()}`;
  const jar = "M28 38a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4l4 54a8 8 0 0 1-8 8H32a8 8 0 0 1-8-8z";
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <defs>
        <clipPath id={clipId}>
          <path d={jar} />
        </clipPath>
      </defs>
      <rect x="30" y="16" width="24" height="12" rx="3" fill={DAIRY} />
      <path d="M34 28h16v10H34z" fill={GOLD} opacity="0.6" />
      <path d={jar} fill="#fff8e8" stroke={GOLD} strokeWidth="3" />
      <rect x="20" y="60" width="60" height="46" fill={GOLD} opacity="0.55" clipPath={`url(#${clipId})`} />
      <ellipse cx="46" cy="52" rx="5" ry="9" fill="#fff" opacity="0.6" />
    </svg>
  );
}

function Butter() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <ellipse cx="60" cy="88" rx="40" ry="10" fill={DAIRY} opacity="0.1" />
      <path d="M26 50l10-16h48l10 16-8 34a8 8 0 0 1-8 6H42a8 8 0 0 1-8-6z" fill="#fff4c7" stroke={GOLD} strokeWidth="3" />
      <path d="M26 50h68" stroke={GOLD} strokeWidth="3" opacity="0.5" />
      <path d="M46 50v34M74 50v34" stroke={GOLD} strokeWidth="2" opacity="0.4" />
    </svg>
  );
}

function Sweets() {
  const gradId = `sweetShine-${useId()}`;
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <defs>
        <radialGradient id={gradId} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffd28a" />
          <stop offset="100%" stopColor="#f4a340" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="88" rx="42" ry="10" fill={GOLD} opacity="0.15" />
      <circle cx="44" cy="66" r="20" fill={`url(#${gradId})`} />
      <circle cx="78" cy="72" r="15" fill={DAIRY} opacity="0.85" />
      <circle cx="44" cy="58" r="3" fill="#fff" opacity="0.6" />
      <circle cx="78" cy="66" r="2.5" fill="#fff" opacity="0.5" />
    </svg>
  );
}

function Festive() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect x="24" y="50" width="72" height="46" rx="6" fill="#fff4c7" stroke={GOLD} strokeWidth="3" />
      <rect x="24" y="50" width="72" height="14" fill={DAIRY} opacity="0.12" />
      <rect x="52" y="50" width="16" height="46" fill={GOLD} opacity="0.7" />
      <path d="M60 50c-10-14-30-10-24 2 4 8 24 8 24-2zM60 50c10-14 30-10 24 2-4 8-24 8-24-2z" fill={DAIRY} />
      <circle cx="94" cy="34" r="3" fill={GOLD} />
      <circle cx="102" cy="44" r="2" fill={SKY} />
      <circle cx="18" cy="40" r="2.5" fill={GOLD} />
    </svg>
  );
}

const ART: Record<Category, () => ReactElement> = {
  Milk,
  Curd,
  Paneer,
  Ghee,
  Butter,
  Sweets,
  "Festive Bundles": Festive,
};

const BG: Record<Category, string> = {
  Milk: "bg-gradient-to-br from-sky/15 to-sky/5",
  Curd: "bg-gradient-to-br from-gold/15 to-gold/5",
  Paneer: "bg-gradient-to-br from-amber-100 to-amber-50",
  Ghee: "bg-gradient-to-br from-gold/20 to-amber-50",
  Butter: "bg-gradient-to-br from-yellow-100 to-yellow-50",
  Sweets: "bg-gradient-to-br from-orange-100 to-gold/10",
  "Festive Bundles": "bg-gradient-to-br from-dairy/15 to-sky/10",
};

export function productArtBg(category: Category): string {
  return BG[category] ?? "bg-sky/10";
}

export default function ProductArt({ category, className }: { category: Category; className?: string }) {
  const Art = ART[category] ?? Milk;
  return (
    <div className={className}>
      <Art />
    </div>
  );
}
