# Patch Bags V4.8 · Hand and Body Tracking

Two separate runtimes serve **different purposes**.

## 1. Real website: browser-based tracking

GitHub Pages cannot execute Python. The public store uses:
- `hand-assist.js`: MediaPipe Web Task `HandLandmarker` (21 points, max 2 hands) and optionally `PoseLandmarker` (33 body points), CPU-first with version fallback, camera readiness checks and errors.
- `tracking-visualizer.js`: a clearly visible **green hand skeleton** and **orange body skeleton**, so the customer can verify tracking is actually running.
- `camera-preview.js`: camera permission, automatic start after **In your hand**, status panel, enable/disable body tracking, toggle skeleton, optional finger overlap and manual placement.

Open the live site and select **Design Your Bag → Crescent Crossbody → 3D → In Your Hand**. Approve camera permission, keep the **entire hand visible** under reasonable light, and check the live status panel. The **Retry tracking** button restarts MediaPipe if the SDK or model download failed. The browser must have Internet access to obtain MediaPipe's runtime and models and needs WebAssembly support.

If the user switches to the shoulder preset, body landmarks can guide an **approximate** shoulder placement. Neither this nor the hand tracker measures accurate physical handbag size or bends the strap mesh around the fingers.

If the hand never appears:
1. Confirm camera preview video is live and permissions granted.
2. Wait for the **Hand model loaded** status — it requires downloading a MediaPipe `.task` model and WASM runtime.
3. Check the visible error details and try **Retry tracking**. If model downloads are blocked, use Chrome over ordinary HTTPS (no VPN/ad-blocker/proxy blocking the MediaPipe URLs).
4. Show an entire well-lit hand; avoid excessive motion blur.
5. If necessary, disable body tracking on weaker phones so hand tracking has more processing time.
6. Move the phone further from your hand until wrist and fingertips are within the camera frame.

The site does not upload camera/video/hand landmarks. MediaPipe may transmit usage/performance diagnostics according to Google's notice, so this should be disclosed as part of privacy review.

## 2. Python: PC / local video diagnostics and measurement

These Python files are **real, runnable code**, but are not used inside the browser:

- `download_models.py`: download two official model bundles once (hand and full-body pose)
- `track_hands_body.py`: track landmarks on a desktop camera or an existing video and draw the skeleton; optionally export results locally as JSON Lines
- `requirements.txt`: Python dependencies

Recommended Python 3.10–3.12 on Windows/macOS/Linux.

```bash
python -m venv .venv
# Activate .venv (Windows: .venv\Scripts\activate, macOS/Linux: source .venv/bin/activate)
pip install -r tools/tracking/requirements.txt
python tools/tracking/download_models.py
python tools/tracking/track_hands_body.py --source 0 --display --width 1280 --height 720
```

Test a video file without opening a camera and save a landmark log:

```bash
python tools/tracking/track_hands_body.py --source "example.mp4" --jsonl outputs/tracking.jsonl --output-video outputs/annotated.mp4
```

Run only hand tracking if the PC is slow:

```bash
python tools/tracking/track_hands_body.py --source 0 --display --no-pose
```

The JSONL data contains human-body/hand landmarks. Treat it as personal data: obtain consent before running tracking on others and keep files local or delete them when no longer needed.

## Accuracy and physical limitations

MediaPipe detects points, but **high accuracy is not guaranteed**. Accuracy varies with lighting, camera quality, hand occlusion, finger movement, distance and body visibility.

For a convincing true handbag carry simulation, this project still needs:
- The **real width, height, strap length and handle geometry** measured from the physical bag, not estimates.
- A **rigged/deformable strap** in Blender with precisely mapped grip points and sensible physics.
- Calibrated camera intrinsics/depth or supported AR hardware for improved absolute centimeter scale.
- Real-person device tests of hand occlusion, especially when fingers cross the bag strap.

The Python scripts can help validate the tracking quality and develop a better rig, but simply adding Python to GitHub Pages does not improve customer browser accuracy.
