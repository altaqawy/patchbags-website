# PatCh.BaGs · 3D reference model

## Crescent Crossbody — 3D-only experience

The real user-provided optimized handbag model is stored at:

`assets/models/crescent-reference-ar.glb`

**The existing filename is preserved to avoid breaking references. The website no longer activates augmented reality, device cameras, or body/hand tracking.** It only loads the model into the interactive on-page 3D viewer.

The shared GLB is an **illustrative reference** for PB-04 (Taupe), PB-05 (Ivory), and PB-06 (Ruby). It is not guaranteed to match every photographed color, stitch pattern, strap, or product dimension. Its apparent width in the source geometry should not be presented as a verified real handbag measurement.

### Customer experience

- Open a product or the **Design Your Bag** studio and select **3D model**.
- Rotate by dragging, zoom with a pinch or scroll wheel, and inspect the details.
- In the design studio, switch between **Studio / Daylight / Soft** lighting on the reference model.
- No camera access is requested; no AR buttons, phone movement tracking, or real-world placement is offered.
- The product's real photographs are always available as a separate view.
- Owner-uploaded product-specific GLB/GLTF models take priority over this shared reference.

### Deployment

The supplied GLB has already been uploaded to this directory. If it is replaced, keep the same URL or update the 3D registry script and verify that the static-host HEAD request succeeds. The original product photos and customer enquiries continue independently if the model is unavailable.

This release uses `patchbags-3d-viewer.js` and `patchbags-3d-viewer.css`. All previous AR/camera runtime scripts were removed from the storefront.
