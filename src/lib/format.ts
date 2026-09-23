import type { Product, Role } from "./types";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

// prices are stored as integer paise
export function formatPrice(paise: number): string {
  return inr.format(paise / 100);
}

// B2B accounts pay the wholesale price everywhere (cart, checkout, order)
export function priceFor(product: Product, role?: Role): number {
  return role === "B2B" ? product.b2bPrice : product.price;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function todayIST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
}

const FREE_DELIVERY_THRESHOLD = 20000; // ₹200
const DELIVERY_FEE = 3000; // ₹30

export function computeDeliveryFee(subtotal: number): number {
  return subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
}

// pause/skip cutoff: 10 PM the day before
export function isPastPauseCutoff(): boolean {
  const hourIST = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false }).format(new Date()),
  );
  return hourIST >= 22;
}
