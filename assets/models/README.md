# PatCh.BaGs · 3D / AR reference models

## Crescent Crossbody reference model · V4.3

The optimized **user-supplied real PBR handbag model** is expected at exactly:

`assets/models/crescent-reference-ar.glb`

This one model is a **visual reference** for three existing color variations:
PB-04 (Taupe), PB-05 (Ivory) and PB-06 (Ruby). It is not claimed to exactly
match their photographed texture/color or final personalized versions.

How to activate: upload `crescent-reference-ar.glb` to this GitHub directory
on the default branch. The file is around **3.2 MB**, down from a 23 MB
original. When GitHub Pages finishes deployment, a HEAD check will register
the model and expose the 3D and AR actions automatically. No code changes are
necessary after uploading the file.

- Desktop or non-AR phones: interactive rotate/zoom 3D (AR button hidden).
- Supported Android: Scene Viewer or WebXR opens the model in the user's space.
- Supported iPhones: Quick Look converts GLB into USDZ on demand; conversion
  depends on Safari, model compatibility and device support. A separately tested
  USDZ can be added later.
- Both languages have localized AR instructions.
- Model placement is on horizontal surfaces, with **approximately** 0.42 m
  model width; true dimensions have not been verified against a physical bag.
- If the file is missing or blocked, original customer photos and normal cart,
  checkout and product pages are unaffected.

Product-specific 3D files uploaded by the owner in the CMS take priority over
this shared reference. AR is never a substitute for product photos.

### Deployment notes

An optional one-time import script lives at
`tools/import_crescent_ar_asset.py`; the archived original model is
checksum-verified before optimization. GitHub's remote Actions importer was
attempted but its job could not be started successfully in this environment.
If the Action remains unavailable, adding the already optimized GLB directly
through GitHub **Add file → Upload files** is the most reliable path.
