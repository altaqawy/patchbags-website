/* PatCh.BaGs V4.5 — calibrated-looking, *illustrative* 3D color & lighting.
 * This reference GLB was inspected: five materials named root.0..root.4;
 * root.1/.2/.3 contain woven body, flap and straps. root.0 and root.4
 * are trim, and must keep their original metallic appearance.
 * Changing a color is an approximation of an unverified physical sample.
 */
(()=>{
'use strict';
const MODEL='crescent-reference-ar.glb';
const COLOR={
 'PB-04':{en:'Warm taupe',ar:'تاوب دافي',hex:'#9d8a7b'},
 'PB-05':{en:'Natural ivory',ar:'عاجي طبيعي',hex:'#fff8ef'},
 'PB-06':{en:'Deep ruby',ar:'روبي غامق',hex:'#ab273c'}
};
const LIGHT={
 studio:{exposure:0.98,shadow:0.67,environment:'neutral',en:'Studio',ar:'إضاءة الاستوديو'},
 daylight:{exposure:1.1,shadow:0.46,environment:'neutral',en:'Daylight',ar:'ضوء النهار'},
 soft:{exposure:0.86,shadow:0.31,environment:'neutral',en:'Soft light',ar:'إضاءة ناعمة'}
};
const original=new WeakMap();
const validColor=id=>Object.hasOwn(COLOR,id)?id:'PB-04';
const validLight=k=>Object.hasOwn(LIGHT,k)?k:'studio';
const isReference=url=>{
 try{return new URL(String(url||''),document.baseURI).pathname.endsWith('/assets/models/'+MODEL)}
 catch(_){return false}
};
function apply(viewer,{productId='PB-04',light='studio',referenceOnly=true}={}){
 if(!viewer)return false;
 const src=viewer.getAttribute('src')||viewer.src;
 if(referenceOnly&&!isReference(src))return false;
 const sku=validColor(productId),lamp=LIGHT[validLight(light)];
 viewer.setAttribute('environment-image',lamp.environment);
 viewer.setAttribute('exposure',String(lamp.exposure));
 viewer.setAttribute('shadow-intensity',String(lamp.shadow));
 viewer.setAttribute('shadow-softness','0.92');
 viewer.dataset.patchPreviewColor=sku;
 viewer.dataset.patchPreviewLight=validLight(light);
 const model=viewer.model;
 if(!model?.materials?.length)return false;
 for(const mat of model.materials){
  const pbr=mat?.pbrMetallicRoughness;
  if(!pbr)continue;
  // Never change owner-provided models, nor the metallic zips/trim.
  if(!new Set(['root.1','root.2','root.3']).has(mat.name))continue;
  pbr.setBaseColorFactor(COLOR[sku].hex);
  pbr.setMetallicFactor(0.015);
  pbr.setRoughnessFactor(0.92);
 }
 return true;
}
function attach(viewer,getSettings){
 if(!viewer)return()=>{};
 const update=()=>apply(viewer,(typeof getSettings==='function'?getSettings():getSettings)||{});
 viewer.addEventListener('load',update);
 if(viewer.loaded)update();
 return()=>viewer.removeEventListener('load',update);
}
function localize(id){
 const x=COLOR[validColor(id)];
 return document.documentElement.lang==='ar'?x.ar:x.en;
}
window.PATCH_BAG_LOOKS={COLORS:COLOR,LIGHTS:LIGHT,isReference,apply,attach,localize};
})();