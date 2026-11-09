# Patch Bags V4.9 — Adaptive Fast Tracking

## Delivered

The **In Your Hand** Camera Studio and standalone `tracking-lab.html` now offer four performance settings:

| Mode | Hand inference goal | Body inference goal | Camera ideal capture | Max tracked hands |
|---|---:|---:|---|---:|
| Auto | Automatically chooses Fast on low-resource phones, otherwise Balanced | Dependent on selected profile | By phone capability | 1 |
| Fast | Roughly every 180 ms | Roughly every 950 ms | 640×480 | 1 |
| Balanced | Roughly every 115 ms | Roughly every 600 ms | 960×540 | 1 |
| Precise | Roughly every 75 ms | Roughly every 350 ms | 1280×720 | 2 |

These are **target inference intervals**, not guaranteed device FPS. Actual processing rates depend on the device and inference duration. Body tracking remains optional; on narrow mobile screens it is disabled by default to prioritize the hand, and selecting Shoulder can enable it. In all modes, capture resolution is an *ideal* camera constraint, and may differ from the actual capture settings chosen by the browser.

## Performance improvements

1. **Off-main-thread inference** — `tracking-worker.js` runs the synchronous MediaPipe Web VIDEO inference outside the UI thread when module workers and transferable `ImageBitmap` are supported. The UI holds at most one outstanding frame, so it drops stale frames rather than backing up. Worker-side frames are closed immediately after inference. There is no recording or streaming to a server.
2. **Device fallback** — When workers, frame transfers or worker model initialization are unavailable, the existing MediaPipe browser tracker runs as a main-thread fallback with throttled budgets. The UI explicitly indicates Worker vs Main thread in the diagnostics.
3. **Adaptive frame budget** — The system observes inference duration using an EWMA. If the device cannot keep up, hand and body inference intervals increase up to 340 / 1400 ms; when the load falls, they gently recover towards the selected profile.
4. **Motion-aware smoothing** — Stationary hands are stabilized strongly, while quicker movement is followed more responsively than a fixed low-pass smoothing factor. The anchor filter resets when tracking is lost, limiting re-acquisition jumps.
5. **Progressive initialization** — The hand model becomes available first. Optional pose loading is allowed to finish later without preventing the basic grip preview.
6. **Reduced visual UI churn** — Performance diagnostics refresh at most about once per second rather than on each tracked frame. The quality controls are fully bilingual.
7. **Explicit quality selection** — Auto, Fast, Balanced, Precise from the Camera Studio. Changing the profile restarts camera and ML inference cleanly, releasing old tracks.
8. **Independent tracking lab** — `tracking-lab.html` allows switching quality and exposes measured inference time and estimated processing frequency.

## Browser / privacy and constraints

- GitHub Pages remains a static site: **no paid API or backend/server needed**.
- MediaPipe and model weights load from HTTPS only after a user opens the camera. Hand tracking uses on-device MediaPipe WASM, with supported Worker offloading and main-thread fallback.
- Video frames never get submitted to Patch Bags: they are temporary transferable `ImageBitmap` objects used inside the browser. Worker frames are released after inference; stopping the preview terminates the worker and camera tracks.
- No measurement of the real-world hand or physical bag size is introduced: realistic scale is **still approximate** pending official dimensions and calibrated depth.
- This release addresses responsiveness and browser load; detection accuracy can still degrade with very fast hands, occlusion, low light, blur, or device resource limits.
- The real phone's speed/temperature/battery **have not been benchmarked** by mock tests.

## QA completed

- JS parse validation for tracking performance utility, Worker, Hand Assist and Camera Preview.
- CSS brace balance, script load-order validation.
- Worker mock verified 21-hand + 33-body inference, on-device frame bitmap cleanup, model closure.
- Browser bridge mock verified Worker start, grip callback, movement update and worker termination.
- Worker-unavailable browser mock verified that the ordinary on-device inference fallback still works and closes the detector.
- Performance utility mock verified auto selection and throttling under simulated slow model durations.
- Camera Preview mock verified camera only starts on user action, profile change updates camera ideal resolution and selected ML quality, old video tracks stop, and closing stops the final track.
- Device acceptance is still needed on Android Chrome and iOS Safari. Profile ideal resolutions and processing rates are not real measurements.

## Device QA checklist

1. On a low-end Samsung or similar Android, open Crescent Crossbody → 3D → In Your Hand. Check Auto initially chooses the Fast profile and green hand landmarks appear.
2. Switch between Fast, Balanced and Precise and compare actual camera responsiveness. Note Worker/Main thread and inference millisecond readout.
3. Wave a hand quickly then hold still. Motion-aware tracking should react without rapid shakes and settle when still.
4. Enable shoulder/body tracking and check it does not cause the hand to freeze while body model downloads.
5. Turn finger occlusion on/off, switch cameras, and close the preview. Make sure the green hand skeleton clears and the camera LED turns off.
6. Open Tracking Lab to verify whether any failure is in hand detection or 3D composition.
7. Block Web Workers, block third-party media model CDN, and deny camera permission. Confirm friendly fallback without freezing the page or silently uploading any data.
8. Compare across dark/bright lighting and different skin tones and camera angles. Real detection accuracy requires physical measurements, footage (with consent) and on-device evaluation.
