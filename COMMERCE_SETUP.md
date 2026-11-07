# PatCh.BaGs — Production Commerce Setup

The storefront is a static prototype. Follow these requirements before claiming real accounts, cart synchronization, payment or order processing.

## 1. Products and prices

Confirm every SKU, available color, price (EGP), stock and lead time with the maker.
Create a server-side catalog; **do not trust any prices sent from the browser**.
The current frontend intentionally says pricing is confirmed by the studio.

## 2. Customer accounts

The app has ready-to-connect email/password UI and a Supabase Auth REST connector.
Create a Supabase project and configure its authentication, domain URL, email
verification, rate limiting and abuse prevention. In `shop-config.js`, supply:

- `supabaseUrl`: public `https://YOUR-PROJECT.supabase.co`
- `supabasePublishableKey`: the *public* publishable/anon key ONLY

The account UI will enable once both are present. Never add a Supabase service-role
key. Add proper Row Level Security and server-authoritative order access before
writing customer data or storing orders. The prototype keeps session tokens only in
browser memory, not localStorage. Refresh will require another sign-in.

## 3. Hosted checkout (Paymob or another merchant)

Set up a HTTPS server endpoint with merchant credentials held **only on the server**.
It must:

1. Validate the authenticated/guest customer and rate-limit requests.
2. Validate product IDs, quantities, availability, taxes, shipping and final prices.
3. Create the draft order server-side with an immutable price snapshot.
4. Request a hosted payment checkout URL from the provider.
5. Return `{"checkoutUrl":"https://..."}` to the storefront.
6. Process signed provider webhooks and mark paid orders ONLY after verifying
   the provider event and payment status, idempotently.
7. Handle cancelled, failed and expired checkouts and provide a confirmation page.

After the endpoint is complete, place its HTTPS URL in
`shop-config.js` under `paymentApiEndpoint`.
**Never** put Paymob secret keys, integrations passwords or other private credentials
inside the GitHub repository or client-side code.

Until the service is connected, the checkout can only copy an enquiry for
the customer to send via Instagram. This is NOT a placed or paid order.

## 4. Privacy and marketing

Do not publish customer names, portraits, profile links, or chat screenshots without
appropriate permission. The visible customer-feedback section deliberately uses
anonymous short excerpts. If publishing translated excerpts, identify them as such.
Collect and publish a privacy policy before recording customer addresses/orders.

## 5. QA before release

Test keyboard navigation, phones/tablets/desktop, browser refresh, quantity limits,
checkout form validation, failure states, confirmation-email behavior, and real
payment webhooks in provider sandbox.
