/* PatCh.BaGs: 3D and AR for the user's genuine Crescent-style handbag reference.
 * This file only enables AR when the local model really exists. Product photos
 * are never replaced and owner-supplied product-specific models take priority.
 */
(() => {
  "use strict";
  const REFERENCE_MODEL = "assets/models/crescent-reference-ar.glb";
  const PREVIOUS_IVORY_PHOTO = "assets/new/ivory-spiral-real-photo.webp";
  let ivoryPhotoReady = false;
  const SKUS = new Set(["PB-04", "PB-05", "PB-06"]);
  let verified = false;
  const say = (ar, en) => document.documentElement.lang === "ar" ? ar : en;
  const isReference = value => typeof value === "string" && value === REFERENCE_MODEL;

  function hasOwnModel(p) {
    return p?.mediaExtras?.some(item =>
      item?.type === "model" &&
      typeof item.url === "string" &&
      item.url !== REFERENCE_MODEL
    );
  }

  function restorePreviousOptionalPhoto() {
    if (!ivoryPhotoReady || typeof products === "undefined") return;
    const ivory = products.find(p => p.id === "PB-05");
    if (!ivory) return;
    if (!Array.isArray(ivory.images)) ivory.images = [ivory.image].filter(Boolean);
    if (!ivory.images.includes(PREVIOUS_IVORY_PHOTO)) ivory.images.push(PREVIOUS_IVORY_PHOTO);
  }

  function linkReferenceModels() {
    restorePreviousOptionalPhoto();
    if (!verified || typeof products === "undefined" || !Array.isArray(products)) return;
    for (const p of products) {
      if (!SKUS.has(p.id) || hasOwnModel(p)) continue;
      if (!Array.isArray(p.mediaExtras)) p.mediaExtras = [];
      if (!p.mediaExtras.some(m => m.type === "model" && isReference(m.url))) {
        p.mediaExtras.push({
          type: "model",
          url: REFERENCE_MODEL,
          title: "Crescent-style reference model",
          ar: true,
          approximateScale: true
        });
      }
    }
    document.dispatchEvent(new Event("patch:reference-3d-ready"));
  }

  async function verifyReference() {
    // Avoid displaying an empty 3D/AR tab before the binary is actually hosted.
    async function assetOk(url, minSize) {
      try {
        const reply = await fetch(url, { method: "HEAD", cache: "no-store" });
        const type = String(reply.headers.get("content-type") || "").toLowerCase();
        const size = Number(reply.headers.get("content-length") || 0);
        return reply.ok && !type.includes("text/html") && (!size || size > minSize);
      } catch (_error) { return false }
    }
    [verified, ivoryPhotoReady] = await Promise.all([
      assetOk(REFERENCE_MODEL, 100_000),
      assetOk(PREVIOUS_IVORY_PHOTO, 2000)
    ]);
    restorePreviousOptionalPhoto();
    if (verified || ivoryPhotoReady) {
      linkReferenceModels();
      if (typeof renderProducts === "function") renderProducts();
      const shownId = typeof activeProduct !== "undefined" ? activeProduct : null;
      if (shownId && SKUS.has(shownId) && typeof populateProductModal === "function") {
        populateProductModal(shownId);
      }
    }
    document.dispatchEvent(new CustomEvent("patch:reference-3d-status", { detail: { ready: verified } }));
  }

  function enhanceModel(model) {
    if (model.dataset.patchArEnhanced) return;
    model.dataset.patchArEnhanced = "true";
    for (const [key, value] of Object.entries({
      ar: "",
      "ar-modes": "scene-viewer webxr quick-look",
      "ar-placement": "floor",
      "ar-scale": "auto",
      "camera-controls": "",
      "touch-action": "pan-y",
      "shadow-intensity": "0.9"
    })) model.setAttribute(key, value);
    model.removeAttribute("auto-rotate");
    const button = document.createElement("button");
    button.type = "button";
    button.slot = "ar-button";
    button.className = "patch-ar-launch";
    const note = document.createElement("p");
    note.className = "patch-ar-note";
    note.setAttribute("role", "status");
    const localize = () => {
      button.textContent = say("شوفي الشنطة في مكانك", "View in your space");
      button.setAttribute("aria-label", say("عرض الشنطة بتقنية الواقع المعزز", "View bag in augmented reality"));
      note.textContent = say(
        "مجسم توضيحي لشكل الحقيبة. الحجم تقريبي، واللون والخامة النهائية بعد تأكيد الاستوديو.",
        "Illustrative bag shape. Size is approximate; final colors and materials require studio confirmation."
      );
    };
    localize();
    model.appendChild(button);
    model.insertAdjacentElement("afterend", note);
    model.addEventListener("error", () => {
      note.textContent = say("تعذر تحميل المجسم. صور المنتج ما زالت متاحة.", "Could not load the model. Product photos remain available.");
    });
    model.addEventListener("ar-status", event => {
      if (event.detail?.status === "failed") {
        note.textContent = say(
          "الجهاز أو المتصفح لم يتمكن من تشغيل الواقع المعزز. تقدري تشوفي الشنطة بتقنية 3D.",
          "AR did not start on this device. You can still explore the 3D model."
        );
      } else if (event.detail?.status === "not-presenting") {
        localize();
      }
    });
    document.addEventListener("patch:language-changed", localize);
  }

  function init() {
    const additionalMedia = document.getElementById("modalAdditionalMedia");
    if (additionalMedia) {
      const sync = () => additionalMedia.querySelectorAll("model-viewer").forEach(enhanceModel);
      new MutationObserver(sync).observe(additionalMedia, { childList: true, subtree: true });
      sync();
    }

    const apply = window.PATCH_APPLY_CATALOG;
    if (typeof apply === "function") {
      window.PATCH_APPLY_CATALOG = function(...args) {
        const result = apply.apply(this, args);
        linkReferenceModels();
        return result;
      };
    }
    verifyReference();
  }
  window.PATCH_AR_REFERENCE = { url: REFERENCE_MODEL, skus: [...SKUS], isReady: () => verified };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
