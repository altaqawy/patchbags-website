# PatCh.BaGs · V4.1 Design Your Bag

## Delivered

The original public storefront remains intact. A new **Design Your Bag** experience is available by clicking the previous "Ask about custom pieces" CTA, from the normal catalog bag cards, or from the bag product-detail modal.

The studio includes:
- A true photograph of the selected bag (existing PB-01 to PB-07 items, including photographed color variants).
- Dynamic editorial preview of the requested initial/name. This is an *illustration only* and must not be presented as a production preview or a realistic embroidery rendering.
- Material choice: as photographed; cotton-rope request; fabric request.
- Size choice: as photographed; compact request; larger/roomier request.
- Photographed color variants linked to existing product photo SKUs plus an alternative-color request text field. Custom colors never recolor an actual bag photograph.
- Optional monogram or name, up to 14 characters; optional notes up to 240 characters.
- Quantity range 1–5.
- Explicit warnings in AR/EN that materials, sizes, lettering, prices, and availability require seller confirmation.
- Multiple saved designs, up to 12, stored on the visitor's device in `patchbags_custom_designs_v1`.
- Remove, copy, and direct WhatsApp enquiry actions.
- Bilingual interface and right-to-left layout; switching language also localizes saved requests.
- Responsive layout for desktop/tablet/phone, accessible modal with focus handling/Escape and reduced-motion support.

## Cart and checkout integration

`motion-commerce.js` now displays separate request cards in the basket, includes saved designs in the bag badge count and the copied enquiry text, and offers a WhatsApp enquiry action for custom-only baskets. These requests are **not** server-priced chargeable SKUs and are **not** silently inserted into Supabase's existing `customer_cart_items` table.

If a basket contains custom designs, online payment is disabled even when an online payment endpoint is connected. This avoids charging for unapproved customization requests. Existing normal-product checkout still uses the original authentication requirements; no backend payment logic has been modified. Guest custom enquiries can be sent through WhatsApp without needing to sign in.

## Manual QA checklist

1. Desktop: Open Design Your Bag from `#custom`, product card, and bag detail modal. Confirm the studio opens and closes with Escape, backdrop, and close button.
2. Choose a photographed color PB-01/02/03 and PB-04/05/06; verify reference photo changes to the **actual** matching product. PB-07 retains a single photographed base color.
3. Select alternative color, enter a desired shade, change material, size, quantity and add name/initial. Confirm the photo stays original and the inscription is marked illustrative.
4. Save a design. Reload page. Check the draft remains in the designer and the bag badge count and separate cart card are correct. Save two different designs and remove one.
5. From custom-only cart, click "Discuss design requests": it should open a prefilled WhatsApp enquiry in a new tab without a payment or login form.
6. Combine an ordinary product and a customized design: verify quantities for normal SKUs are preserved, saved designs are separate, and the online payment option is disabled if checkout is available.
7. Test EN → AR → EN while the design modal is open. Verify headings, options, preview caption and saved records are localized; avoid broken RTL alignment.
8. Test at 320/390/768/1440px, check modal scrolling, touch controls, focus trapping and contrast.
9. Confirm legacy product color filters, original cart quantities, search, user auth, hero lanyard, 3D coverflow, reviews and footer are unaffected.
10. Test reduced-motion preference and blocked localStorage: the design can still be copied if saving is unavailable.

## Deployment and limitations

The feature is client-only and imposes no new third-party paid services. Drafts are stored locally, are **not synchronized across devices or accounts**, and have no reserved stock or confirmed manufacturing date. A later owner workflow can add real per-option availability, prices, validation, order records and cloud persistence.

**No real online payment occurs for customized bag requests in this release.**
