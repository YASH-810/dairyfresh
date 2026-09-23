# DairyFresh

Dairy e-commerce + subscription platform — see `CLAUDE.md` / `AGENTS.md` for the full project spec.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo mode

This build has no live Firebase project or Razorpay keys configured yet (see `CLAUDE.md` env vars), so it runs
entirely client-side: product catalog, cart, orders, subscriptions, stock and the EDI timeline all live in one
`localStorage` blob per browser (see `src/lib/store.tsx`), and payment is simulated. Log in from `/login` as any
of the demo accounts below — no real password needed, one is just listed for reference.

| Role | Email | Password |
|---|---|---|
| Customer | `customer@dairyfresh.test` | `Demo@1234` |
| Admin | `yash24beit@student.mes.ac.in` | `Demo@1234` |
| Delivery | `delivery@dairyfresh.test` | `Demo@1234` |
| B2B | `b2b@dairyfresh.test` | `Demo@1234` |

To reset the demo data, clear `localStorage` for the site (or open DevTools → Application → Local Storage →
delete `dairyfresh_db_v1`) and refresh.

### Wiring up the real backend

Swap the localStorage store for `firebase-admin` calls, add `NEXT_PUBLIC_FIREBASE_*` / `FIREBASE_ADMIN_*` env vars
per `CLAUDE.md`, and replace `simulateRazorpayCheckout()` in `src/lib/payment.ts` with real Razorpay Checkout +
webhook verification once keys exist.
