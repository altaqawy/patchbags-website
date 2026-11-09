# Patch Bags V4.9 — Fast Hand Tracking + Camera/Bag Visibility Repair

## Screenshot-driven diagnosis

The mobile screenshot showed **21 visible hand landmarks**, confirming that landmark inference was active. The UI reported **Main thread · 191 ms · ~6 fps**, with an apparently black camera area and an invisible handbag. The old FPS indicator was derived from a target interval rather than measured throughput.

This screenshot alone does **not** prove why the camera looked black. Some Android devices protect camera frames in screenshots; model-viewer rendering might also cover the live camera with an opaque GPU layer. This release provides both a performance improvement and a direct visual fallback.

## Implemented

1. **Worker-first MediaPipe:** `hand-assist.js` attempts a same-origin module `tracking-worker.js`, processing transferable `ImageBitmap` frames off the UI thread when `Worker`, `createImageBitmap` and `OffscreenCanvas` exist. Mediapipe is initialized with an OffscreenCanvas for ImageBitmap support.
2. **Automatic fallback:** Unsupported Worker, SDK initialization timeout, or repeated inference errors return to **main-thread CPU**. This mode now downscales inference input instead of processing the complete camera frame.
3. **Adaptive tracking budget:** `tracking-performance.js` offers **Eco**, **Balanced** and **Detail** profiles with adaptive inference intervals based on observed processing time. Overloaded devices skip input frames instead of queueing old frames; results stay tied to recent camera frames.
4. **Speed/precision tradeoff:** Hand coordinates and handbag position use movement-aware smoothing. Stable hands are filtered strongly to reduce jitter; faster movements receive less smoothing to reduce lag. Precise real-world placement still requires accurate body geometry and physical handbag measurements.
5. **Real measured FPS:** The Camera Studio status now presents average completed hand inferences per second, plus actual inference time in milliseconds, labeled `Worker` or `Main thread`.
6. **Visibility fallback:** On entry to Camera Preview, the actual product photo can appear over the camera while GLB loads. On low-power phones, the photo is favored; a **Real product photo / 3D model** toggle allows the customer to switch. If the GLB fails, the photo remains instead of a blank/black 3D view.
7. **No backend/camera uploads:** Tracking and camera compositing are in the phone browser. No recurring API fees, photo recording, face recognition or data transfers to the Patch Bags servers are introduced.

## Practical test steps

- Refresh the Patch Bags website and open **Design Your Bag → Crescent Crossbody → 3D → In Your Hand**.
- With permission granted, inspect the live screen (not only a screenshot). Test the **Real product photo** mode first. The camera should remain visible under the product image.
- Switch to **3D model**; if the model renders black or disappears, return to **Real product photo** and record the result.
- Check that the diagnostic reports `Worker` (if supported) or `Main thread` (fallback) with measured processing FPS.
- Test Eco, Balanced, and Detail on the same phone, in similar lighting. Prefer **Eco/Balanced** if UI lag or battery drain appears.
- Verify that `tracking-lab.html` still displays hand landmarks even if the handbag model does not display.
- On Chrome Android, Safari iOS and desktops, verify camera permission, camera swap, tab hiding, close, manual placement, product photos, hand/body toggles, original color options, checkout/cart and native AR remain functional.

## Real device verification required

Code tests can check worker lifecycle and data processing, but **cannot establish the actual FPS gain** on a particular phone, nor prove whether Android blacked out the camera screenshot for privacy. A physical smartphone test is required before making performance or visual realism guarantees.

Do not call size `true scale` or strap `physically attached`: current dimensions, 2D pose projection and finger occlusion are estimates. For strict physical realism, a rigged handle and measurements of the actual handbag remain required.
