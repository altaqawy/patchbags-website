# PatCh.BaGs — Screenshot corrections (2026-11-08)

## Issues identified from user-provided screenshots

1. **Hero (Arabic RTL):** The original interactive React Bits lanyard sat on top of the heading, supporting copy and action buttons, because its fixed anchor and oversized hanging card were on the right-side Arabic text column.
2. **3D photo carousel:** The automatically generated headline remained "In every detail." in Arabic, even while captions appeared translated. The section was injected after the main HTML and did not own locale updates.
3. **Social / Instagram:** The generic `fill: currentColor` on all SVG icons overrode Instagram's outlined glyph, rendering a filled square.

## Fixes implemented

- `reactbits/lanyard-mount.js`: Use smaller responsive hanging card, a shorter darker/narrower strap, separate Arabic/English safe-side anchors, and rerender the same React component when the language or breakpoint changes.
- `reactbits/Lanyard.js`: Add dedicated edge anchors for desktop/tablet/mobile; snap to the new resting position on a locale switch so the lanyard does **not** sweep through the headline.
- `three-d-motion.js`: Add independent AR/EN heading, eyebrow, image titles, a11y label and direction-aware coverflow positions; preserve images without mirroring.
- `editorial-type-v5.css`: Give the coverflow a clear Arabic heading and readable Arabic captions, with responsive typography.
- `premium-editorial.js`: Publish the public translation function **before** the initial language event so dynamically generated captions can translate on first load with saved Arabic language.
- `social-icons.css`: Override generic icon fill for Instagram only; preserve filled TikTok and Facebook icons.

## Regression tests

- On 1440px desktop, load in English: the badge rests in the **right photographic margin** and does not cover heading/CTAs; the original photo, buttons and physics still work.
- Switch Arabic: badge relocates immediately to the **left photo margin** without travelling across the words. The text remains on the right. Switch back and repeat.
- At 390px and 768px, verify badge stays smaller and above the hero text without clipped edges. Rotate the device while it is visible.
- Scroll to the interactive 3D photo gallery; its Arabic title should read **"تفاصيل بتحكي حكاية."** and its eyebrow **"من مجموعة باتش باجز"**. EN restores "In every detail." and the original eyebrow.
- Gallery captions change with language; English↔Arabic changes do not restart the gallery or flip photography.
- In social gallery and footer, the Instagram icon is an **outlined camera** with the small round shutter dot, not a filled square. Facebook and TikTok icons remain unchanged.
- Verify hero collection links, search, product variants, basket, sign-in dialogs, footer links and WhatsApp still work.
- Reduced-motion users do not receive forced entrance animations.

## Automated source checks

JavaScript parsing and CSS brace-balance checks passed for all modified assets; validated the presence of language event handlers, safe edge anchors and anchor snap behavior.

No production browser pixel-diff or end-to-end payment test has been executed as part of this change. No catalog, payment, customer-data or admin-business logic has been modified.
