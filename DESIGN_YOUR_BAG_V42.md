# PatCh.BaGs · Design Your Bag Studio V4.2

## What changed

This version **extends** V4.1; it does not replace the original product cards, color selection, search, 3D lanyard, review system, customer auth, payment guard or owner CMS.

### Real product preview
- Each bag can be explored using all available product photos, thumbnails, back/forward buttons and swipe on touch screens.
- Colors that are *actually photographed* select the corresponding existing SKU and images. Requests for other colors do **not** recolor or simulate a product photo.
- Repeated color SKUs are grouped into three distinct starting bag shapes (signature tote, crescent crossbody, round crossbody); selecting a photographed color still picks the exact catalog variant SKU.
- A 3D tab appears **only** when the owner has uploaded a supported HTTPS GLB/GLTF source for that specific item. It uses the existing model-viewer module, never a generated or unrelated model.

### Personalization
- Monogram/name (up to 14 characters) now has three **illustrative** text-style treatments and two **illustrative** positions.
- Color, material, size, lettering, quantity and notes appear in a live design summary. The image remains an unaltered original photograph with an explicitly labeled overlay where appropriate.
- Typography/placement/material/size/color availability and price are not asserted. Final production details require seller confirmation.

### Design management
- Customers can now **edit a saved draft** (including from its shopping bag card), update it in place while keeping its original ID, or cancel editing.
- Save/edit/delete operations persist on the original on-device `patchbags_custom_designs_v1` key. Prior V4.1 drafts automatically receive safe default values for the new optional lettering fields.
- Design updates refresh the separate unpriced request cards, bag badge quantity and the bilingual checkout enquiry copy. Regular paid SKUs remain separate.
- Online payment remains disabled for baskets containing custom requests; custom-only baskets open the prefilled WhatsApp enquiry instead of a payment flow.
- No new database migration, backend server, keys, paid plugin, or tracking service required.

## Manual acceptance checklist

1. Desktop/phone EN: open from `#custom`; verify thumbnails, photo arrow controls and phone swipe show different *real* photos without recoloring them.
2. Choose a signature tote, then photographed ivory/pink variants; the selected SKU reference and gallery should change to that product. For crescent color variants, repeat; verify only three distinct shape thumbnails appear in the style selector.
3. Type a monogram and test Classic, Modern and Signature text styles and lower/center preview placements. The caption must state these are illustrative and not a promise of embroidery.
4. Save two designs; refresh; verify both survive. Click **Edit design** from saved list, update size/material/name/quantity, save, and confirm the record ID/count remain unchanged (not duplicated).
5. Open the bag drawer; click **Edit design** inside a saved custom request. Verify the studio opens with existing selections, the new save updates the same bag card, and ordinary SKU items are unaffected.
6. Edit when at the 12-design cap; updates remain allowed, while adding a 13th new request is blocked.
7. EN → AR → EN with the editor open: preview heading, price disclaimer, design summary, color labels, 3D tabs, edit/undo controls and saved request text respond to the language. Existing choice values remain intact.
8. At 320, 390, 690, 768, 1024 and 1440px, verify gallery never obscures controls, both panes scroll independently on desktop, photo thumbnails and spec summary fit mobile, and no horizontal overflow.
9. Press Tab and Escape; focus remains inside the customization dialog even when launched from the existing product/bag dialogs, and closing restores focus.
10. If there is an owner-uploaded compatible 3D asset, check camera rotation with mouse/touch; if not, verify the interface shows *no empty 3D tab*.
11. Test custom-only bag link to WhatsApp and combined normal+custom bag: payment remains blocked for unapproved customization. No customer data or payment provider settings changed.
12. Test with `prefers-reduced-motion`, disabled localStorage and corrupted previous draft records; original checkout and product pages should continue working.

## Deployment / limitations

V4.2 is a static, additive frontend release and is safe to roll back by restoring the prior versions of `design-your-bag.js`, `design-your-bag.css` and `motion-commerce.js`. It does **not** sync design requests to a customer account or create an approved order. Product owners still need to configure actual manufacturable options, cost, lead time and stock before enabling true custom-order payment.

The notes here are a **manual QA plan**, not a claim of pixel-reviewed browser testing. Source syntax/consistency checks are performed separately prior to merge.
