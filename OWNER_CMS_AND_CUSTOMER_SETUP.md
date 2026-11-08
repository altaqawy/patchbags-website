# PatCh.BaGs — Owner CMS + authenticated customer shopping (Nov 2026)

## Where the features live

- Public storefront (same original header, hero, React Bits Lanyard): https://altaqawy.github.io/patchbags-website/
- Owner **visual demo**, not secure or connected to orders: https://altaqawy.github.io/patchbags-website/owner-preview.html
- Real owner console: \`commerce/app/admin/page.tsx\` → \`https://YOUR-COMMERCE-HOST/admin\` after deployment
- Customer sign-in: existing storefront account dialog, powered by **Supabase Auth once configured**
- Customer cart: \`patchbags_cart_v2\` guest local cache → \`customer_cart_items\` Supabase RLS after login
- Checkout: \`commerce/app/api/checkout/route.ts\`, now **rejects anonymous requests**. Real payment stays disabled until deployment and merchant approval.

## Framer-inspired design choices

Uses a clean 4-KPI overview, collection cards, filtered inventory tables, a media gallery, sale/compare-at prices and day-range sales charts, inspired by Framer's ecommerce/product variants and dashboard presentation patterns. This is original implementation, not copied proprietary templates.

**Typography:** Cairo for Arabic controls, Playfair Display for English editorial branding, with Manrope for metadata. Public storefront typography remains unchanged.

## Owner: enable persistent data and media uploads

1. Deploy \`commerce/\` as a private/HTTPS Node-compatible Next.js service; provision PostgreSQL. Do not deploy the admin credentials to GitHub Pages.
2. Apply \`commerce/db/001_init.sql\`, then \`002_seed_catalog.sql\`, then **\`003_product_cms.sql\`** to the PostgreSQL backend database. Existing databases need only the missing migrations; do not rerun an ADD CONSTRAINT migration.
3. Register the owner account via the documented server-side password hash bootstrap. Keep their private credentials off GitHub and out of informal messages.
4. Set the original \`DATABASE_URL\`, \`APP_ORIGIN\`, \`CORS_ALLOWED_ORIGIN\`, \`COOKIE_SIGNING_KEY_BASE64\`, and \`PAYMOB_ENCRYPTION_KEY_BASE64\` server-only secret values.
5. To upload products directly from the owner dashboard, create an S3-compatible R2/S3 bucket. Configure:
   - \`MEDIA_S3_ENDPOINT\`, \`MEDIA_S3_REGION\`, \`MEDIA_S3_BUCKET\`
   - \`MEDIA_S3_ACCESS_KEY_ID\`, \`MEDIA_S3_SECRET_ACCESS_KEY\` (server-only)
   - \`MEDIA_PUBLIC_BASE_URL\` (public HTTPS CDN URL serving product objects)
   - Bucket CORS: allow PUT and GET from **the commerce admin origin**, and allow reading CDN assets from the public storefront origin.
   - If the public CDN is a separate origin, configure \`Access-Control-Allow-Origin\` correctly for images, video and GLB viewer. Allow Content-Type on upload requests.
6. The signed upload endpoint \`POST /api/admin/media\` checks owner session + CSRF, MIME, filename and declared file size, generates a private 5-minute PUT URL, and returns the final public asset URL. Owner's browser uploads bytes directly to storage. The product editor then stores the URL in the protected PostgreSQL catalog.
7. Supported files: JPEG/PNG/WebP (<=10MB); MP4/WebM (<=60MB); GLB (<=40MB), glTF JSON (<=5MB). Prefer **GLB** with embedded textures: loose glTF references require related resources. The media validator checks metadata and URLs; enforce content scanning and maximum object size through bucket/service policy before operating an open store.
8. Owner can add/edit collections, assign them to products, enter English and Arabic product names and descriptions, price in EGP and a higher compare-at price, stock and featured badge. **Discounts are never calculated from browser-submitted totals for charging**.
9. The public catalog endpoint \`/api/catalog\` returns **active, stocked, correctly priced** products, the collection list and media fields. Set the **public** \`paymentApiEndpoint\` in \`shop-config.js\` to the HTTPS backend origin, only after deploying the backend. This enables dynamic product updates without replacing existing storefront layout.

## Customer: enable real login and saved cart

1. Owner creates a Supabase project and enables **email/password Auth with email confirmation**.
2. In the **Supabase SQL editor**, run \`commerce/db/004_supabase_customer_cart.sql\`. Do NOT run this particular script against the commerce PostgreSQL database; it references Supabase \`auth.users\` and \`auth.uid()\`.
3. Run a two-user RLS test: User A can select/update only User A's \`customer_cart_items\`; User B cannot access or modify User A's rows.
4. Configure Supabase Auth URL settings to allow the exact storefront URL and redirect \`https://altaqawy.github.io/patchbags-website/\`.
5. In **public** \`shop-config.js\` enter only \`supabaseUrl\` and the Supabase **publishable (or anon) key**. Never put service-role secret, database password or Paymob secrets here. The supplied Supabase JS library persists/refreshes secure sessions.
6. On the **commerce backend**, configure the matching server-only \`SUPABASE_URL\` and \`SUPABASE_PUBLISHABLE_KEY\`. The backend verifies each customer token against Supabase Auth; an email typed into Checkout is never accepted as proof of identity.
7. Test guest cart → Sign in → sync to customer's RLS cart, chosen color variant SKU + quantity, refresh page, sign out and another account on the same device. Guest and signed-in carts must not leak between accounts.
8. The Checkout button now redirects unsigned users to the sign-in/create-account dialog. The bag stays saved locally even when authentication is not configured, but **real customer registration and orders are blocked** until authentication and the commerce server are deployed.

## Live Paymob

Registration belongs to the store owner: https://egypt.paymob.com/portal/en/register

Use the authenticated protected dashboard Settings → Payments. Confirm Test vs Live credentials, webhook signing, verified merchant activation, prices, delivery cost and actual sandbox test payments before enabling live. **No real Paymob charge, account activation or live payment acceptance has been performed by these code changes.**

## Verify after deployment

- Check mobile and desktop CSS/RTL, 3D preview, products, collection filter, price-before/after and cart variants.
- Run \`cd commerce && npm install && npm test && npm run typecheck && npm run build\` against a clean environment.
- Test customer login, refresh, expired token, forged token, wrong email, cross-user cart access and order authorization.
- Test owner-only categories/products/media routes for 401/403 and CSRF failures.
- Test actual S3/R2 uploads, CDN public URL CORS, invalid formats and extremely large files (reject).
- Verify no test credentials are included in browser bundles.
- Test Paymob Test Mode HMAC/amount/currency, duplicate webhook, failed payment and confirmed transaction before Live.

## Current status

- **Implemented in repository:** secure owner API code, CMS schemas, local owner visual demo, signed media upload path, real analytics component based on confirmed payment records, customer authentication gate and RLS cart integration.
- **Not verified as running in production:** deployed commerce host, Postgres and migration application, Supabase project/key + RLS installation, actual media bucket, Paymob account approval and integration tests.
- **No fake revenue figures:** the preview displays placeholders. Real analytics uses server-confirmed paid orders only.
