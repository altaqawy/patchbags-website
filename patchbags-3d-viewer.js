/* Patch Bags — 3D-only product viewer.
 * Real user-provided Crescent GLB where available, owner-specific models take
 * priority. No AR, camera permissions, hand/body tracking, or video processing.
 */
(()=>{
  "use strict";
  const REFERENCE_MODEL="assets/models/crescent-reference-ar.glb"; // Existing binary filename, not an AR feature.
  const PREVIOUS_IVORY_PHOTO="assets/new/ivory-spiral-real-photo.webp";
  const SKUS=new Set(["PB-04","PB-05","PB-06"]);
  let verified=false,ivoryPhotoReady=false;
  const say=(ar,en)=>document.documentElement.lang==="ar"?ar:en;
  const isReference=url=>url===REFERENCE_MODEL;
  const hasOwnModel=p=>Array.isArray(p?.mediaExtras)&&p.mediaExtras.some(item=>
    item?.type==="model"&&typeof item.url==="string"&&item.url!==REFERENCE_MODEL);

  function restorePreviousOptionalPhoto(){
    if(!ivoryPhotoReady||typeof products==="undefined")return;
    const ivory=products.find(p=>p.id==="PB-05");
    if(!ivory)return;
    if(!Array.isArray(ivory.images))ivory.images=[ivory.image].filter(Boolean);
    if(!ivory.images.includes(PREVIOUS_IVORY_PHOTO))ivory.images.push(PREVIOUS_IVORY_PHOTO);
  }
  function registerReferenceModels(){
    restorePreviousOptionalPhoto();
    if(!verified||typeof products==="undefined"||!Array.isArray(products))return;
    for(const p of products){
      if(!SKUS.has(p.id)||hasOwnModel(p))continue;
      if(!Array.isArray(p.mediaExtras))p.mediaExtras=[];
      const existing=p.mediaExtras.find(item=>item?.type==="model"&&isReference(item.url));
      if(existing){
        // Do not expose deprecated AR metadata on the reference entry.
        delete existing.ar;
        continue;
      }
      p.mediaExtras.push({
        type:"model",
        url:REFERENCE_MODEL,
        title:"Crescent 3D reference model",
        approximateScale:true
      });
    }
    document.dispatchEvent(new Event("patch:reference-3d-ready"));
  }

  async function verifyAssets(){
    async function available(url,minBytes){
      try{
        const r=await fetch(url,{method:"HEAD",cache:"no-store"});
        const mime=String(r.headers.get("content-type")||"").toLowerCase();
        const bytes=Number(r.headers.get("content-length")||0);
        return r.ok&&!mime.includes("text/html")&&(!bytes||bytes>minBytes);
      }catch(_){return false}
    }
    [verified,ivoryPhotoReady]=await Promise.all([
      available(REFERENCE_MODEL,100000),
      available(PREVIOUS_IVORY_PHOTO,2000)
    ]);
    restorePreviousOptionalPhoto();
    if(verified||ivoryPhotoReady){
      registerReferenceModels();
      if(typeof renderProducts==="function")renderProducts();
      const selected=typeof activeProduct!=="undefined"?activeProduct:null;
      if(selected&&SKUS.has(selected)&&typeof populateProductModal==="function"){
        populateProductModal(selected);
      }
    }
    document.dispatchEvent(new CustomEvent("patch:reference-3d-status",
      {detail:{ready:verified}}));
  }

  function enhanceModel(model){
    if(model.dataset.patch3dEnhanced)return;
    model.dataset.patch3dEnhanced="true";
    // Only WebGL 3D inside the page. Never offer Scene Viewer / Quick Look.
    for(const attr of ["ar","ar-modes","ar-placement","ar-scale","ios-src"]){
      model.removeAttribute(attr);
    }
    model.querySelector('[slot="ar-button"]')?.remove();
    model.setAttribute("camera-controls","");
    model.setAttribute("touch-action","pan-y");
    model.setAttribute("shadow-intensity","0.85");
    model.setAttribute("shadow-softness","0.92");
    model.setAttribute("environment-image","neutral");
    model.setAttribute("exposure","1.0");
    model.removeAttribute("auto-rotate");
    const note=document.createElement("p");
    note.className="patch-3d-note";
    note.setAttribute("role","status");
    const localize=()=>{
      note.textContent=say(
        "حرّكي المجسم بإيدك أو الماوس وقرّبيه بإصبعين. اللون والحجم للمعاينة فقط ويحتاجان تأكيدًا من الاستوديو.",
        "Drag to rotate and pinch to zoom the 3D bag. Color and size are illustrative and require studio confirmation."
      );
      model.setAttribute("aria-label",say("معاينة تفاعلية ثلاثية الأبعاد للشنطة","Interactive 3D bag preview"));
    };
    localize();
    model.insertAdjacentElement("afterend",note);
    model.addEventListener("load",()=>{
      const sku=typeof activeProduct!=="undefined"?activeProduct:"PB-04";
      window.PATCH_BAG_LOOKS?.apply(model,{productId:sku,light:"studio"});
    });
    model.addEventListener("error",()=>{
      note.textContent=say(
        "تعذر تحميل المجسم ثلاثي الأبعاد. صور المنتج ما زالت متاحة.",
        "Could not load the 3D model. Product photos remain available."
      );
    });
    document.addEventListener("patch:language-changed",localize);
  }

  function init(){
    const area=document.getElementById("modalAdditionalMedia");
    if(area){
      const sync=()=>area.querySelectorAll("model-viewer").forEach(enhanceModel);
      new MutationObserver(sync).observe(area,{childList:true,subtree:true});
      sync();
    }
    const apply=window.PATCH_APPLY_CATALOG;
    if(typeof apply==="function"){
      window.PATCH_APPLY_CATALOG=function(...args){
        const result=apply.apply(this,args);
        registerReferenceModels();
        return result;
      };
    }
    verifyAssets();
  }
  window.PATCH_3D_REFERENCE={url:REFERENCE_MODEL,skus:[...SKUS],isReady:()=>verified};
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else init();
})();