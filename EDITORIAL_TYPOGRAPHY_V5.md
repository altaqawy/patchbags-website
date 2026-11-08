# PatCh.BaGs — Editorial Typography V5

## Design direction

- English display: **Cormorant Garamond** for elegant, fashion-editorial headlines and selected product titles.
- English interface: **Manrope** for clean navigation, buttons, filters, microcopy and long text.
- Arabic display: **Alexandria** for branded, contemporary Arabic headlines and product titles.
- Arabic body/UI: **IBM Plex Sans Arabic** for comfortable reading in navigation, filters, descriptions, forms, cart and footer.
- Arabic highlighted words and testimonials: **El Messiri** for a restrained brush-like handmade accent.
- The original brand logo/wordmark and approved product photography are not redrawn or mirrored.

## Implementation

- The added stylesheet `editorial-type-v5.css` is loaded **last** in `index.html` after `premium-editorial.css`, so the previous competing media rules cannot silently win.
- Font loading uses Google Fonts with `display=swap`. Cairo is no longer requested as a frontend webfont.
- Reusable desktop/tablet/phone type sizes use `clamp()`, with separate Arabic vs. English metrics.
- At Arabic RTL, desktop photographic hero content is right-aligned and the unchanged bag portrait is positioned to the left, including when `html.patch-photo-ready` is present.
- Section header styles cover categories, collection, textures, lookbook, customer feedback, personalization, inspiration, story and footer.
- Mobile controls shorten the visual bag button label without changing its DOM text or click handlers.

## Manual QA matrix

| Width | English | Arabic |
|---|---|---|
| 320px / 360px | Nav/logo/cart fit; hero headline readable | Header controls fit; longer Arabic phrases wrap naturally |
| 390px | Product names, filters, labels do not collide | Arabic title sizes balanced in two-column product grid |
| 680px | Lookbook horizontal snaps and floating controls work | Lookbook caption and testimonial text remain readable |
| 768px / 900px | Heading + intro grids collapse cleanly | Header switches to mobile nav; no text crosses image |
| 1024px / 1199px | Hero clear from bag portrait | Hero image sits left and copy sits right; not mirrored |
| 1440px / 1920px | Large editorial display maintains legible measure | Arabic body and headlines align on right; footer columns balanced |

Also check language switch EN → AR → EN without reload, reduced-motion behavior, Google Font fallback if network is unavailable, product color variants, search, drawer, footer account buttons, checkout dialog, keyboard navigation and saved cart.

## Notes

These are frontend visual changes only. No changes to owner-managed prices, server authentication, inventory, checkout or Paymob configuration. If a visual rollback is necessary, remove the `editorial-type-v5.css` link and its additional Google Fonts link, leaving the previously released storefront untouched.
