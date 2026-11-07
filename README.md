# PatCh.BaGs — Handmade Studio

English-language, photo-first, Framer-inspired storefront for PatCh.BaGs in Alexandria, Egypt.

## What is live

- Original header, logo, hero, typography and animated marquee preserved.
- 12 photographed products with multiple-angle product galleries and category filters.
- Lightweight post-hero scroll/text reveals and product/image interactions.
- Editorial customer-feedback slider using anonymized, lightly shortened quotations.
- Functional **guest shopping bag** with quantities saved on the visitor's device.
- Checkout request form that copies an order enquiry for the customer to send to the studio.
- Instagram links and iconography.
- Responsive layout, keyboard-accessible dialogs and reduced-motion support.

## Important: not yet connected

**Account sign-in, account registration, pricing and online card checkout are NOT live.**
There is no backend database, no shipping calculation and no merchant payment integration yet.
Account forms are deliberately disabled until the owner configures an authentication service.
No card details are collected. No order is submitted just by using the form.

## Secure service integration

See [COMMERCE_SETUP.md](COMMERCE_SETUP.md).

## Run

Open `index.html` locally or use GitHub Pages. No build tools are needed.
All styles and scripts are static files. Never put payment API secrets or Supabase
service-role credentials in any publicly deployed static JS file.
