import type {
  Address,
  Coupon,
  EdiDocument,
  Order,
  Product,
  Subscription,
  User,
  Vendor,
} from "./types";
import { buildX12_850, buildX12_997, buildX12_846, buildX12_810 } from "./edi";

export const vendors: Vendor[] = [
  { id: "v1", name: "Sahyadri Farms Collective", farmLocation: "Kolhapur, MH", contact: "sahyadri@vendors.dairyfresh.test" },
  { id: "v2", name: "Green Meadow Dairy Co-op", farmLocation: "Nashik, MH", contact: "greenmeadow@vendors.dairyfresh.test" },
  { id: "v3", name: "Konkan Coastal Creamery", farmLocation: "Ratnagiri, MH", contact: "konkan@vendors.dairyfresh.test" },
];

const addr = (over: Partial<Address> = {}): Address => ({
  id: "addr1",
  line: "14, Sunrise Apartments",
  area: "Kothrud",
  city: "Pune",
  pincode: "411038",
  isDefault: true,
  ...over,
});

export const demoUsers: User[] = [
  {
    id: "u_customer",
    name: "Anaya Kulkarni",
    email: "customer@dairyfresh.test",
    phone: "9876543210",
    role: "CUSTOMER",
    addresses: [addr()],
    walletBalance: 15000,
    loyaltyPoints: 320,
  },
  {
    id: "u_admin",
    name: "Rohan Deshpande",
    email: "admin@dairyfresh.test",
    phone: "9876500001",
    role: "ADMIN",
    addresses: [],
    walletBalance: 0,
    loyaltyPoints: 0,
  },
  {
    id: "u_delivery",
    name: "Suresh Pawar",
    email: "delivery@dairyfresh.test",
    phone: "9876500002",
    role: "DELIVERY",
    addresses: [],
    walletBalance: 0,
    loyaltyPoints: 0,
  },
  {
    id: "u_b2b",
    name: "The Sweet Spot Café",
    email: "b2b@dairyfresh.test",
    phone: "9876500003",
    role: "B2B",
    addresses: [addr({ id: "addr2", line: "Shop 4, FC Road", area: "Shivajinagar", city: "Pune", pincode: "411005" })],
    walletBalance: 50000,
    loyaltyPoints: 0,
  },
];

export const DEMO_PASSWORD = "Demo@1234";

function p(
  id: string,
  name: string,
  category: Product["category"],
  price: number,
  unit: string,
  stock: number,
  vendorId: string,
  opts: Partial<Product> = {},
): Product {
  return {
    id,
    slug: id,
    name,
    category,
    description: `Farm-fresh ${name.toLowerCase()}, sourced daily from our partner dairy farms and delivered cold to your doorstep.`,
    price,
    b2bPrice: Math.round(price * 0.85),
    unit,
    stock,
    lowStockThreshold: 20,
    imageEmoji: "🥛",
    isSubscribable: category === "Milk" || category === "Curd",
    isVeg: true,
    vendorId,
    reviews: [],
    ...opts,
  };
}

export const products: Product[] = [
  p("toned-milk-500ml", "Toned Milk", "Milk", 2700, "500ml", 200, "v1", { imageEmoji: "🥛", imageUrl: "/product/toned-milk.png" }),
  p("toned-milk-1l", "Toned Milk", "Milk", 5200, "1L", 180, "v1", { imageEmoji: "🥛", imageUrl: "/product/toned-milk.png" }),
  p("full-cream-milk-500ml", "Full Cream Milk", "Milk", 3200, "500ml", 150, "v1", { imageEmoji: "🥛", imageUrl: "/product/full-cream-milk.png" }),
  p("full-cream-milk-1l", "Full Cream Milk", "Milk", 6200, "1L", 15, "v1", { imageEmoji: "🥛", lowStockThreshold: 20, imageUrl: "/product/full-cream-milk.png" }),
  p("cow-milk-1l", "Pure Cow Milk", "Milk", 6800, "1L", 90, "v2", { imageEmoji: "🐄", imageUrl: "/product/pure-cow-milk.png" }),
  p("buffalo-milk-1l", "Buffalo Milk", "Milk", 7400, "1L", 70, "v2", { imageEmoji: "🐃", imageUrl: "/product/buffalo-milk.png" }),
  p("plain-curd-400g", "Plain Curd", "Curd", 4000, "400g", 120, "v1", { imageEmoji: "🍶", imageUrl: "/product/plain-curd.png" }),
  p("greek-curd-200g", "Greek-style Hung Curd", "Curd", 6500, "200g", 60, "v3", { imageEmoji: "🍶", imageUrl: "/product/greek-style-hung-curd.png" }),
  p("flavoured-curd-mango-100g", "Mango Flavoured Curd", "Curd", 3500, "100g", 80, "v3", { imageEmoji: "🥭", imageUrl: "/product/mango-flavoured-curd.png" }),
  p("paneer-200g", "Fresh Paneer", "Paneer", 9000, "200g", 65, "v2", { imageEmoji: "🧀", imageUrl: "/product/fresh-paneer.png" }),
  p("paneer-500g", "Fresh Paneer", "Paneer", 21000, "500g", 12, "v2", { imageEmoji: "🧀", lowStockThreshold: 15, imageUrl: "/product/fresh-paneer.png" }),
  p("malai-paneer-200g", "Malai Paneer", "Paneer", 11000, "200g", 40, "v2", { imageEmoji: "🧀", imageUrl: "/product/malai-paneer.png" }),
  p("cow-ghee-500ml", "Pure Cow Ghee", "Ghee", 45000, "500ml", 55, "v1", { imageEmoji: "🫙", isSubscribable: false, imageUrl: "/product/pure-cow-ghee.png" }),
  p("cow-ghee-1l", "Pure Cow Ghee", "Ghee", 85000, "1L", 30, "v1", { imageEmoji: "🫙", isSubscribable: false, imageUrl: "/product/pure-cow-ghee.png" }),
  p("desi-ghee-500ml", "A2 Desi Ghee", "Ghee", 62000, "500ml", 8, "v2", { imageEmoji: "🫙", isSubscribable: false, lowStockThreshold: 10, imageUrl: "/product/a2-desi-ghee.png" }),
  p("salted-butter-200g", "Salted Butter", "Butter", 9500, "200g", 70, "v1", { imageEmoji: "🧈", isSubscribable: false, imageUrl: "/product/salted-butter.png" }),
  p("white-butter-200g", "White Butter (Loni)", "Butter", 10500, "200g", 45, "v3", { imageEmoji: "🧈", isSubscribable: false, imageUrl: "/product/white-butter.png" }),
  p("gulab-jamun-500g", "Gulab Jamun", "Sweets", 22000, "500g box", 35, "v2", { imageEmoji: "🍮", isSubscribable: false, imageUrl: "/product/gulab-jamun.png" }),
  p("kaju-katli-250g", "Kaju Katli", "Sweets", 35000, "250g box", 25, "v3", { imageEmoji: "🍬", isSubscribable: false, imageUrl: "/product/kaju-katli.png" }),
  p("basundi-500ml", "Basundi", "Sweets", 18000, "500ml", 20, "v2", { imageEmoji: "🍯", isSubscribable: false, imageUrl: "/product/basundi.png" }),
  p("shrikhand-400g", "Kesar Shrikhand", "Sweets", 16000, "400g", 30, "v3", { imageEmoji: "🍨", isSubscribable: false, imageUrl: "/product/kesar-shrikhand.png" }),
  p("diwali-bundle", "Diwali Festive Bundle", "Festive Bundles", 89900, "1 pack", 18, "v1", {
    imageEmoji: "🎁",
    isSubscribable: false,
    description: "Ghee, kaju katli, gulab jamun and paneer — a festive gift box for the season.",
  }),
  p("family-pack-bundle", "Weekly Family Essentials Pack", "Festive Bundles", 45000, "1 pack", 22, "v1", {
    imageEmoji: "📦",
    isSubscribable: false,
    description: "Milk, curd, paneer and butter bundled for the week at a bundle discount.",
  }),
];

// seed a couple of reviews
products.find((x) => x.id === "toned-milk-1l")!.reviews = [
  { id: "r1", productId: "toned-milk-1l", userName: "Anaya K.", rating: 5, comment: "Always fresh, delivered on time every morning.", createdAt: "2026-08-01" },
  { id: "r2", productId: "toned-milk-1l", userName: "Vikram S.", rating: 4, comment: "Good quality, wish 2L option existed.", createdAt: "2026-08-12" },
];
products.find((x) => x.id === "paneer-200g")!.reviews = [
  { id: "r3", productId: "paneer-200g", userName: "Meera J.", rating: 5, comment: "Softest paneer I've bought online.", createdAt: "2026-08-20" },
];

export const coupons: Coupon[] = [
  { code: "FRESH10", discountType: "PERCENT", value: 10, validTill: "2026-12-31" },
  { code: "FIRSTWEEK", discountType: "FLAT", value: 10000, validTill: "2026-12-31" },
];

export const seedSubscriptions: Subscription[] = [
  {
    id: "sub_active_1",
    userId: "u_customer",
    status: "ACTIVE",
    frequency: "DAILY",
    deliverySlot: "MORNING",
    startDate: "2026-08-01",
    pausedUntil: null,
    items: [{ productId: "toned-milk-1l", quantity: 1 }],
  },
  {
    id: "sub_paused_1",
    userId: "u_customer",
    status: "PAUSED",
    frequency: "ALTERNATE",
    deliverySlot: "EVENING",
    startDate: "2026-07-10",
    pausedUntil: "2026-09-30",
    items: [{ productId: "plain-curd-400g", quantity: 2 }],
  },
];

const milk = products.find((x) => x.id === "toned-milk-1l")!;
const paneer = products.find((x) => x.id === "paneer-200g")!;

export const seedOrders: Order[] = [
  {
    id: "ord_1001",
    userId: "u_customer",
    type: "ONE_TIME",
    status: "DELIVERED",
    items: [{ productId: paneer.id, quantity: 2, price: paneer.price }],
    total: paneer.price * 2,
    paymentStatus: "PAID",
    razorpayOrderId: "rzp_test_demo1001",
    deliveryDate: "2026-09-15",
    slot: "MORNING",
    deliveryStaffId: "u_delivery",
    address: addr(),
    createdAt: "2026-09-14T10:30:00+05:30",
  },
  {
    id: "ord_1002",
    userId: "u_customer",
    type: "SUBSCRIPTION",
    status: "OUT_FOR_DELIVERY",
    items: [{ productId: milk.id, quantity: 1, price: milk.price }],
    total: milk.price,
    paymentStatus: "PAID",
    razorpayOrderId: "rzp_test_demo1002",
    deliveryDate: "2026-09-22",
    slot: "MORNING",
    deliveryStaffId: "u_delivery",
    address: addr(),
    createdAt: "2026-09-21T20:00:00+05:30",
  },
];

// A restock cycle already sitting in the EDI timeline, so the admin page has
// something to show before anyone clicks "Simulate low stock".
const ghee = products.find((x) => x.id === "desi-ghee-500ml")!;
const poId = "PO-SEED-0001";
export const seedEdiDocuments: EdiDocument[] = [
  buildX12_850(poId, ghee, vendors.find((v) => v.id === ghee.vendorId)!),
  buildX12_997(poId, ghee.vendorId),
  buildX12_846(poId, ghee, vendors.find((v) => v.id === ghee.vendorId)!, 50),
  buildX12_810(poId, ghee, vendors.find((v) => v.id === ghee.vendorId)!, 50),
];
