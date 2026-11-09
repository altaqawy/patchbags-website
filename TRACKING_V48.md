# Patch Bags V4.8 — Hand + Body Tracking Fix & Python Toolkit

## Background

The previous In-Hand camera preview made the user press a separate **Hand Assist** action, and a failed MediaPipe/WASM/model download produced only generic status text. There was no visible hand skeleton or independent diagnostic route. That made it difficult to tell whether hand inference was happening at all.

**This release does not claim to prove the root cause on the user's actual phone.** It fixes auto-start and makes the failure observable and retryable.

## Live storefront changes

- After **Design Your Bag → 3D → In Your Hand** and camera permission, **hand tracking begins automatically** without a second button press.
- Current SDK `@mediapipe/tasks-vision@1.2.2` with a documented fallback to `0.10.22`, matching WASM assets and Google HandLandmarker float16 model. We use CPU inference for broad hardware compatibility.
- HandLandmarker detects up to **two hands**, tracking up to **21 points** each, with smoothing and a grip anchor. The best candidate hand is selected by proximity to the previous grip.
- PoseLandmarker provides **33 pose landmarks** and a shoulder anchor when enabled. On smaller screens, the **body tracker starts disabled** for performance, and can be enabled from the UI; selecting **Near shoulder** activates pose tracking.
- A visible skeleton overlays the camera (**green: hands**, **orange: body**); it can be disabled via **Show tracking points** while keeping the tracking active.
- The UI differentiates **model downloading, hand detected, no hand, body model unavailable, load error, and tracker paused after manual adjustment**. A **Retry tracking** button restarts inference without changing the page.
- An isolated test page at `tracking-lab.html` shows the camera, hand/body landmarks, download source, model initialization status and errors *without* the bag model. Use it to test whether the problem is tracking vs the AR/GLB compositor.
- All tracking/camera processing stays on the browser device. MediaPipe third-party usage/performance telemetry may still apply; disclose that separately.
- No payment, order, login, catalog, product image or admin changes.

## Python files requested

Located in `tools/tracking/`:

```text
tools/tracking/
 ├── download_models.py
 ├── track_hands_body.py
 ├── requirements.txt
 ├── README.md
 └── .gitignore
```

Use Python 3.10–3.12 on a local Windows/macOS/Linux computer.

```bash
python -m venv .venv
# Activate virtual environment
pip install -r tools/tracking/requirements.txt
python tools/tracking/download_models.py
python tools/tracking/track_hands_body.py --source 0 --display --mirror
```

To evaluate a video offline and save local coordinate data:

```bash
python tools/tracking/track_hands_body.py \
  --source test.mp4 --jsonl outputs/points.jsonl \
  --output-video outputs/annotated.mp4
```

Python **cannot run directly on GitHub Pages**, so it is an offline developer/training/evaluation toolkit, not a server automatically used by every mobile shopper. Browser tracking uses on-device JavaScript/WASM.

## Optional same-origin model hosting (if Google model downloads fail)

The browser tracker first checks these public paths, **if** you later upload the two model bundles:

```text
assets/models/hand_landmarker.task
assets/models/pose_landmarker_full.task
```

The files come from `python tools/tracking/download_models.py`, and can be manually uploaded to those GitHub directory paths using Add file → Upload files. The browser will then use local models first, falling back to official Google-hosted model URLs. The JavaScript/WASM package itself still needs an available CDN unless separately bundled.

Don't upload any personal videos or hand landmark JSONL outputs. Those remain local/private.

## Important accuracy limits

- MediaPipe's **21/33 landmarks** are estimates, not measured 3D distances. Exact handbag size still requires physical product measurements, phone depth calibration and/or supported native AR.
- The current strap is not a deformable/skinned Blender rig. Fingers-over-strap is an approximate 2D camera compositor, not physics-based fabric simulation.
- Heavy pose tracking may reduce frame rate on low-end phones.
- The new tracking auto-start, live diagnostics and model fallback have been unit/runtime-mock tested. **Physical-device acceptance test is still required** to confirm behavior on the user's phone and network.

## QA on mobile

1. Reload the site using a fresh browser tab and open `#custom`.
2. Select Crescent Crossbody and the **3D** view, then press **In Your Hand**.
3. Grant camera access. Wait for **Hand model loaded**; visible green skeletal points should appear when the hand is fully in frame. No extra button click is required.
4. If the tracking is absent, click **Retry tracking** and inspect the error message.
5. Open `tracking-lab.html` and press **ابدأ التتبع**. Hand landmarks should appear even without the GLB. Enable body tracking to look for orange body landmarks and shoulders.
6. Test a denied permission, lost hand, moving the camera far/near, front/back camera, body enabled/disabled and tab switching. The camera and detectors must stop after exit.
7. Try Chrome stable on Android and Safari on iOS. Confirm browser secure context, JavaScript, WebAssembly and network CDN/model access.
8. Confirm existing product photos, cart, Arabic/English text, personalization drafts, 3D, AR and payment guards are unaffected.
