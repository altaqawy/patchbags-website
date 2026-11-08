# PatCh.BaGs · Phase 3 Premium Editorial / Bilingual (2026-11-08)

The original storefront, product data and imagery, color variant logic, guest cart,
Supabase customer sign-in path, checkout enquiry/payment gate, owner CMS and media
viewer have NOT been replaced.

## Additive assets

- \`premium-editorial.css\`: art direction for the established photographic hero,
  desktop editorial lookbook mosaic, accessible hotspots and mobile scroll-snap,
  Arabic Cairo typography, true RTL page composition (hero/image, navigation, grids, story, reviews, footer and commerce overlays), responsive language picker and reduced-motion handling.
- \`premium-editorial.js\`: persisted Arabic/English UI copy, dynamic catalog/dialog localization, Arabic product search and bilingual cart/enquiry text, hero pointer light, scroll-progress line, keyboard-accessible lookbook actions and mobile gallery arrows.
- \`index.html\`: limited additions of semantic markup and scripts/styles. Original
  image paths, hooks, CSS assets and JS modules remain loaded.

## Manual acceptance checklist (desktop/tablet/mobile)

1. Default English: hero image, logo and React Bits lanyard unchanged; “Explore”
   scrolls to the collection and “Meet the maker” scrolls to the story.
2. Switch to Arabic on desktop and mobile. Verify all key page sections, navigation,
   product cards, drawer, search, product modal, and sign-in/checkout forms.
   Refresh: saved language stays. Switch back to EN restores the original left-to-right composition and English copy.
3. At 320, 390, 680, 768 and 1440px, check no horizontal document overflow and
   header controls usable. On phones, gallery scroll snaps and previous/next work.
4. Tap/lookbook hotspot for PB-02, PB-03, PB-01 and PB-10: open the established
   product-detail dialog, including correct color, photos and basket controls.
   Test keyboard Tab/Enter/Escape.
5. Filter catalog; choose color outside and inside modal; add/remove quantities;
   refresh and verify guest selections persist. Authentication/checkout behavior
   is unchanged and must continue to reject unconfigured payment.
6. Open Owner Preview and production owner console separately: unchanged by phase 3.
7. Use slow-network and reduced-motion simulations: lazy images load and no
   mandatory scroll/hover animation blocks content.
8. Search for products using Arabic words (حقائب، جراب، كتب، وردي، عاجي) and English terms. Confirm the same catalog items are discoverable in both languages.
9. In the owner CMS, enter Arabic title, description and badge fields; after applying the 005 migration, confirm the public catalog displays those fields in Arabic and English.

## Security and release notes

- Static storefront copy has curated Arabic wording. Product names, descriptions and badges can also be managed independently in Arabic and English through the owner CMS; apply `commerce/db/005_bilingual_product_copy.sql` after `003_product_cms.sql` before using the new Arabic fields.
- No merchant API secrets, credentials, payment changes or analytics trackers.
- No new JS dependencies; additional assets are first-party static files. The backend migration adds only optional Arabic text columns and preserves existing English content.
- To roll back Phase 3, revert the integrated index change and remove the
  two premium-editorial assets. Do not remove the original checkout files.
