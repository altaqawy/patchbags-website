# PatCh.BaGs — V4.5 / V4.6 · Color, Lighting & In-Hand Camera Studio

## Delivered

### 1. Crescent reference GLB material/lighting adjustments

The genuine user-provided `assets/models/crescent-reference-ar.glb` was inspected. It has five glTF materials: `root.1`, `root.2` and `root.3` are the main woven body/flap/strap; `root.0` and `root.4` are trims.

`bag-look-engine.js` applies independent **illustrative preview shades** to woven parts only, leaving the original metal/trim materials untouched:
- PB-04 / Warm taupe: `#9d8a7b`
- PB-05 / Natural ivory: `#fff8ef`
- PB-06 / Deep ruby: `#ab273c`

The source GLB is not altered. A neutral model-viewer environment provides 3 editorial lighting choices:
- Studio: 0.98 exposure, soft shadow 0.67
- Daylight: 1.10 exposure, soft shadow 0.46
- Soft: 0.86 exposure, soft shadow 0.31

These factors multiply the model's genuine texture; they are **not spectrally measured color samples**, don't alter the real product photography and must not be advertised as a precise color match. The studio 3D model and product-detail modal get the original SKU's reference shade; Camera Preview lets users try all three colors for illustration. Owner-supplied non-reference models are never force-recolored.

### 2. In Hand Camera Preview

Inside both **Design Your Bag → 3D** and the regular 3D product modal, there is a new **شوفيها في إيدك / In your hand** launch action.

The customer can switch between **In your space** and **In your hand**. The in-hand mode provides three presets:
- Held in hand
- Near shoulder
- In front of body

The bag can still be moved manually with the drag handle or arrow buttons, rotated with touch/drag, and resized with a slider. The reference is overlaid over the device's live video, not anchored in real world space. Lighting and shade controls are bilingual and independent of paid cart/price records.

### 3. Experimental Hand Assist (opt-in)

In hand mode, clicking **Hand Assist / تتبع الإيد** can dynamically load Google's **MediaPipe Hand Landmarker** `@mediapipe/tasks-vision@1.2.2`, running **on-device**. The detector estimates the palm position at about 6–8 frames/second, then moves/scales the overlay with smoothing.

- The SDK/model is **not loaded on page visit** or on camera permission prompt; only after explicitly choosing Hand Assist.
- No hand images, video or tracking results are sent to Patch Bags.
- Normal camera permission is separately requested when the visitor opens Camera Preview, over HTTPS.
- If SDK download, model inference, CPU performance or hand visibility fails, the manual controls remain available.
- Manual dragging or flipping the camera stops Hand Assist. Closing or hiding the page stops detection and all camera tracks.
- Hand Assist is **2D image-based alignment**, not 6DoF tracking, true handle attachment, hand occlusion, exact perspective correction, or physical scale measurement.

### 4. Release boundaries

No changes to any customer accounts, checkout API, inventory, orders, products, photographs or payment configuration. The original GLB remains intact. Existing native AR buttons continue to work on compatible Android/iPhone devices.

## Manual QA on actual phones (required before production signoff)

1. Open PB-04, PB-05 and PB-06 in Design Your Bag. Inspect each 3D shade under Studio, Daylight and Soft light. Check materials root.0/root.4 remain metallic instead of being recolored.
2. Compare the 3D color **visually** with the photographed product. Mark any inaccurate shades for correction with owner-approved references. Real color samples were unavailable.
3. Open **In your hand**, approve camera permission, and check the overlay/handle movement, size slider, 3 placements and front/rear camera.
4. Enable Hand Assist on compatible Android Chrome (test both CPU and GPU constraints). Make the entire hand visible; the bag should follow its approximate palm location after initialization.
5. Cover or remove hand: manual controls must remain usable. Stop assist and try manual drag.
6. Deny camera access / block CDN / use weak phone: fallback to manual 3D, with clear messages and no crash.
7. Close, press Escape, switch tabs, flip camera, navigate away: both camera streams and hand-tracking loops must stop.
8. On iPhone Safari, verify model-viewer behavior, camera permissions and fallback. Auto alignment depends on WASM and may not work on every device.
9. Test AR native alongside In Hand: separate actions, both EN/AR, no unintended file uploads, no auto camera access on site load.
10. Check responsive layout at 320px, 390px, 768px and landscape 667×375. Small phone toolbar must scroll without hiding exit controls.
11. Verify existing product variants, signed-in cart, saved custom designs, checkout/payment guards, owner-uploaded 3D models and WhatsApp enquiries are unaffected.

Source-code parsing, CSS balance, reference-model material inspection and stubbed camera/appearance tests may pass without proving real-camera performance. This release requires real-device acceptance testing for reliable accuracy.
