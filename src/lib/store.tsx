"use client";

// Client-side "backend": mock auth (no passwords, no Firebase) — the logged-in uid/role live
// in df_uid/df_role cookies so proxy.ts can gate /admin, /delivery and /dashboard. The rest
// of the mutable state (cart, orders, stock,
// subscriptions, EDI timeline, wallet/loyalty) lives in one localStorage blob shared by
// whichever demo role is logged in in this browser. The shape mirrors the Firestore data
// model 1:1, so swapping in real `firebase-admin` calls later means replacing the actions
// below, not the UI. Product catalog content (name/price/desc) is static from seed-data.ts;
// only stock and reviews are mutated here.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  products as seedProducts,
  vendors,
  demoUsers,
  seedSubscriptions,
  seedOrders,
  seedEdiDocuments,
  coupons as seedCoupons,
} from "./seed-data";
import type {
  Address,
  Coupon,
  EdiDocument,
  Order,
  OrderStatus,
  OrderType,
  Product,
  Slot,
  Subscription,
  SubscriptionItem,
  User,
} from "./types";
import { buildX12_846, buildX12_850, buildX12_810, EDI_REORDER_QTY } from "./edi";
import { computeDeliveryFee, todayIST } from "./format";

export type CartItem = { productId: string; quantity: number };

type DB = {
  products: Product[];
  users: User[];
  orders: Order[];
  subscriptions: Subscription[];
  ediDocuments: EdiDocument[];
  coupons: Coupon[];
  cart: CartItem[];
  recentlyViewed: string[];
};

const STORAGE_KEY = "dairyfresh_db_v1";
const WEEK = 60 * 60 * 24 * 7;

function setCookie(name: string, value: string, maxAge = WEEK) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function seedDB(): DB {
  return {
    products: seedProducts,
    users: demoUsers,
    orders: seedOrders,
    subscriptions: seedSubscriptions,
    ediDocuments: seedEdiDocuments,
    coupons: seedCoupons,
    cart: [],
    recentlyViewed: [],
  };
}

// Catalog fields (name/price/description/imageUrl/...) come fresh from seed-data.ts on every
// load, so a code change (new photo, new product, price update) always reaches returning
// visitors. Only what a session actually mutates — stock levels and user-submitted reviews —
// is carried over from the saved copy; a product with no saved match just uses the seed as-is.
function mergeProducts(stored: Product[]): Product[] {
  return seedProducts.map((fresh) => {
    const saved = stored.find((p) => p.id === fresh.id);
    return saved ? { ...fresh, stock: saved.stock, reviews: saved.reviews } : fresh;
  });
}

function loadDB(): DB {
  if (typeof window === "undefined") return seedDB();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDB();
    const stored = JSON.parse(raw) as DB;
    return { ...stored, products: mergeProducts(stored.products ?? []) };
  } catch {
    return seedDB();
  }
}

type Ctx = {
  db: DB;
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;
  addToCart: (productId: string, quantity: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  addRecentlyViewed: (productId: string) => void;
  placeOrder: (args: {
    userId: string;
    type: OrderType;
    items: CartItem[];
    address: Address;
    slot: Slot;
    deliveryDate: string;
    couponCode?: string;
    walletUsed: number;
  }) => Order;
  createSubscription: (args: {
    userId: string;
    items: SubscriptionItem[];
    frequency: Subscription["frequency"];
    deliverySlot: Slot;
    startDate: string;
  }) => Subscription;
  pauseSubscription: (id: string, pausedUntil: string) => void;
  resumeSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  modifySubscriptionItems: (id: string, items: SubscriptionItem[]) => void;
  addReview: (productId: string, userName: string, rating: number, comment: string) => void;
  adminUpdateStock: (productId: string, stock: number) => void;
  adminAddCoupon: (coupon: Coupon) => void;
  adminGenerateTomorrowOrders: () => number;
  adminSimulateLowStock: (productId?: string) => EdiDocument | null;
  adminAdvanceEdi: (poId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, deliveryStaffId?: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(seedDB);
  const [uid, setUid] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Registering adds the user to the local store; logging in as an existing user keeps their
  // local record (wallet/orders etc.) and just refreshes identity fields.
  const login = useCallback((user: User) => {
    setDb((prev) => {
      const local = prev.users.find((u) => u.id === user.id);
      const merged = local ? { ...local, name: user.name, email: user.email, role: user.role } : user;
      return { ...prev, users: [merged, ...prev.users.filter((u) => u.id !== user.id)] };
    });
    setCookie("df_uid", user.id);
    setCookie("df_role", user.role);
    setUid(user.id);
  }, []);

  const logout = useCallback(() => {
    setCookie("df_uid", "", 0);
    setCookie("df_role", "", 0);
    setUid(null);
  }, []);

  useEffect(() => {
    setDb(loadDB());
    setUid(getCookie("df_uid"));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db, hydrated]);

  const currentUser = useMemo(() => db.users.find((u) => u.id === uid) ?? null, [db.users, uid]);


  const addToCart = useCallback((productId: string, quantity: number) => {
    setDb((prev) => {
      const existing = prev.cart.find((c) => c.productId === productId);
      const cart = existing
        ? prev.cart.map((c) => (c.productId === productId ? { ...c, quantity: c.quantity + quantity } : c))
        : [...prev.cart, { productId, quantity }];
      return { ...prev, cart };
    });
  }, []);

  const updateCartQty = useCallback((productId: string, quantity: number) => {
    setDb((prev) => ({
      ...prev,
      cart: quantity <= 0 ? prev.cart.filter((c) => c.productId !== productId) : prev.cart.map((c) => (c.productId === productId ? { ...c, quantity } : c)),
    }));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setDb((prev) => ({ ...prev, cart: prev.cart.filter((c) => c.productId !== productId) }));
  }, []);

  const clearCart = useCallback(() => setDb((prev) => ({ ...prev, cart: [] })), []);

  const addRecentlyViewed = useCallback((productId: string) => {
    setDb((prev) => ({
      ...prev,
      recentlyViewed: [productId, ...prev.recentlyViewed.filter((id) => id !== productId)].slice(0, 8),
    }));
  }, []);

  const placeOrder: Ctx["placeOrder"] = useCallback((args) => {
    let created!: Order;
    setDb((prev) => {
      const items = args.items.map((c) => {
        const product = prev.products.find((p) => p.id === c.productId)!;
        const price = args.type === "B2B" ? product.b2bPrice : product.price;
        return { productId: c.productId, quantity: c.quantity, price };
      });
      const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const coupon = args.couponCode ? prev.coupons.find((c) => c.code === args.couponCode!.toUpperCase()) : undefined;
      const discount = coupon
        ? coupon.discountType === "PERCENT"
          ? Math.round(subtotal * (coupon.value / 100))
          : Math.min(coupon.value, subtotal)
        : 0;
      let total = subtotal - discount + computeDeliveryFee(subtotal);
      const walletUsed = Math.min(args.walletUsed, total);
      total -= walletUsed;

      const order: Order = {
        id: `ord_${Date.now()}`,
        userId: args.userId,
        type: args.type,
        status: "PLACED",
        items,
        total,
        paymentStatus: "PAID",
        razorpayOrderId: `rzp_test_${Date.now()}`,
        deliveryDate: args.deliveryDate,
        slot: args.slot,
        deliveryStaffId: null,
        address: args.address,
        createdAt: new Date().toISOString(),
      };
      created = order;

      const products = prev.products.map((p) => {
        const item = items.find((i) => i.productId === p.id);
        return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
      });

      const loyaltyEarned = Math.floor(total / 10000); // 1 point per ₹100
      const users = prev.users.map((u) =>
        u.id === args.userId
          ? { ...u, walletBalance: u.walletBalance - walletUsed, loyaltyPoints: u.loyaltyPoints + loyaltyEarned }
          : u,
      );

      return { ...prev, products, users, orders: [order, ...prev.orders], cart: [] };
    });
    return created;
  }, []);

  const createSubscription: Ctx["createSubscription"] = useCallback((args) => {
    const sub: Subscription = {
      id: `sub_${Date.now()}`,
      userId: args.userId,
      status: "ACTIVE",
      frequency: args.frequency,
      deliverySlot: args.deliverySlot,
      startDate: args.startDate,
      pausedUntil: null,
      items: args.items,
    };
    setDb((prev) => ({ ...prev, subscriptions: [sub, ...prev.subscriptions] }));
    return sub;
  }, []);

  const pauseSubscription = useCallback((id: string, pausedUntil: string) => {
    setDb((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, status: "PAUSED", pausedUntil } : s)),
    }));
  }, []);

  const resumeSubscription = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, status: "ACTIVE", pausedUntil: null } : s)),
    }));
  }, []);

  const cancelSubscription = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, status: "CANCELLED" } : s)),
    }));
  }, []);

  const modifySubscriptionItems = useCallback((id: string, items: SubscriptionItem[]) => {
    setDb((prev) => ({ ...prev, subscriptions: prev.subscriptions.map((s) => (s.id === id ? { ...s, items } : s)) }));
  }, []);

  const addReview = useCallback((productId: string, userName: string, rating: number, comment: string) => {
    setDb((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId
          ? { ...p, reviews: [{ id: `r_${Date.now()}`, productId, userName, rating, comment, createdAt: todayIST() }, ...p.reviews] }
          : p,
      ),
    }));
  }, []);

  const adminUpdateStock = useCallback((productId: string, stock: number) => {
    setDb((prev) => ({ ...prev, products: prev.products.map((p) => (p.id === productId ? { ...p, stock } : p)) }));
  }, []);

  const adminAddCoupon = useCallback((coupon: Coupon) => {
    setDb((prev) => ({ ...prev, coupons: [...prev.coupons.filter((c) => c.code !== coupon.code), coupon] }));
  }, []);

  const adminGenerateTomorrowOrders = useCallback(() => {
    let count = 0;
    setDb((prev) => {
      const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const newOrders: Order[] = [];
      let products = prev.products;

      for (const sub of prev.subscriptions) {
        if (sub.status !== "ACTIVE") continue;
        if (sub.pausedUntil && sub.pausedUntil >= tomorrow) continue;
        const user = prev.users.find((u) => u.id === sub.userId);
        if (!user) continue;
        const address = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
        if (!address) continue;

        const items = sub.items.map((si) => {
          const product = products.find((p) => p.id === si.productId)!;
          return { productId: si.productId, quantity: si.quantity, price: product.price };
        });
        products = products.map((p) => {
          const item = items.find((i) => i.productId === p.id);
          return item ? { ...p, stock: Math.max(0, p.stock - item.quantity) } : p;
        });

        newOrders.push({
          id: `ord_${Date.now()}_${sub.id}`,
          userId: sub.userId,
          type: "SUBSCRIPTION",
          status: "PLACED",
          items,
          total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          paymentStatus: "PAID",
          razorpayOrderId: `rzp_test_sub_${Date.now()}`,
          deliveryDate: tomorrow,
          slot: sub.deliverySlot,
          deliveryStaffId: null,
          address,
          createdAt: new Date().toISOString(),
        });
      }
      count = newOrders.length;
      return { ...prev, products, orders: [...newOrders, ...prev.orders] };
    });
    return count;
  }, []);

  const adminSimulateLowStock = useCallback((productId?: string) => {
    let created: EdiDocument | null = null;
    setDb((prev) => {
      const target = productId
        ? prev.products.find((p) => p.id === productId)
        : prev.products.find((p) => p.stock <= p.lowStockThreshold) ?? prev.products.reduce((a, b) => (a.stock < b.stock ? a : b));
      if (!target) return prev;
      const vendor = vendors.find((v) => v.id === target.vendorId)!;
      const poId = `PO-${Date.now()}`;
      const doc = buildX12_850(poId, target, vendor);
      created = doc;
      const products = productId ? prev.products : prev.products.map((p) => (p.id === target.id ? { ...p, stock: Math.min(p.stock, p.lowStockThreshold - 1) } : p));
      return { ...prev, products, ediDocuments: [doc, ...prev.ediDocuments] };
    });
    return created;
  }, []);

  const adminAdvanceEdi = useCallback(async (poId: string) => {
    const cycle = db.ediDocuments.filter((d) => d.poId === poId);
    const po = cycle.find((d) => d.type === "PURCHASE_ORDER_850");
    if (!po) return;
    const product = db.products.find((p) => p.id === po.productId)!;
    const vendor = vendors.find((v) => v.id === po.vendorId)!;
    const has997 = cycle.some((d) => d.type === "ACK_997");
    const has846 = cycle.some((d) => d.type === "INVENTORY_846");
    const has810 = cycle.some((d) => d.type === "INVOICE_810");

    if (!has997) {
      // hits the simulated vendor endpoint, mirroring a real trading-partner round trip
      const res = await fetch("/api/edi/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poId, vendorId: vendor.id }),
      });
      const doc: EdiDocument = await res.json();
      setDb((prev) => ({ ...prev, ediDocuments: [doc, ...prev.ediDocuments] }));
      return;
    }
    if (!has846) {
      const qty = (po.payload.quantity as number) ?? EDI_REORDER_QTY;
      const doc = buildX12_846(poId, product, vendor, qty);
      setDb((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === product.id ? { ...p, stock: p.stock + qty } : p)),
        ediDocuments: [doc, ...prev.ediDocuments],
      }));
      return;
    }
    if (!has810) {
      const qty = (po.payload.quantity as number) ?? EDI_REORDER_QTY;
      const doc = buildX12_810(poId, product, vendor, qty);
      setDb((prev) => ({ ...prev, ediDocuments: [doc, ...prev.ediDocuments] }));
    }
  }, [db.ediDocuments, db.products]);

  // deliveryStaffId: the delivery person acting on the order claims it; admin changes keep the existing one
  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus, deliveryStaffId?: string) => {
    setDb((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === orderId ? { ...o, status, deliveryStaffId: deliveryStaffId ?? o.deliveryStaffId } : o,
      ),
    }));
  }, []);

  const value: Ctx = {
    db,
    currentUser,
    login,
    logout,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addRecentlyViewed,
    placeOrder,
    createSubscription,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    modifySubscriptionItems,
    addReview,
    adminUpdateStock,
    adminAddCoupon,
    adminGenerateTomorrowOrders,
    adminSimulateLowStock,
    adminAdvanceEdi,
    updateOrderStatus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
