# PatCh.BaGs V4.4 — Camera Preview for phones without native AR

## What visitors can do

On products with a 3D model (initially PB-04, PB-05 and PB-06), visitors see:

- **Photos:** actual product photographs, as before.
- **3D:** rotate and zoom the real GLB model in the website.
- **AR:** platform-native tracked AR where their hardware/browser supports it.
- **Camera Preview / عاينيها بالكاميرا:** an additional manual camera-compositing mode for phones with a camera and working WebGL, even when native world-tracked AR is unsupported.

Camera Preview is **not real AR**. The GLB appears in a manually movable, scalable and rotatable overlay over the visitor's live camera. There is **no** horizontal-plane detection, hit testing, environmental occlusion, live lighting capture, automatic anchor persistence or verified physical measurement. Label it accordingly.

## Interaction details

The Camera Preview launch action is available in the Design Your Bag Studio **3D tab** and in the ordinary product-detail modal under the 3D model. The camera opens only after the visitor clicks the button; there is no automatic permission prompt on website load.

1. Browser asks permission to use the camera; it prefers the rear camera but can use a simpler constraint set on older phones.
2. A clear **manual camera preview** notice appears with the actual user's camera video behind the same GLB model.
3. Drag the **Move bag** handle to position the model. Drag the GLB itself to rotate (normal model-viewer orbit controls).
4. Use arrows for precise placement, or the size slider to zoom the rendered model (not real-world dimensions).
5. **Flip camera**, **Retry camera**, **Reset placement**, or **Back to 3D** as needed.
6. If permission is denied or the camera API is unavailable, a neutral background and the interactive 3D reference remain; the visitor is told to return to ordinary 3D.

## Privacy and lifecycle

- Uses `navigator.mediaDevices.getUserMedia({audio:false,video:…})` **after a user gesture only**.
- This requires a secure HTTPS context and permission from the user.
- No camera pixels, microphone samples, photo capture, recordings or webcam stream uploads are implemented.
- The `MediaStreamTrack` is immediately stopped on modal close, document visibility loss or pagehide, including when camera requests are still pending.
- Permission failures are handled gracefully, and advanced camera constraints fall back to a simpler request only on unsupported constraints (not on declined permissions).
- Existing product photos, draft designs, cart, login, payments and catalog API are unchanged.
- The overlay supports keyboard navigation, focus trapping, Escape, keyboard movement, mobile portrait and short landscape viewports, Arabic RTL and English LTR, and reduced-motion preferences.

## Manual QA

| Scenario | Expected |
|---|---|
| Android without ARCore support, modern Chrome | Camera Preview launches on permission; model overlays live video, with manual controls |
| Android with ARCore support | Camera Preview **and** normal AR action are available |
| iPhone Safari (no native model AR / unsupported Quick Look) | Camera Preview can launch with permission and WebGL; otherwise 3D fallback |
| Browser without `mediaDevices` or non-HTTPS origin | No permission prompt; explain limitation and retain 3D viewer |
| Camera denied | Show localized message; no hidden camera use; 3D remains |
| Tap Back, press Escape, switch tabs, leave page | All video tracks stop immediately |
| Flip to selfie camera | Rear stream stops before requesting selfie; video background mirrors appropriately |
| Drag move handle / arrow buttons | Only overlay placement changes, not actual model data |
| Drag model / size slider | Rotate and resize preview smoothly |
| Switch EN ↔ AR | Controls, privacy notice and status translate without reopening camera |
| 320, 390, 680, 768, 1024, 1440px + landscape | Modal fits, readable text, visible close and camera controls |
| PB-04/PB-05/PB-06 | Uses existing same-origin reference GLB; product photographs retained |
| Other products without 3D models | No empty camera or 3D buttons are introduced |

## Release checks

Static validation includes JS parsing, presence of permission-on-click gates, stream stop on every exit path, CSS brace balancing, file load order, and localization strings. A live hardware/browser test is **still needed** before claiming universal support. If the device lacks usable WebGL, it may be limited to product photos.

No additional app, paid service, customer account, API key, ARCore installation or product database migration is required for the camera overlay itself.
