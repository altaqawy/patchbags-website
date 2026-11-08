/* Patch Bags AR / progressive enhancement. Native AR only on compatible devices. */
(() => {
  "use strict";
  const media = {
    image: "assets/new/ivory-spiral-real-photo.webp",
    model: "assets/models/ivory-spiral-ar.glb"
  };
  const ar = (a, b) => document.documentElement.lang === "ar" ? a : b;
  const validAsset = async (url) => {
    try {
      const response = await fetch(url, {method:"HEAD",cache:"no-store"});
      return response.ok && !String(response.headers.get("content-type")||"").includes("text/html");
    } catch {return false;}
  };
  const ready = {image:false,model:false};
  function addToProduct() {
    if (typeof products === "undefined" || !Array.isArray(products)) return;
    const p = products.find(p => p.id === "PB-05");
    if (!p) return;
    if (ready.image) {
      p.images = Array.isArray(p.images) ? p.images : [p.image].filter(Boolean);
      if (!p.images.includes(media.image)) p.images.push(media.image);
    }
    if (ready.model) {
      p.mediaExtras = Array.isArray(p.mediaExtras) ? p.mediaExtras : [];
      if (!p.mediaExtras.some(x => x.type==="model" && x.url===media.model))
        p.mediaExtras.push({type:"model",url:media.model});
    }
  }
  function enhance(model) {
    if (model.dataset.patchArEnhanced) return;
    model.dataset.patchArEnhanced="true";
    for (const [key,value] of Object.entries({
      ar:"", "ar-modes":"webxr scene-viewer quick-look",
      "ar-placement":"floor", "ar-scale":"auto",
      "camera-controls":"", "touch-action":"pan-y",
      "shadow-intensity":"0.7",loading:"lazy"
    })) model.setAttribute(key,value);
    model.removeAttribute("auto-rotate");
    const button=document.createElement("button");
    button.type="button"; button.slot="ar-button"; button.className="patch-ar-launch";
    const note=document.createElement("p");
    note.className="patch-ar-note"; note.setAttribute("role","status");
    const localize=()=>{
      button.textContent=ar("شاهديها في مكانك","View in your space");
      button.setAttribute("aria-label",ar("عرض الشنطة في الواقع المعزز","View this bag in augmented reality"));
      note.textContent=ar(
        "اسحبي لتدوير الشنطة وقرّبي بإصبعين. الواقع المعزز متاح على الأجهزة المدعومة. الحجم تقريبي.",
        "Drag to rotate, pinch to zoom. AR works on supported phones. Size is approximate."
      );
    };
    localize();
    model.appendChild(button);
    model.insertAdjacentElement("afterend",note);
    model.addEventListener("error",()=>{note.textContent=ar("تعذر تحميل المجسم. الصور العادية ما زالت متاحة.","3D could not load. Product photos are still available.");});
    model.addEventListener("ar-status",event=>{
      if(event.detail?.status==="failed")note.textContent=ar("الواقع المعزز غير مدعوم هنا. يمكنك استخدام العرض ثلاثي الأبعاد.","AR is unavailable here. You can still rotate the 3D model.");
      else if(event.detail?.status==="not-presenting")localize();
    });
    document.addEventListener("patch:language-changed",localize);
  }
  function init(){
    const panel=document.getElementById("modalAdditionalMedia");
    if(panel){
      const run=()=>panel.querySelectorAll("model-viewer").forEach(enhance);
      new MutationObserver(run).observe(panel,{childList:true,subtree:true});
      run();
    }
    const apply=window.PATCH_APPLY_CATALOG;
    if(typeof apply==="function")window.PATCH_APPLY_CATALOG=function(...args){
      const result=apply.apply(this,args);addToProduct();
      if(typeof renderProducts==="function")renderProducts();
      return result;
    };
    Promise.all([validAsset(media.image),validAsset(media.model)]).then(([image,model])=>{
      ready.image=image;ready.model=model;
      if(!image&&!model)return;
      addToProduct();
      if(typeof renderProducts==="function")renderProducts();
      if(typeof activeProduct!=="undefined" && activeProduct==="PB-05" &&
        typeof populateProductModal==="function")populateProductModal("PB-05");
    });
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();