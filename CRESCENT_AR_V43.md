# PatCh.BaGs — Crescent 3D + Augmented Reality · V4.3

## Implementation in the storefront

- Uses the **real bag model provided by the user**, optimized to about **3.2 MB**.
- Reference model path: `assets/models/crescent-reference-ar.glb`.
- Linked to **PB-04 Taupe / PB-05 Ivory / PB-06 Ruby** as a *shape reference* only, not a guarantee of matching texture or color.
- The Design Your Bag Studio shows **Photos | 3D**. On AR-compatible devices the 3D view contains a localized **View in your space / شوفيها في مكانك** button.
- Product detail modal also exposes 3D and AR when the GLB exists.
- Uses `@google/model-viewer@4.0.0` already loaded by the existing site; Scene Viewer, WebXR and iOS Quick Look are configured.
- `model-viewer` can generate USDZ on the fly for supported iOS Quick Look, so shipping a separate USDZ is not mandatory for a first release; it can improve compatibility when the generated USDZ is inadequate.
- If AR is unsupported, the user can still rotate/zoom the 3D model; if the GLB is missing, existing product photography is displayed with no broken 3D tab.
- The model is scaled to **approximately 41.7 × 39.1 × 19.1 cm** (width × height × depth). No physical bag measurements were supplied; do **not** advertise these as verified dimensions.
- Existing basket, quantities, login, owner-managed stock and payment configuration are unchanged. No unpriced customization request can be paid online.

## Final asset upload

The repository's automated Actions import was attempted twice but failed before any job steps could begin. To finish enabling this capability on the public GitHub Pages site:

1. Download the optimized file `crescent-reference-ar.glb` supplied with the ChatGPT conversation.
2. Open the repository on GitHub: `altaqawy/patchbags-website`.
3. Choose **Add file → Upload files**, put the GLB into `assets/models/` on **main**, keeping the exact name `crescent-reference-ar.glb`.
4. Commit the binary file. GitHub Pages will publish it automatically.
5. Verify `https://altaqawy.github.io/patchbags-website/assets/models/crescent-reference-ar.glb` returns a GLB download (not 404/HTML).
6. Open `https://altaqawy.github.io/patchbags-website/#custom` and select a Crescent Crossbody; choose the **3D** tab.
7. On an AR-supported mobile phone, tap the AR button and grant camera permissions when the platform requests them.

### Live test checklist

- Desktop EN/AR: no AR button on unsupported computers; GLB rotates smoothly with mouse.
- Android Chrome + supported Google Play Services for AR: Scene Viewer launches and places the scaled reference on a horizontal surface; unsupported devices fall back to 3D.
- iOS Safari supported Quick Look device: check the automatic GLB → USDZ conversion and camera permission.
- Switch between PB-04, PB-05 and PB-06: photos retain their own photographed colors; only the common *shape reference* is shared.
- Confirm a product-specific 3D model uploaded through the owner dashboard takes priority over the common reference.
- Disconnect internet while viewing: errors are friendly, standard product images and basket are still usable.
- AR device screenshot visually checked before claiming final product size, color matching or phone compatibility.

## Security and cost

The GLB is a public asset on the same origin, without tracking, privileged permissions, customer data or backend secrets. It loads only when a user chooses to view the model. The feature does not require a paid API. Real-world material/color customization can be added later after product-specific 3D files and owner-approved manufacturing options exist.

The file importer is included under `tools/import_crescent_ar_asset.py`, with a locked original-source SHA-256 and explicit approximate-scale metadata.
