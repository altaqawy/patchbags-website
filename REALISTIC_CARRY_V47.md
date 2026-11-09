# Patch Bags — V4.7 Realistic Carry Engine (Grip Anchor Pro)

## User-visible changes

**Design Your Bag → Crescent Crossbody PB-04/PB-05/PB-06 → 3D → In Your Hand → Hand Assist** activates the improved hand-fit preview.

- MediaPipe **21 hand landmarks** find the index finger, thumb, knuckles and palm. A detected thumb/index pinch is used as an approximate handle attachment point. Open hands fall back to the thumb/index web.
- The model is moved so its **projected top strap** (nominal vertical position 0.15 of viewer frame) aligns with the detected grip point. Low-pass filters smooth placement and a gentle bounded 2D tilt responds to hand movement.
- **Show fingers in front of strap** is enabled by default while Hand Assist runs. The on-device GPU/CPU canvas draws only selected regions of the live **thumb, index and middle fingers** over the handbag viewer to provide a limited grip-occlusion effect. The mask is feathered near the grip, cropped to the camera's actual aspect ratio, and mirrors the selfie view if necessary.
- A **Your palm width (cm)** calibration slider (6.5–11 cm, default 8.5) adjusts the size estimate. Future owner-approved catalog measurements can populate `dimensionsCm.width`, `measurements.widthCm`, or `dimensions.widthCm`. The existing default reference is **41.7 cm derived from the approximate imported GLB**, not a verified physical bag measurement.
- The customer can turn off finger foreground compositing without losing hand tracking. On weaker phones, hand tracking and the camera can both be disabled and the manual 3D view still works.
- RTL Arabic and English labels, portrait and landscape layouts, shop/cart/customer flows and native AR are unchanged.

## Important limits of this release

**This is not a physical strap rig, actual scale measurement, or complete finger segmentation.**

The GLB currently contains mesh groups, not a skinned, collision-aware or deformable handle. The top-handle position is a **projected 2D approximation**. The foreground mask is reconstructed from hand landmarks and may show artifacts, incorrect depth ordering, or imperfect overlap. The available phone camera cannot infer precise 6DoF depth or reliable centimeter scale merely from a hand width; the preview requires actual handbag dimensions and scene calibration for more faithful sizing.

To achieve a truly deforming handle in a later release, commission or model a verified GLB with a separate articulated/rigged strap, correct material UVs, grip anchor transforms, and approved physical measurements. Consider richer hand segmentation or a depth API on supported devices for better occlusion. Any enhanced physical AR remains subject to device support.

## Privacy and accessibility

- No permission request on initial page visit; video is opened only after a user's Camera Preview action, and hand inference only when they explicitly select Hand Assist.
- The camera/hand landmark processing and foreground canvas rendering operate **on the user's device**, without uploading photos, frames or extracted hand points to the Patch Bags store.
- No recording, screenshot capture or persistent biometric data is implemented.
- MediaPipe's third-party package may gather SDK performance/usage diagnostics as specified in its own privacy notices; inspect this separately before legal privacy signoff.
- Only the frontmost visible finger mask is drawn. It does not become a permanent image or saved photo.
- Camera and detector stop on close, camera switch, page backgrounding, failed detection, or user cancellation. Manual preview is available as fallback.
- The release includes a localized visible toggle for finger overlap, keyboard-accessible slider controls and focus retention.

## Validation completed

1. JS parse checks for hand-assist, occlusion and camera-preview: passed.
2. CSS braces balanced.
3. Mocked Hand Landmarker returned 21 landmarks: grip detected, cropped/mirrored coordinates valid, filtered size bounded, detector closed on stop.
4. Mocked 2D canvas tested real finger-mask composite drawing, selfie mirroring, disabling, clearing and cleanup: passed.
5. Native AR and model-viewer scripts preserved, with safe versioned cache invalidation.

## Real-device QA required

- [ ] On a mid-range Android Chrome phone, start in-hand view and enable Hand Assist. Pinch index finger toward thumb and align handle grip with the onscreen strap.
- [ ] Open the hand and ensure the guidance changes and no violent jumps occur; confirm slight tilt and reasonable bag position.
- [ ] Enable/disable finger foreground. Check no ghost fingers remain when tracking stops or the camera is flipped.
- [ ] Check on darker/lighter skin, gloves, different light levels, busy backgrounds, multiple hands and the mirrored front camera.
- [ ] Measure the buyer's palm width with a ruler; adjust the calibration, comparing the **approximate** size to the real bag dimensions when they become available.
- [ ] Test denied camera, offline CDN, no WebGL and low-memory devices: UI must fall back to a stable manual placement mode.
- [ ] Switch AR/3D/Hand mode and switch EN/AR; preserve existing catalog, draft saving, product photos, original colors, shop actions and WhatsApp requests.

No extra account, server payment integration or remote media storage was introduced by V4.7.
