# Patch Bags V5.0 — Camera visibility + real bag failsafe

## Problem seen in the November 9 Android screenshot

- The green 21-point hand skeleton and status confirm MediaPipe **is detecting hands**.
- Pose status reported 33 body points.
- Main-thread inference measured approximately **107 ms** and **5.1 completed hand detections per second**, which is inadequate for smooth hand-held placement.
- The screenshot showed a **black camera stage and no visible 3D handbag** despite the user selecting `3D model`.

A black screenshot does not establish whether the live camera was also black. Certain Android capture surfaces can be restricted in screenshots; opaque WebGL overlays and unloaded models can also obscure the video.

## V5.0 changes

**Camera drawing compatibility path:** `camera-compositor.js` draws a *low-resolution, lower-rate* view of the already authorized camera into a regular, visible canvas. This keeps the browser camera permission and MediaPipe input unchanged. On Android we prefer the Canvas compatibility path. The visitor can switch instantly between **Normal** (native video, lowest overhead) and **Compatibility** (camera canvas) without reopening the camera. If Canvas drawing fails, it falls back to normal video. No screenshots, recording, image uploads, analytics or biometric logs are added.

**No empty 3D view during loading:** Camera Studio keeps the actual photographed product image visible when the GLB has not emitted a load event. When the 3D viewer finishes loading, that photo may be hidden; a stalled 3D load returns to the real product image after 12 seconds rather than presenting a blank region. The customer can manually switch between **Real product photo** and **3D model**.

**Measured performance and Worker explanation:** The existing tracking engine still attempts background Worker inference where supported. When the device cannot initialize a Worker, the exact *sanitized* fallback reason is displayed. A running main-thread tracker is not presented as an error. In **Auto** quality, if heavy body tracking is enabled and hand inference exceeds 90 ms in two consecutive reports, the site pauses the body tracker and restarts hand-only tracking to prioritize a smoother In-Hand experience. Body tracking remains available by manually re-enabling it.

**No changes to commerce:** Accounts, cart, owner management, AR native launch, physical model geometry, original product photographs, colors, prices and checkout are untouched.

## Real Android test checklist

1. Open the website with a new browser tab, go to **Design Your Bag → Crescent → 3D → In Your Hand**, and grant permission.
2. Watch the *live phone screen*, not only an Android screenshot. The camera background should now show through the Compatibility canvas.
3. In the controls, toggle **Camera display → Normal / Compatibility**. Compare which shows the actual room while tracking points remain visible.
4. First choose **Real product photo**, which must show the photographed bag over live camera. Then select **3D model**. If the GLB fails to load it should show the photo instead.
5. In Auto with body tracking enabled, check that the app disables body tracking if the phone's main-thread inference is consistently above 90 ms. Hand tracking and manual controls should continue.
6. Compare **Fast / Balanced**, and note **Worker / Main thread**, measured FPS, and any Worker fallback reason.
7. Close or background the tab and verify the camera indicator turns off. Camera and model processing must not continue after closing.
8. Test rear/front camera, Arabic, portrait/landscape, iPhone, older Android, camera denial, WebGL failure and photo load failures.

## Limits

This update is an engineering fix for the **camera/video rendering path and fallback behavior**. It is **not proof** that all Android phones will display the GLB; some GPU, driver or media-capture restrictions need device-specific testing.

The photograph is an ordinary 2D overlay, not a cutout with perfect finger occlusion. The GLB is a reference model; its ~41.7-cm geometric width must not be advertised as a verified physical product measurement. No deformable strap rig or truly physical scale is implemented by V5.0.

Models and camera processing are on-device. Google MediaPipe SDK/CDN may have independent usage/diagnostic privacy notices.
