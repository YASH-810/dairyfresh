// Core data model — mirrors the CLAUDE.md spec. Persisted client-side (see lib/store.tsx)
// since this demo has no live Firebase project; swap the store's persistence layer for
// firebase-admin calls when real credentials exist.

export type Role = "CUSTOMER" | "ADMIN" | "DELIVERY" | "B2B";

export type Address = {
  id: string;
  line: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  addresses: Address[];
  walletBalance: number; // paise
  loyaltyPoints: number;
};

export type Vendor = {
  id: string;
  name: string;
  farmLocation: string;
  contact: string;
};

export type Category =
  | "Milk"
  | "Curd"
  | "Paneer"
  | "Ghee"
  | "Butter"
  | "Sweets"
  | "Festive Bundles";

export type Review = {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  description: string;
  price: number; // paise
  b2bPrice: number; // paise
  unit: string;
  stock: number;
  lowStockThreshold: number;
  imageEmoji: string;
  imageUrl?: string;
  isSubscribable: boolean;
  isVeg: boolean;
  vendorId: string;
  reviews: Review[];
};

export type SubscriptionItem = { productId: string; quantity: number };

export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "CANCELLED";
export type Frequency = "DAILY" | "ALTERNATE" | "WEEKLY";
export type Slot = "MORNING" | "EVENING";

export type Subscription = {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  frequency: Frequency;
  deliverySlot: Slot;
  startDate: string;
  pausedUntil: string | null;
  items: SubscriptionItem[];
};

export type OrderType = "ONE_TIME" | "SUBSCRIPTION" | "B2B";
export type OrderStatus =
  | "PLACED"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderItem = { productId: string; quantity: number; price: number };

export type Order = {
  id: string;
  userId: string;
  type: OrderType;
  status: OrderStatus;
  items: OrderItem[];
  total: number; // paise
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  razorpayOrderId: string;
  deliveryDate: string;
  slot: Slot;
  deliveryStaffId: string | null;
  address: Address;
  createdAt: string;
};

export type Coupon = {
  code: string;
  discountType: "PERCENT" | "FLAT";
  value: number;
  validTill: string;
};

export type EdiDocType =
  | "PURCHASE_ORDER_850"
  | "ACK_997"
  | "INVENTORY_846"
  | "INVOICE_810";

export type EdiDocument = {
  id: string;
  poId: string; // groups the 850/997/846/810 cycle for one restock
  type: EdiDocType;
  vendorId: string;
  productId: string;
  payload: Record<string, unknown>;
  rawX12: string;
  status: "SENT" | "RECEIVED" | "ACKNOWLEDGED";
  createdAt: string;
};
