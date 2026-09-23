# CLAUDE.md — DairyFresh

## Project Overview

**DairyFresh** is an e-commerce dairy platform with subscription-based home delivery — a digital-first alternative to Chitale Dairy & Mother Dairy. Customers can buy dairy products (milk, curd, paneer, ghee, butter, sweets) one-time or set up daily/weekly milk subscriptions they can pause, resume and modify themselves.

This is a college **E-Commerce / E-Business** project. It is graded on two things:
1. A **PPT presentation** (business + technical)
2. A **live website demo** at a working public URL

Every feature below exists to satisfy a grading point. When in doubt, prioritise things that can be **visibly demonstrated** in a 5–10 minute demo over hidden complexity.

### Target users
- **Customers** — households who want fresh dairy delivered daily
- **B2B buyers** — hotels, cafés, sweet shops ordering in bulk
- **Admin** — manages products, inventory, subscriptions, routes, EDI feeds
- **Delivery staff** — sees today's route and marks deliveries done

### Business models implemented
- **B2C** — one-time product orders via cart/checkout
- **Subscription (D2C)** — recurring daily/weekly/alternate-day plans (core differentiator)
- **B2B** — bulk pricing tiers for business accounts
- **Marketplace (light)** — local dairy vendors listed as suppliers of products

**Type of electronic marketplace:** seller-side vertical marketplace (single industry: dairy) with a hybrid vendor layer.

**Revenue model:** product margins, subscription plans (monthly prepaid), delivery fee on small one-time orders, B2B bulk contracts, vendor commission, promoted/featured listings.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Firebase Firestore (NoSQL, real-time) — free Spark plan |
| Backend SDK | `firebase-admin` on the server, `firebase` client SDK in the browser |
| Auth | Firebase Authentication — email/password + Google; roles via custom claims |
| File storage | Firebase Storage (product images) |
| Payments | Razorpay **test mode** (Checkout + webhook) |
| Validation | Zod (every form and API input) |
| Images | `next/image`, files in Firebase Storage |
| Testing | Vitest (unit) + Playwright (E2E) |
| Hosting | Vercel (auto HTTPS/SSL, preview deploys) |
| Analytics | Vercel Analytics |

Do not add new major dependencies without asking.

---

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build (must pass before every push)
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright E2E tests
npm run seed             # seed Firestore with products, users, demo data
firebase emulators:start # local Auth + Firestore emulators
firebase deploy --only firestore:rules   # deploy security rules
```

---

## Folder Structure

```
src/
  app/
    (shop)/                 # public storefront
      page.tsx              # Home: hero, offers banner, featured, subscriptions CTA
      products/             # catalog with search, filters, sort
      products/[slug]/      # product detail page
      subscribe/            # subscription plan builder
      cart/
      checkout/
      order/[id]/success/
    (account)/
      dashboard/            # orders, active subscriptions, wallet, loyalty points
      dashboard/subscriptions/[id]/   # pause / resume / modify / skip a day
      dashboard/orders/[id]/          # order tracking timeline
    admin/                  # role = ADMIN only
      page.tsx              # KPIs: today's orders, revenue, active subs, low stock
      products/  orders/  subscriptions/  inventory/
      edi/                  # EDI documents: POs, invoices, stock updates
      promotions/           # coupons, banners, festive bundles
    delivery/               # role = DELIVERY only — today's route, mark delivered
    api/
      razorpay/webhook/
      edi/                  # simulated supplier EDI endpoints
      cron/generate-orders/ # daily job: subscriptions -> orders
    sitemap.ts  robots.ts
  components/
  lib/
    firebase/client.ts      # browser SDK init
    firebase/admin.ts       # admin SDK init (server only)
    razorpay.ts  edi.ts  utils.ts
  scripts/seed.ts
firestore.rules  firestore.indexes.json  firebase.json
  tests/
```

---

## Data Model (Firestore collections)

Core entities — keep names consistent with the PPT architecture slide. Each entity is a top-level collection; line items (`items[]`) are stored as arrays inside the parent document. Use Firestore transactions for stock changes and order creation.


- **users/{uid}** — uid (from Firebase Auth), name, email, phone, role (`CUSTOMER | ADMIN | DELIVERY | B2B`), addresses, walletBalance, loyaltyPoints
- **Address** — line, area, city, pincode, isDefault
- **Vendor** — name, farmLocation, contact (marketplace supplier)
- **Product** — slug, name, category, description, price, b2bPrice, unit (500ml, 1L, 200g), stock, imageUrl, isSubscribable, vendorId
- **Subscription** — userId, status (`ACTIVE | PAUSED | CANCELLED`), frequency (`DAILY | ALTERNATE | WEEKLY`), deliverySlot (`MORNING | EVENING`), startDate, pausedUntil, items[]
- **SubscriptionItem** — productId, quantity
- **Order** — userId, type (`ONE_TIME | SUBSCRIPTION | B2B`), status (`PLACED | PACKED | OUT_FOR_DELIVERY | DELIVERED | CANCELLED`), total, paymentStatus, razorpayOrderId, deliveryDate, slot, deliveryStaffId
- **OrderItem** — productId, quantity, price
- **Coupon** — code, discountType, value, validTill
- **Review** — productId, userId, rating, comment
- **EdiDocument** — type (`PURCHASE_ORDER_850 | INVOICE_810 | INVENTORY_846 | ACK_997`), vendorId, payload (JSON), rawX12 (text), status (`SENT | RECEIVED | ACKNOWLEDGED`), createdAt

Flow: **User → Products → Subscription → auto-generated Orders → Delivery route**, status synced back to customer.

---

## Feature Checklist (mapped to grading)

### Must demo (website demo requirements)
- [ ] **Hosted on a working public URL** (Vercel) with HTTPS
- [ ] **Navigation** — sticky header, categories, footer, breadcrumbs
- [ ] **Product/service search** — search bar with live results + filters (category, price, veg/type) + sort
- [ ] **Product details** — images, price, unit selector, reviews, "Subscribe & Save" vs "Buy once"
- [ ] **Cart** — add/update/remove, coupon code, price summary
- [ ] **Checkout + payment workflow** — address, delivery slot, Razorpay test payment, success page, order in dashboard
- [ ] **Subscription flow** — pick products → frequency → slot → start date → pay; then pause/resume/modify from dashboard
- [ ] **Responsiveness** — mobile-first; test at 375px, 768px, 1280px
- [ ] **Security** — see Security section
- [ ] **Testing** — show passing Playwright run (record a video or screenshot)
- [ ] **Maintenance** — admin panel for products/inventory/orders; `/api/health` endpoint
- [ ] **Advertisement** — homepage offer banners, festive bundles, coupon codes, referral code
- [ ] **Personalization** — "Buy again", recommendations from order history, greeting by name, recently viewed
- [ ] **EDI workflow** — admin/edi page showing the full cycle (see below)
- [ ] **E-commerce model explained** — `/about` page describing B2C + subscription + B2B + marketplace

### PPT-supporting features
- [ ] **SEO** — Next.js Metadata API per page, `sitemap.ts`, `robots.ts`, Open Graph images, Product JSON-LD structured data
- [ ] **Social plugins** — share buttons (WhatsApp, Facebook, X), Instagram/WhatsApp links in footer, WhatsApp chat button
- [ ] **Loyalty points** earned per order, redeemable at checkout
- [ ] **Wallet** balance usable for subscriptions

---

## EDI Implementation (simulated)

Real EDI needs a VAN / trading partners, so we **simulate** it inside the app — this is expected and acceptable for the demo. Make the flow visible:

1. Stock of a product falls below threshold → system auto-generates **EDI 850 Purchase Order** to that product's vendor
2. Store both JSON and an **X12-formatted** string (show the raw segments like `ISA`, `GS`, `ST*850`, `BEG`, `PO1`, `SE`) in the admin UI
3. Simulated vendor endpoint `/api/edi/vendor` returns **997 Functional Acknowledgement**
4. Vendor "ships" → sends **856/846 Inventory update** → stock increases automatically
5. Vendor sends **810 Invoice** → admin sees it matched against the PO (reconciliation)

Admin EDI page: timeline table of documents per PO, with status badges and a "View raw EDI" modal. Add a "Simulate low stock" button for the live demo.

---

## Subscription → Order Generation

- A route `/api/cron/generate-orders` creates tomorrow's orders from all `ACTIVE` subscriptions not paused for that date
- Schedule it with Vercel Cron (`vercel.json`) daily at night
- Also expose an **admin button "Generate tomorrow's orders"** so it can be triggered live during the demo
- Pause/skip changes must be allowed only before a cutoff (e.g. 10 PM the day before)

---

## Security Rules

- All secrets in `.env.local`; never commit `.env*` files
- Passwords are handled by Firebase Authentication — never store them in Firestore
- Verify the Firebase ID token (or session cookie) on the server with `firebase-admin` before every mutation
- Roles live in custom claims set only by the admin SDK; never trust a role sent from the client
- `firestore.rules`: users read/write only their own docs; products public read, admin write; orders/EDI written only by the server
- Every server action / API route: validate with Zod, check session and role
- Admin and delivery routes protected in `middleware.ts` by role
- Verify Razorpay payment signature server-side; **never trust client-side payment success**
- Webhook route verifies the Razorpay webhook signature
- Recalculate cart totals on the server; never trust prices from the client
- Security headers in `next.config.ts` (CSP, X-Frame-Options, Referrer-Policy)
- Basic rate limiting on login, signup and coupon endpoints
- Firestore has no SQL (no SQL injection); React escapes output (XSS safe) — do not use `dangerouslySetInnerHTML` except for JSON-LD

---

## Environment Variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_SITE_URL=
CRON_SECRET=
```

---

## Coding Conventions

- TypeScript strict mode; no `any`
- Server Components by default; `"use client"` only where interactivity is needed
- Use Server Actions for mutations; API routes only for webhooks, cron, EDI endpoints
- Prices stored as integers in **paise**; format with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- Dates in `Asia/Kolkata` timezone
- Components: PascalCase files; utilities: camelCase
- Every page must look good on mobile first
- Colour palette: dairy blue `#1B4965`, sky `#2E86AB`, gold `#F4A340`, white — match the PPT
- Keep UI copy simple and in English; ₹ symbol for prices

---

## Seed Data

The seed script must create a demo-ready state:
- 20+ products across Milk, Curd, Paneer, Ghee, Butter, Sweets, Festive Bundles (with real-looking images)
- 3 vendors
- Demo logins: `customer@dairyfresh.test`, `admin@dairyfresh.test`, `delivery@dairyfresh.test`, `b2b@dairyfresh.test` (password in README)
- A customer with order history, 1 active and 1 paused subscription, loyalty points
- Coupons: `FRESH10`, `FIRSTWEEK`
- A few EDI documents already in the timeline

---

## Build Priority

1. Setup: Next.js, Tailwind, Firebase project (Auth + Firestore + Storage), deploy skeleton to Vercel **on day 1**
2. Catalog, search, product detail
3. Cart + checkout + Razorpay test payment
4. Customer dashboard + order tracking
5. Subscription builder + pause/resume + order generation
6. Admin panel (products, orders, inventory)
7. EDI simulation page
8. Personalization, promotions, loyalty, SEO, social share
9. Delivery staff view
10. Tests (Playwright happy path: search → add to cart → checkout → pay)

Stop adding features 2 days before the demo; only fix bugs and polish.

---

## Demo Script (for reference)

1. Open live URL on laptop + phone (responsiveness)
2. Search "paneer" → open product → add to cart → apply coupon → checkout → Razorpay test pay
3. Create a daily milk subscription → pause it from dashboard
4. Show personalization ("Buy again", recommendations)
5. Log in as admin → generate tomorrow's orders → show inventory
6. Simulate low stock → show EDI 850 → 997 → 846 → 810 cycle
7. Show HTTPS padlock, security headers, passing tests, sitemap/SEO meta
