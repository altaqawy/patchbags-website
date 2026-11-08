# PatCh.BaGs — independent secure commerce backend (Next.js App Router)

**2026 CMS/customer update:** See [OWNER_CMS_AND_CUSTOMER_SETUP.md](../OWNER_CMS_AND_CUSTOMER_SETUP.md) for owner-managed categories, images/videos/GLB uploads, Cairo dashboard, before/after pricing, sales chart, Supabase Auth and mandatory login before checkout. Apply `db/003_product_cms.sql` to the commerce PostgreSQL database and `db/004_supabase_customer_cart.sql` separately in the Supabase SQL editor before activating these features. The code is not a live deployment.


**Architecture verified:** the existing public GitHub Pages storefront is STATIC HTML/CSS/JS, not Next.js. To preserve every existing design and header choice, this project adds a separate Next.js App Router service in `commerce/`, and a small opt-in static `shop-checkout-bridge.js` in the repository root.

## What this includes

- Arabic RTL protected admin with payments wizard, Test/Live separation, COD, manual bank/InstaPay/wallet, product catalog, orders and CSV reports.
- Owner-only Paymob secret entry; AES-256-GCM encryption at rest with an environment key held off-database; masked secret status. Saved credentials cannot be read back from the API.
- Owner-only login with scrypt-hashed passwords, HTTP-only secure session cookie, database-backed session, CSRF double-submit + same-origin checks, and rate-limited login attempts.
- Server-validated EGP minor-unit cart, customer/order records and immutable order items; disabled until owner sets product prices and shipping.
- Paymob Intention API + Unified Checkout, HMAC-SHA512 transaction webhooks, provider order & total verification, unique callback events, atomic order updates and a fail-closed live activation gate.
- COD orders unpaid/pending confirmation; bank/wallet transfers awaiting **owner** verification. No automatic refunds or financial disbursements.
- Anonymous order status tracking via a random secret per order, not guessable public IDs alone.
- Read-only marketing site stays published exactly as before; post-hero review and photo effects are separate original code, not the paid Framer component implementations.

## NOT active yet

No production checkout is deployed or enabled. **No payments were initiated**, and no real Paymob credentials exist in this repository. Real login and payment require a PostgreSQL database, HTTPS Next.js backend deployment, and the merchant's own Paymob account and keys. GitHub Pages cannot run this service. Public customers cannot place payable orders until pricing, merchant verification and deployment are complete.

### Owner self-service onboarding (do not send secrets through chat)

1. Owner creates the Paymob merchant account at https://egypt.paymob.com/portal/en/register and completes onboarding in their own name.
2. Host the `commerce/` Next.js service on an HTTPS platform supporting Node runtime and PostgreSQL (e.g. Vercel plus a compatible hosted PostgreSQL service).
3. Create PostgreSQL, run `db/001_init.sql`, `db/002_seed_catalog.sql`, then `db/003_product_cms.sql`.
4. Put server-only `DATABASE_URL`, `APP_ORIGIN`, `CORS_ALLOWED_ORIGIN`, `COOKIE_SIGNING_KEY_BASE64`, and `PAYMOB_ENCRYPTION_KEY_BASE64` in the host's secret manager, never GitHub.
5. Generate two **different** random 32-byte keys on the owner/server side. Do not copy them into public JavaScript.
6. Create an owner password hash privately with `npm run owner:hash`, then insert an admin user using a privileged database console:

```sql
INSERT INTO admin_users(email,password_hash,role) VALUES ('OWNER_EMAIL','SCRYPT_HASH','owner');
```

7. Deploy the app, open `https://YOUR-BACKEND/admin`, log in and go to Settings → Payments. Enter test credentials through the wizard, save, use Test Connection to create a non-charging test Intention, and configure the processed callback `https://YOUR-BACKEND/api/paymob/webhook` in Paymob or via the intention notification URL.
8. Set products' verified prices (EGP), stock, shipping, and enable intended payment methods. Test **an actual sandbox card flow** and verify the signed webhook before opening the store.
9. Enter Live credentials only in the secured owner dashboard. A separate Live connection check creates only a non-charging Live Intention with explicit owner confirmation. Live activation remains blocked until live credential and webhook checks pass; final account activation is handled by Paymob, not the website.
10. Once the backend URL exists, edit only the **public** `shop-config.js` field `paymentApiEndpoint` to `https://YOUR-BACKEND` and load `shop-checkout-bridge.js` on the static storefront. It is dormant while the endpoint is blank. Never add a private Paymob key to public scripts.

## Files

- `db/001_init.sql`: schema — admins, sessions, customers, products, orders, attempts, events, encrypted gateway configs, audit and payment methods.
- `db/002_seed_catalog.sql`: current 12 product IDs seeded **inactive** at zero prices for safe owner review.
- `lib/security.mjs`: AES-256-GCM, scrypt, HMAC SHA-512 constant-time check.
- `lib/commerce-core.mjs`: deterministic server-side price and callback decision code.
- `lib/paymob.mjs`: official Egypt Intention API and Unified Checkout link construction.
- `app/api/`: admin login/settings/products/orders/reports, checkout, callbacks, order status, manual reference and manual verification.
- `app/admin/page.tsx`: responsive Arabic RTL dashboard.
- `tests/*.test.mjs`: pure Node tests; never initiate real transactions.

## Local commands

```bash
cd commerce
npm install
cp .env.example .env.local
# Configure local PostgreSQL and secrets; load migrations
npm test
npm run typecheck
npm run dev
```

**Testing status:** `npm test` was executed on the delivered source with 11 passing automated core tests. Full `next build`, DB integration and sandbox Paymob tests have NOT run in this environment because the Next.js and database packages are not installed and no host/DB/merchant connection is available. These must be completed before production activation.

## HMAC and payment safeguards

Transaction Processed Callback is authoritative. We use the Paymob-prescribed ordered 20 fields from `body.obj`, SHA-512 and timing-safe comparison. A browser redirect never updates an order. DB uniqueness on transaction ID+status, row locking and conditional paid transition prevent duplicate paid fulfillment. Amount/currency/provider order are checked against immutable server totals. Secrets are encrypted; HMAC and actual keys never appear in API responses or logs.

**Known pre-go-live limitations:** real user signup/auth is still the existing dormant separate frontend workflow, no shipping zones/tax policy beyond a flat manually configured shipping amount and zero tax, no automatic refunds, no external payment reconciliation job or transactional email service, no hosted browser QA yet. Do not advertise the backend as production-ready until independent code review, vulnerability testing, integration tests, merchant approval and a successful Paymob sandbox cycle are completed.

## Payment retries

An authenticated-by-tracking-token order owner can POST `{ "trackingToken": "..." }` to `/api/orders/{orderId}/retry` to create a new Paymob intention for the same still-unpaid order; limited to five attempts/hour. Later verified callbacks from different attempts cannot double-decrement stock because the paid transition is guarded in one SQL transaction.
