/* Activate supplied product photo only after its corresponding GitHub image has loaded.
   If not yet uploaded, fall back to the existing published hero without breaking the page. */
(()=> {
 const hero=document.querySelector(".editorial-hero-image");
 const panel=document.querySelector(".editorial-hero");
 if(!hero || !panel) return;
 const original=hero.getAttribute("src");
 const cache=new Map();
 let latest=0;
 const desktop="assets/hero-desktop-4k.webp";
 const tablet="assets/hero-tablet-4x3.webp";
 function load(src){
  if(cache.has(src))return cache.get(src);
  const task=new Promise(resolve=>{
   const img=new Image();
   img.onload=()=>resolve(true);
   img.onerror=()=>resolve(false);
   img.src=src;
  });
  cache.set(src,task);return task;
 }
 async function apply(){
  const req=++latest;
  const isMobile=window.matchMedia("(max-width:680px)").matches;
  if(isMobile){
   hero.src=original;
   document.documentElement.classList.remove("patch-photo-ready");
   panel.style.removeProperty("--patch-hero-image");
   return;
  }
  const src=window.matchMedia("(min-width:1200px)").matches?desktop:tablet;
  const ok=await load(src);
  if(req!==latest)return;
  if(ok){
   panel.style.setProperty("--patch-hero-image",'url("'+src+'")');
   hero.src=src;
   document.documentElement.classList.add("patch-photo-ready");
  }else{
   hero.src=original;
   document.documentElement.classList.remove("patch-photo-ready");
   panel.style.removeProperty("--patch-hero-image");
  }
 }
 apply();
 let frame=false;
 window.addEventListener("resize",()=>{
  if(frame)return;
  frame=true;
  requestAnimationFrame(()=>{frame=false;apply()});
 },{passive:true});
})();
