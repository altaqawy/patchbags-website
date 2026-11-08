/* Patch Bags V4.4 — Camera Preview (manual WebAR-style fallback).
   Uses live camera video + the customer's real GLB. No world tracking,
   plane detection or automatic real-world sizing. No recording/uploads. */
(()=>{
 'use strict';
 const ID='patchCameraPreview';
 const translations={
  title:['See it in your space','شوفيها في مكانك'],
  kicker:['PATCH BAGS / CAMERA STUDIO','باتش باجز / استوديو الكاميرا'],
  manual:['MANUAL CAMERA PREVIEW','معاينة يدوية بالكاميرا'],
  close:['Close preview','إغلاق المعاينة'],
  loading:['Opening the camera…','جارٍ فتح الكاميرا…'],
  ready:['Live camera on · only visible on your device','الكاميرا شغّالة · الصورة بتظهر على جهازك فقط'],
  unavailable:['Camera unavailable or permission denied. You can still rotate the bag in 3D.','الكاميرا مش متاحة أو الإذن مرفوض. تقدري تفضلي تشوفي الشنطة 3D.'],
  missing3d:['3D model could not load. Return to the photo gallery.','تعذر تحميل المجسم، ارجعي لصور الشنطة.'],
  noHTTPS:['Camera requires HTTPS and browser permission. You can still use the 3D viewer.','الكاميرا محتاجة اتصال HTTPS وإذن من المتصفح. تقدري تستخدمي عرض 3D.'],
  noVideo:['Camera failed to start. Try again or return to 3D.','تعذر تشغيل الكاميرا. حاولي تاني أو ارجعي لعرض 3D.'],
  fallback:['Camera is unavailable — 3D preview is still shown','الكاميرا مش متاحة — المجسم 3D لسه ظاهر'],
  guide:['Drag the handle to move the bag · drag the bag to rotate','اسحبي مقبض التحريك لتغيير مكان الشنطة · واسحبي الشنطة نفسها علشان تلفّيها'],
  size:['Bag size','حجم الشنطة'],
  move:['Move bag','تحريك الشنطة'],
  flip:['Flip camera','تغيير الكاميرا'],
  retry:['Retry camera','إعادة تشغيل الكاميرا'],
  reset:['Reset placement','إعادة ضبط المكان'],
  back:['Back to 3D','الرجوع إلى 3D'],
  up:['Move up','تحريك لأعلى'],
  down:['Move down','تحريك لأسفل'],
  left:['Move left','تحريك لليسار'],
  right:['Move right','تحريك لليمين'],
  privacy:['Camera stays on your phone. No video or images are sent to the store.','الكاميرا بتفضل على موبايلك. مفيش صور أو فيديو بيتبعتوا للمتجر.'],
  disclaimer:['Illustrative overlay, not true AR. No surface tracking, distance measurement or verified physical scale.','دي معاينة تركيب يدوي مش واقع معزز حقيقي. مفيش تثبيت على الأرض أو قياس مسافات أو حجم فعلي مؤكد.'],
  positioning:['Place the bag manually','حطي الشنطة في المكان اللي يناسبك'],
  product:['Crescent handbag preview','معاينة شنطة كروس'],
  help:['If your phone does not support AR, this mode uses the camera without AR hardware.','حتى لو موبايلك مش بيدعم AR، الوضع ده بيستخدم الكاميرا من غير حساسات AR.']
 };
 const ar=()=>document.documentElement.lang==='ar';
 const t=key=>translations[key]?.[ar()?1:0]||key;
 const q=(sel,root=layer)=>root?.querySelector(sel);
 const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
 let layer=null,video=null,viewer=null,stage=null,frame=null,stream=null,prevFocus=null,scrollLock='';
 let serial=0,facing='environment',pos={x:0,y:0,scale:1},drag=null,current=null,statusKey='loading';
 const safeURL=input=>{
  try{
   const url=new URL(String(input||''),document.baseURI);
   return url.protocol==='https:'&&/\.gl(?:b|tf)$/i.test(url.pathname)?url.href:null;
  }catch(_){return null}
 };
 const productTitle=()=>{
  const fallback=current?.name||t('product');
  if(!current?.productId||typeof products==='undefined')return fallback;
  const item=products.find(p=>p.id===current.productId);
  if(!item)return fallback;
  return ar()?(item.nameAr||window.PATCH_LANGUAGE?.translate?.(item.name)||item.name):(item.name||fallback);
 };
 function translate(){
  if(!layer)return;
  layer.lang=ar()?'ar':'en';layer.dir=ar()?'rtl':'ltr';
  layer.querySelectorAll('[data-cp-i18n]').forEach(el=>{el.textContent=t(el.dataset.cpI18n)});
  layer.querySelectorAll('[data-cp-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.cpLabel)));
  const name=q('[data-cp-product]');if(name)name.textContent=productTitle();
  if(viewer)viewer.setAttribute('alt',productTitle());
  if(!layer.hidden)status(statusKey);
 }
 function status(key){
  statusKey=key;
  const text=q('[data-cp-status]');if(text)text.textContent=t(key);
  if(stage)stage.dataset.camera=key==='ready'?'on':'off';
 }
 function applyPosition(){
  if(!frame||!stage)return;
  const w=stage.clientWidth||360,h=stage.clientHeight||560;
  pos.x=limit(pos.x,-w*.37,w*.37);
  pos.y=limit(pos.y,-h*.31,h*.31);
  frame.style.setProperty('--cp-x',pos.x+'px');
  frame.style.setProperty('--cp-y',pos.y+'px');
  frame.style.setProperty('--cp-scale',String(pos.scale));
  const range=q('[data-cp-size]');if(range)range.value=String(Math.round(pos.scale*100));
 }
 function stopCamera(){
  if(video){video.pause();video.srcObject=null}
  if(stream){stream.getTracks().forEach(track=>track.stop());stream=null}
 }
 async function startCamera(){
  const ticket=++serial;
  stopCamera();
  if(!navigator.mediaDevices?.getUserMedia||!window.isSecureContext){status('noHTTPS');return}
  status('loading');
  try{
   let next;
   try{
    next=await navigator.mediaDevices.getUserMedia({
     audio:false,video:{
      facingMode:{ideal:facing},
      width:{ideal:1280},height:{ideal:720},
      frameRate:{ideal:24,max:30}
     }
    });
   }catch(firstError){
    // Low-end or older browsers can reject advanced video constraints.
    // Only retry automatically for constraint problems, not permission denials.
    if(!['OverconstrainedError','TypeError'].includes(firstError?.name))throw firstError;
    next=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing}},audio:false});
   }
   if(ticket!==serial||!layer||layer.hidden){
    next.getTracks().forEach(track=>track.stop());return;
   }
   stream=next;
   video.srcObject=next;
   video.style.transform=facing==='user'?'scaleX(-1)':'none';
   await video.play();
   if(ticket!==serial||layer.hidden){stopCamera();return}
   const track=stream.getVideoTracks()[0];
   track?.addEventListener('ended',()=>{if(ticket===serial){stopCamera();status('unavailable')}},{once:true});
   status('ready');
  }catch(err){
   if(ticket!==serial)return;
   stopCamera();
   status(err?.name==='NotAllowedError'||err?.name==='NotFoundError'?'unavailable':'noVideo');
  }
 }
 function build(){
  if(layer)return;
  layer=document.createElement('div');
  layer.id=ID;layer.className='patch-cp-layer';
  layer.dataset.patchTranslate='off';
  layer.hidden=true;
  layer.innerHTML=
   '<div class="patch-cp-backdrop" data-cp-close></div>'+
   '<section class="patch-cp-dialog" role="dialog" aria-modal="true" aria-labelledby="patchCpHeading" tabindex="-1">'+
    '<header class="patch-cp-header"><div class="patch-cp-identity">'+
      '<p data-cp-i18n="kicker" class="patch-cp-kicker"></p>'+
      '<h2 id="patchCpHeading" data-cp-i18n="title"></h2>'+
      '<span class="patch-cp-product" data-cp-product></span>'+
     '</div><button class="patch-cp-close" data-cp-close type="button" data-cp-label="close" aria-label="Close">×</button></header>'+
    '<div class="patch-cp-stage" data-camera="off">'+
      '<video class="patch-cp-video" autoplay muted playsinline webkit-playsinline></video>'+
      '<div class="patch-cp-scene-backdrop" aria-hidden="true"></div>'+
      '<span class="patch-cp-watermark" data-cp-i18n="manual"></span>'+
      '<div class="patch-cp-model-frame">'+
       '<button class="patch-cp-drag-handle" type="button" data-cp-handle data-cp-label="move">✥ <span data-cp-i18n="move"></span></button>'+
       '<model-viewer class="patch-cp-model" camera-controls touch-action="pan-y" environment-image="neutral" shadow-intensity="0" exposure="1.0" interaction-prompt="none" loading="eager"></model-viewer>'+
      '</div>'+
      '<p class="patch-cp-status" data-cp-status role="status" aria-live="polite"></p>'+
    '</div>'+
    '<div class="patch-cp-toolbar">'+
      '<p class="patch-cp-guide" data-cp-i18n="guide"></p>'+
      '<div class="patch-cp-controls"><div class="patch-cp-direction" role="group">'+
        '<button type="button" data-cp-nudge="up" data-cp-label="up">↑</button>'+
        '<button type="button" data-cp-nudge="down" data-cp-label="down">↓</button>'+
        '<button type="button" data-cp-nudge="left" data-cp-label="left">←</button>'+
        '<button type="button" data-cp-nudge="right" data-cp-label="right">→</button>'+
      '</div><label class="patch-cp-size"><span data-cp-i18n="size"></span>'+
        '<input type="range" data-cp-size min="55" max="185" value="100" step="5" /></label></div>'+
      '<div class="patch-cp-actions">'+
        '<button type="button" class="patch-cp-outline" data-cp-flip><span data-cp-i18n="flip"></span></button>'+
        '<button type="button" class="patch-cp-outline" data-cp-retry><span data-cp-i18n="retry"></span></button>'+
        '<button type="button" class="patch-cp-outline" data-cp-reset><span data-cp-i18n="reset"></span></button>'+
        '<button type="button" class="patch-cp-primary" data-cp-close><span data-cp-i18n="back"></span> ↗</button>'+
      '</div><p class="patch-cp-privacy" data-cp-i18n="privacy"></p>'+
      '<p class="patch-cp-disclaimer" data-cp-i18n="disclaimer"></p>'+
    '</div>'+
   '</section>';
  document.body.appendChild(layer);
  video=q('video');viewer=q('model-viewer');stage=q('.patch-cp-stage');frame=q('.patch-cp-model-frame');
  viewer.addEventListener('error',()=>{const info=q('[data-cp-status]');if(info)info.textContent=t('missing3d')});
  layer.addEventListener('click',event=>{
   if(event.target.closest('[data-cp-close]')){close();return}
   if(event.target.closest('[data-cp-flip]')){facing=facing==='environment'?'user':'environment';startCamera();return}
   if(event.target.closest('[data-cp-retry]')){startCamera();return}
   if(event.target.closest('[data-cp-reset]')){pos={x:0,y:0,scale:1};applyPosition();return}
   const nudge=event.target.closest('[data-cp-nudge]');
   if(nudge){const delta={up:[0,-25],down:[0,25],left:[-25,0],right:[25,0]}[nudge.dataset.cpNudge];pos.x+=delta[0];pos.y+=delta[1];applyPosition()}
  });
  q('[data-cp-size]').addEventListener('input',event=>{pos.scale=limit(Number(event.target.value)/100,.55,1.85);applyPosition()});
  const handle=q('[data-cp-handle]');
  handle.addEventListener('pointerdown',event=>{
   if(event.button!==0)return;
   event.preventDefault();
   drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:pos.x,top:pos.y};
   handle.setPointerCapture?.(event.pointerId);
  });
  handle.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id)return;
   pos.x=drag.left+event.clientX-drag.x;
   pos.y=drag.top+event.clientY-drag.y;
   applyPosition();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,()=>{drag=null});
  handle.addEventListener('keydown',event=>{
   const d={ArrowUp:[0,-12],ArrowDown:[0,12],ArrowLeft:[-12,0],ArrowRight:[12,0]}[event.key];
   if(d){event.preventDefault();pos.x+=d[0];pos.y+=d[1];applyPosition()}
  });
 }
 function open(params={}){
  const url=safeURL(params.src||params.modelUrl);
  if(!url)return false;
  build();if(!layer.hidden)close();
  prevFocus=document.activeElement;scrollLock=document.body.style.overflow;
  current={productId:params.productId||'',name:params.name||''};pos={x:0,y:0,scale:1};facing='environment';
  stage.dataset.camera='off';layer.hidden=false;document.body.style.overflow='hidden';
  viewer.src=url;viewer.setAttribute('poster',params.poster||'');
  translate();applyPosition();q('.patch-cp-dialog').focus({preventScroll:true});
  startCamera(); // Requests permission only after a user clicks Camera Preview.
  return true;
 }
 function close(){
  if(!layer||layer.hidden)return;
  ++serial;stopCamera();layer.hidden=true;current=null;drag=null;
  viewer.removeAttribute('src');
  document.body.style.overflow=scrollLock;
  if(prevFocus?.isConnected)prevFocus.focus({preventScroll:true});
 }
 // Keep nested product/customizer dialogs from capturing Tab/Escape first.
 window.addEventListener('keydown',event=>{
  if(!layer||layer.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return}
  if(event.key!=='Tab')return;
  event.stopImmediatePropagation();
  const nodes=[...layer.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(n=>n.getClientRects().length);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 },true);
 document.addEventListener('patch:language-changed',translate);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close()});
 window.addEventListener('pagehide',close);
 window.addEventListener('resize',applyPosition,{passive:true});
 window.PATCH_CAMERA_PREVIEW={open,close,isOpen:()=>Boolean(layer&&!layer.hidden)};
})();