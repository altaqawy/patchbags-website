/* Patch Bags V4.4 — Camera Preview (manual WebAR-style fallback).
   Uses live camera video + the customer's real GLB. No world tracking,
   plane detection or automatic real-world sizing. No recording/uploads. */
(()=>{
 'use strict';
 const ID='patchCameraPreview';
 const translations={
  title:['See it in your space','شوفيها في مكانك'],
  handTitle:['See it in your hand','شوفيها في إيدك'],
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
  help:['If your phone does not support AR, this mode uses the camera without AR hardware.','حتى لو موبايلك مش بيدعم AR، الوضع ده بيستخدم الكاميرا من غير حساسات AR.'],
  modeScene:['In your space','في المكان'],
  modeHand:['In your hand','في إيدك'],
  tryHand:['Hand Assist · experimental','تتبع الإيد · تجريبي'],
  stopHand:['Stop hand tracking','إيقاف تتبع الإيد'],
  handLoading:['Loading hand detection on your device…','بنحمّل خاصية اكتشاف الإيد على جهازك…'],
  handSearching:['Show your hand clearly to the camera','اظهري إيدك بوضوح قدام الكاميرا'],
  handTracking:['Hand detected · approximate placement','تم اكتشاف الإيد · التمركز تقريبي'],
  handMissing:['Hand not found. You can move the bag manually.','مش ظاهر إيد واضحة، تقدري تحركي الشنطة بنفسك'],
  handError:['Hand tracking unavailable. Manual placement still works.','تتبع الإيد مش متاح، والتحريك اليدوي شغّال'],
  handUnavailable:['Turn on the camera before starting hand tracking.','شغّلي الكاميرا قبل استخدام تتبع الإيد'],
  handPaused:['Tracking paused after manual adjustment · tap Retry tracking','التتبع اتوقف بعد التحريك اليدوي · اضغطي إعادة تشغيل التتبع'],
  presetHand:['Held in hand','ممسوكة بالإيد'],
  presetShoulder:['Near shoulder','قريبة من الكتف'],
  presetFront:['In front','أمام الجسم'],
  presetHint:['Approximate position only · move the handle to fit your hand','مكان تقريبي · حركي المقبض علشان الشنطة تكون ناحية إيدك'],
  shade:['Preview color','لون المعاينة'],
  light:['Lighting','الإضاءة'],
  sample:['3D color is illustrative, not a verified material match. No physical size or hand occlusion is guaranteed.','ألوان المجسم توضيحية ومش مطابقة مؤكدة للخامة. الحجم وتداخل الإيد تقريبيين فقط.'],
  fingerOverlap:['Show fingers in front of strap','إظهار الأصابع قدام السير'],
  palmSize:['Your palm width (cm)','عرض كف إيدك بالسنتيمتر'],
  gripLocked:['Grip point detected · approximate strap alignment','تم تحديد مكان القبضة · محاذاة السير تقريبية'],
  gripOpen:['Hold thumb and index finger near the handle','قرّبي الإبهام والسبابة من مكان مسكة السير'],
  sizeEstimate:['Scale is approximate. Actual product measurements still need verification.','الحجم تقديري ولازم نتأكد من المقاسات الحقيقية للشنطة.'],
  overlapNote:['Finger overlap is an on-device visual effect, not physical strap bending.','ظهور الأصابع فوق السير مؤثر بصري على الموبايل مش ثني حقيقي للسير.'],
  handWorking:['Hand tracking is running','تتبع الإيد شغّال'],
  handSearchingAgain:['Show your entire hand in good light and move it slowly','اظهري الإيد كلها في إضاءة كويسة وحرّكيها بهدوء'],
  trackBody:['Track body / shoulders','تتبع الجسم والكتفين'],
  trackPoints:['Show tracking points','إظهار نقاط التتبع'],
  bodyLoading:['Body model loading…','جارٍ تحميل نموذج الجسم…'],
  bodySearching:['Looking for shoulders and torso','بندور على الكتفين والجسم'],
  bodyTracking:['Body detected (33 points)','تم تتبع الجسم (33 نقطة)'],
  bodyNoBody:['Move back until the upper body is visible','ارجعي خطوة علشان الجزء العلوي من الجسم يظهر'],
  bodyError:['Body tracking unavailable; hand mode still works','تتبع الجسم مش متاح، لكن تتبع الإيد ممكن يشتغل'],
  diagnosticLoading:['Downloading the hand model… Check your connection','بنحمّل نموذج تتبع الإيد… اتأكدي من اتصال الإنترنت'],
  diagnosticReady:['Hand model loaded · point detection is active','نموذج اليد اتحمّل · البحث عن النقاط بدأ'],
  diagnosticsTitle:['Live tracking status','حالة التتبع المباشرة'],
  diagnosticError:['Tracker could not start. Try Chrome, allow downloads, then Retry tracking.','تعذر بدء التتبع. جرّبي Chrome واتأكدي من الإنترنت واضغطي إعادة تشغيل التتبع'],
  retryTracking:['Retry tracking','إعادة تشغيل التتبع'],
  bodyNote:['Pose tracking requires a visible upper body; it is optional on slower phones.','تتبع الجسم يحتاج ظهور الجزء العلوي، وممكن تقفليه على الموبايلات الضعيفة.'],
  testTracking:['Open hand & body diagnostic test','افتح اختبار تتبع الإيد والجسم'],
  trackQuality:['Tracking quality','جودة التتبع'],
  autoQuality:['Auto','تلقائي'],
  lightQuality:['Fast','سريع'],
  balancedQuality:['Balanced','متوازن'],
  detailQuality:['Precise','دقيق'],
  trackingPerformance:['Actual performance','الأداء الفعلي']
 };
 const ar=()=>document.documentElement.lang==='ar';
 const t=key=>translations[key]?.[ar()?1:0]||key;
 const q=(sel,root=layer)=>root?.querySelector(sel);
 const limit=(n,min,max)=>Math.max(min,Math.min(max,n));
 let layer=null,video=null,viewer=null,stage=null,frame=null,stream=null,prevFocus=null,scrollLock='';
 let serial=0,facing='environment',pos={x:0,y:0,scale:1},drag=null,current=null,statusKey='loading';
 let mode='scene',light='studio',previewSku='PB-04',tracking=false,handState='';
 let occlusion=null,overlay=null,fingerOverlay=true,palmWidthCm=8.5,gripState='';
 let bodyTracking=true,showPoints=true,autoTrack=true,bodyState='',trackingError='',diagnosticState='';
 let carryPreset='hand',qualityPreference='auto',performanceStats='';
 const safeURL=input=>{
  try{
   const url=new URL(String(input||''),document.baseURI);
   return url.protocol==='https:'&&/\.gl(?:b|tf)$/i.test(url.pathname)?url.href:null;
  }catch(_){return null}
 };
 const looks=()=>window.PATCH_BAG_LOOKS;
 const hand=()=>window.PATCH_HAND_ASSIST;
 const chosenQuality=()=>window.PATCH_TRACKING_PERFORMANCE?.profile(qualityPreference)||
  {idealWidth:960,idealHeight:540,maxFps:10};
 const bagWidthCm=()=>{
  const item=typeof products!=='undefined'&&Array.isArray(products)
   ?products.find(p=>p.id===current?.productId):null;
  const width=Number(item?.dimensionsCm?.width??item?.measurements?.widthCm??item?.dimensions?.widthCm);
  return Number.isFinite(width)&&width>=12&&width<=80?width:41.7;
 };
 const colorKeys=['PB-04','PB-05','PB-06'];
 function refreshDiagnostic(){
  if(!layer)return;
  const performanceSlot=q('[data-cp-performance]');
  if(performanceSlot)performanceSlot.textContent=performanceStats;
  const slot=q('[data-cp-diagnostic]');
  if(slot)slot.textContent=trackingError
   ?t('diagnosticError')+' · '+trackingError
   :(diagnosticState?t(diagnosticState):'');
  const body=q('[data-cp-body-status]');
  if(body)body.textContent=bodyState?t(bodyState):'';
 }
 function setHandState(key){
  handState=key||'';
  const text=q('[data-cp-hand-status]');
  if(text)text.textContent=handState?t(handState):'';
  const toggle=q('[data-cp-hand-toggle]');
  if(toggle)toggle.textContent=t(tracking?'stopHand':'tryHand');
 }
 function applyLook(){
  if(!viewer||!current)return;
  looks()?.apply(viewer,{productId:previewSku,light});
  const card=q('[data-cp-color-name]');
  if(card)card.textContent=looks()?.localize(previewSku)||'';
  layer?.querySelectorAll('[data-cp-color]').forEach(button=>{
   const yes=button.dataset.cpColor===previewSku;
   button.setAttribute('aria-pressed',String(yes));
   button.classList.toggle('selected',yes);
  });
  layer?.querySelectorAll('[data-cp-light]').forEach(button=>{
   button.setAttribute('aria-pressed',String(button.dataset.cpLight===light));
  });
 }
 function stopHand(){
  tracking=false;
  hand()?.stop();
  occlusion?.clear();
  overlay?.clear();
  gripState='';
  const grip=q('[data-cp-grip-state]');if(grip)grip.textContent='';
  if(handState)setHandState('');
 }
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
  const title=q('#patchCpHeading');if(title)title.textContent=t(mode==='hand'?'handTitle':'title');
  layer.querySelectorAll('[data-cp-label]').forEach(el=>el.setAttribute('aria-label',t(el.dataset.cpLabel)));
  const name=q('[data-cp-product]');if(name)name.textContent=productTitle();
  if(viewer)viewer.setAttribute('alt',productTitle());
  if(!layer.hidden)status(statusKey);
  layer.querySelectorAll('[data-cp-color]').forEach(button=>{
   const key=button.dataset.cpColor;
   const x=looks()?.COLORS[key];
   if(x)button.setAttribute('aria-label',ar()?x.ar:x.en);
  });
  layer.querySelectorAll('[data-cp-light]').forEach(button=>{
   const key=button.dataset.cpLight;
   const x=looks()?.LIGHTS[key];
   if(x)button.textContent=ar()?x.ar:x.en;
  });
  setHandState(handState);
  layer.querySelectorAll('[data-cp-quality]').forEach(button=>
   button.setAttribute('aria-pressed',String(button.dataset.cpQuality===qualityPreference)));
  const body=q('[data-cp-body-status]');if(body)body.textContent=bodyState?t(bodyState):'';
  const perf=q('[data-cp-performance]');if(perf)perf.textContent=performanceStats;
  const diag=q('[data-cp-diagnostic]');
  if(diag)diag.textContent=trackingError?(t('diagnosticError')+' · '+trackingError):(diagnosticState?t(diagnosticState):'');
  const grip=q('[data-cp-grip-state]');if(grip)grip.textContent=gripState?t(gripState):'';
  const palm=q('[data-cp-palm-value]');if(palm)palm.textContent=palmWidthCm.toFixed(1)+' cm';
  applyLook();
 }
 function status(key){
  statusKey=key;
  const text=q('[data-cp-status]');if(text)text.textContent=t(key);
  if(stage)stage.dataset.camera=key==='ready'?'on':'off';
 }
 function applyPosition(){
  if(!frame||!stage)return;
  const w=stage.clientWidth||360,h=stage.clientHeight||560;
  const horizontal=mode==='hand'?w*.46:w*.37;
  const vertical=mode==='hand'?h*.48:h*.31;
  pos.x=limit(pos.x,-horizontal,horizontal);
  pos.y=limit(pos.y,-vertical,vertical);
  frame.style.setProperty('--cp-x',pos.x+'px');
  frame.style.setProperty('--cp-y',pos.y+'px');
  frame.style.setProperty('--cp-scale',String(pos.scale));
  frame.style.setProperty('--cp-tilt',String(limit(Number(pos.tilt)||0,-8,8))+'deg');
  const range=q('[data-cp-size]');if(range)range.value=String(Math.round(pos.scale*100));
 }
 function preset(key){
  carryPreset=key;
  const w=stage?.clientWidth||360,h=stage?.clientHeight||520;
  const options={
   hand:{x:w*.11,y:-h*.09,scale:.79},
   shoulder:{x:w*.2,y:-h*.16,scale:.83},
   front:{x:0,y:0,scale:1}
  };
  pos={...(options[key]||options.hand)};
  applyPosition();
  layer?.querySelectorAll('[data-cp-preset]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cpPreset===key)));
 }
 function setMode(next){
  mode=next==='hand'?'hand':'scene';
  if(stage)stage.dataset.mode=mode;
  stopHand();
  layer?.querySelectorAll('[data-cp-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.cpMode===mode)));
  if(mode==='hand'){preset('hand');setHandState('handSearching');autoTrack=true}
  else preset('front');
  const title=q('#patchCpHeading');if(title)title.textContent=t(mode==='hand'?'handTitle':'title');
  if(mode==='hand'&&stream&&stage?.dataset.camera==='on'&&!tracking){
   toggleHand();
  }
 }
 async function toggleHand(){
  if(tracking){autoTrack=false;stopHand();setHandState('handSearching');return}
  if(mode!=='hand')setMode('hand');
  if(!stream||stage?.dataset.camera!=='on'){setHandState('handUnavailable');return}
  if(!hand()){setHandState('handError');return}
  tracking=true;autoTrack=true;trackingError='';diagnosticState='diagnosticLoading';bodyState=bodyTracking?'bodyLoading':'';
  setHandState('handLoading');refreshDiagnostic();
  overlay?.setVisible(showPoints);
  occlusion?.setEnabled(fingerOverlay);
  const started=await hand().start({
   video,stage,frame,isFront:()=>facing==='user',
   withPose:bodyTracking,quality:qualityPreference,
   getCalibration:()=>({palmCm:palmWidthCm,bagCm:bagWidthCm()}),
   onAnchor:point=>{
    if(!tracking||mode!=='hand'||carryPreset==='shoulder')return;
    pos={...point};applyPosition();
   },
   onHand:details=>{
    if(!tracking||mode!=='hand')return;
    if(fingerOverlay)occlusion?.draw(details);
    overlay?.hands(details.allHands||details.points);
    const next=details.pinching?'gripLocked':'gripOpen';
    if(gripState!==next){
     gripState=next;
     const msg=q('[data-cp-grip-state]');
     if(msg)msg.textContent=t(next);
    }
   },
   onLost:()=>{
    occlusion?.clear();
    overlay?.hands(null);
    gripState='';
    const msg=q('[data-cp-grip-state]');if(msg)msg.textContent='';
   },
   onPose:details=>{
    if(!tracking)return;
    overlay?.pose(details?.points||null);
    if(carryPreset==='shoulder'&&details?.shoulder&&mode==='hand'){
     // Illustration only: joint-guided shoulder carrying, not 6DoF body attachment.
     const pt=details.shoulder;
     pos.x=pos.x*.76+(pt.x-stage.clientWidth/2+stage.clientWidth*.12)*.24;
     pos.y=pos.y*.76+(pt.y-stage.clientHeight/2+frame.clientHeight*.32)*.24;
     applyPosition();
    }
   },
   onPoseState:key=>{
    bodyState=({loading:'bodyLoading',searching:'bodySearching',
      tracking:'bodyTracking',noBody:'bodyNoBody',error:'bodyError'})[key]||'bodyError';
    refreshDiagnostic();
   },
   onDiagnostics:info=>{
    if(!tracking)return;
    if(info.part==='live'){
     const ms=Number(info.inferenceMs)||0;
     const interval=Number(info.handIntervalMs)||chosenQuality().handMs||115;
     performanceStats=(info.mode==='worker'?'Worker':'Main thread')+
      (ms?' · '+Math.round(ms)+' ms':'')+
      ' · ~'+Math.round(1000/interval)+' fps';
    }else if(info.status==='ready'){
     diagnosticState='diagnosticReady';
    }else if(diagnosticState!=='handWorking'){
     diagnosticState='diagnosticLoading';
    }
    refreshDiagnostic();
   },
   onError:info=>{
    if(!tracking)return;
    if(info.part==='body')bodyState='bodyError';
    else trackingError=(info.part||'hand')+': '+String(info.detail||'Error').slice(0,110);
    refreshDiagnostic();
   },
   onState:key=>{
    if(!tracking)return;
    if(key==='error'){
     tracking=false;occlusion?.clear();overlay?.clear();
     diagnosticState='diagnosticError';
    }else if(key==='noHand'){diagnosticState='handSearchingAgain'}
    else if(key==='tracking'){diagnosticState='handWorking';trackingError=''}
    setHandState(({loading:'handLoading',searching:'handSearching',tracking:'handTracking',
      noHand:'handMissing',error:'handError'})[key]||'handError');
    refreshDiagnostic();
   }
  });
  if(!started&&tracking){tracking=false;setHandState('handError')}
 }
 function stopCamera(){
  stopHand();
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
      width:{ideal:chosenQuality().idealWidth},
      height:{ideal:chosenQuality().idealHeight},
      frameRate:{ideal:chosenQuality().maxFps*2,max:30}
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
   if(mode==='hand'&&!tracking&&autoTrack){
    setHandState('handSearching');
    toggleHand();
   }
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
      '<div class="patch-cp-modes" role="group"><button type="button" data-cp-mode="scene" aria-pressed="true" data-cp-i18n="modeScene"></button><button type="button" data-cp-mode="hand" aria-pressed="false" data-cp-i18n="modeHand"></button></div>'+
      '<div class="patch-cp-hand-panel">'+
       '<div class="patch-cp-presets" role="group">'+
        '<button type="button" data-cp-preset="hand" aria-pressed="true" data-cp-i18n="presetHand"></button>'+
        '<button type="button" data-cp-preset="shoulder" aria-pressed="false" data-cp-i18n="presetShoulder"></button>'+
        '<button type="button" data-cp-preset="front" aria-pressed="false" data-cp-i18n="presetFront"></button></div>'+
       '<button type="button" data-cp-hand-toggle class="patch-cp-hand-toggle"></button>'+
       '<button type="button" data-cp-retry-tracking class="patch-cp-hand-toggle" data-cp-i18n="retryTracking"></button>'+
       '<span class="patch-cp-hand-message" data-cp-hand-status role="status"></span>'+
       '<div class="patch-cp-quality"><span data-cp-i18n="trackQuality"></span><div role="group">'+
        '<button type="button" data-cp-quality="auto" data-cp-i18n="autoQuality" aria-pressed="true"></button>'+
        '<button type="button" data-cp-quality="light" data-cp-i18n="lightQuality" aria-pressed="false"></button>'+
        '<button type="button" data-cp-quality="balanced" data-cp-i18n="balancedQuality" aria-pressed="false"></button>'+
        '<button type="button" data-cp-quality="detail" data-cp-i18n="detailQuality" aria-pressed="false"></button>'+
       '</div></div>'+
       '<div class="patch-cp-tracking-options">'+
        '<label><input type="checkbox" data-cp-track-body checked><span data-cp-i18n="trackBody"></span></label>'+
        '<label><input type="checkbox" data-cp-show-points checked><span data-cp-i18n="trackPoints"></span></label>'+
       '</div>'+
       '<span class="patch-cp-body-status" data-cp-body-status role="status"></span>'+
       '<div class="patch-cp-live-diagnostic" role="status"><b data-cp-i18n="diagnosticsTitle"></b><span data-cp-diagnostic></span>'+
        '<small data-cp-performance></small>'+
        '<a href="tracking-lab.html" target="_blank" rel="noopener noreferrer" data-cp-i18n="testTracking"></a></div>'+
       '<span class="patch-cp-grip-status" data-cp-grip-state aria-live="off"></span>'+
       '<div class="patch-cp-calibration"><label class="patch-cp-palm-measure"><span data-cp-i18n="palmSize"></span>'+
        '<input type="range" data-cp-palm-cm min="6.5" max="11" step="0.5" value="8.5">'+
        '<output data-cp-palm-value>8.5 cm</output></label>'+
        '<label class="patch-cp-occlusion-check"><input type="checkbox" data-cp-occlusion checked>'+
        '<span data-cp-i18n="fingerOverlap"></span></label></div>'+
       '<small data-cp-i18n="sizeEstimate"></small>'+
       '<small data-cp-i18n="overlapNote"></small>'+
       '<small data-cp-i18n="bodyNote"></small>'+
      '</div>'+
      '<p class="patch-cp-guide" data-cp-i18n="guide"></p>'+
      '<div class="patch-cp-looks"><div class="patch-cp-looks-row"><div class="patch-cp-looks-group">'+
       '<span data-cp-i18n="shade"></span><div class="patch-cp-swatches" role="group">'+
        '<button type="button" data-cp-color="PB-04" aria-pressed="true" style="--cp-swatch:#9d8a7b"></button>'+
        '<button type="button" data-cp-color="PB-05" aria-pressed="false" style="--cp-swatch:#fff8ef"></button>'+
        '<button type="button" data-cp-color="PB-06" aria-pressed="false" style="--cp-swatch:#ab273c"></button></div>'+
        '<strong data-cp-color-name></strong></div>'+
       '<div class="patch-cp-looks-group"><span data-cp-i18n="light"></span><div class="patch-cp-lights" role="group">'+
        '<button type="button" data-cp-light="studio" aria-pressed="true"></button>'+
        '<button type="button" data-cp-light="daylight" aria-pressed="false"></button>'+
        '<button type="button" data-cp-light="soft" aria-pressed="false"></button>'+
       '</div></div></div>'+
       '<p class="patch-cp-sample" data-cp-i18n="sample"></p></div>'+
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
  occlusion=window.PATCH_GRIP_OCCLUSION?.mount({stage,video})||null;
  overlay=window.PATCH_TRACKING_OVERLAY?.mount({stage})||null;
  viewer.addEventListener('load',applyLook);
  viewer.addEventListener('error',()=>{const info=q('[data-cp-status]');if(info)info.textContent=t('missing3d')});
  layer.addEventListener('click',event=>{
   if(event.target.closest('[data-cp-close]')){close();return}
   if(event.target.closest('[data-cp-flip]')){facing=facing==='environment'?'user':'environment';startCamera();return}
   if(event.target.closest('[data-cp-retry]')){startCamera();return}
   if(event.target.closest('[data-cp-reset]')){stopHand();setMode(mode);return}
   const modeChoice=event.target.closest('[data-cp-mode]');
   if(modeChoice){setMode(modeChoice.dataset.cpMode);return}
   const presetChoice=event.target.closest('[data-cp-preset]');
   if(presetChoice){
    const running=tracking;
    stopHand();preset(presetChoice.dataset.cpPreset);
    if(presetChoice.dataset.cpPreset==='shoulder'&&!bodyTracking){
     bodyTracking=true;
     if(q('[data-cp-track-body]'))q('[data-cp-track-body]').checked=true;
    }
    if(running&&stage?.dataset.camera==='on'){autoTrack=true;toggleHand()}
    else setHandState('handSearching');
    return
   }
   const qualityButton=event.target.closest('[data-cp-quality]');
   if(qualityButton){
    const next=qualityButton.dataset.cpQuality;
    if(['auto','light','balanced','detail'].includes(next)&&next!==qualityPreference){
     qualityPreference=next;
     layer.querySelectorAll('[data-cp-quality]').forEach(button=>
      button.setAttribute('aria-pressed',String(button.dataset.cpQuality===qualityPreference)));
     performanceStats='';refreshDiagnostic();
     if(stream)startCamera();
    }
    return;
   }
   if(event.target.closest('[data-cp-hand-toggle]')){toggleHand();return}
   if(event.target.closest('[data-cp-retry-tracking]')){
    stopHand();autoTrack=true;trackingError='';diagnosticState='';
    refreshDiagnostic();toggleHand();return;
   }
   const colorChoice=event.target.closest('[data-cp-color]');
   if(colorChoice){previewSku=colorChoice.dataset.cpColor;applyLook();return}
   const lightChoice=event.target.closest('[data-cp-light]');
   if(lightChoice){light=lightChoice.dataset.cpLight;applyLook();return}
   const nudge=event.target.closest('[data-cp-nudge]');
   if(nudge){const delta={up:[0,-25],down:[0,25],left:[-25,0],right:[25,0]}[nudge.dataset.cpNudge];pos.x+=delta[0];pos.y+=delta[1];applyPosition()}
  });
  q('[data-cp-size]').addEventListener('input',event=>{
   if(tracking){stopHand();autoTrack=false;setHandState('handPaused')}
   pos.scale=limit(Number(event.target.value)/100,.55,1.85);pos.tilt=0;applyPosition();
  });
  q('[data-cp-palm-cm]').addEventListener('input',event=>{
   palmWidthCm=limit(Number(event.target.value)||8.5,6.5,11);
   const val=q('[data-cp-palm-value]');if(val)val.textContent=palmWidthCm.toFixed(1)+' cm';
  });
  q('[data-cp-track-body]').addEventListener('change',event=>{
   bodyTracking=Boolean(event.target.checked);
   if(tracking){stopHand();autoTrack=true;toggleHand()}
  });
  q('[data-cp-show-points]').addEventListener('change',event=>{
   showPoints=Boolean(event.target.checked);
   overlay?.setVisible(showPoints);
  });
  q('[data-cp-occlusion]').addEventListener('change',event=>{
   fingerOverlay=Boolean(event.target.checked);
   occlusion?.setEnabled(fingerOverlay);
  });
  const handle=q('[data-cp-handle]');
  handle.addEventListener('pointerdown',event=>{
   if(tracking){stopHand();autoTrack=false;setHandState('handPaused')}
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
  previewSku=looks()?.COLORS[params.productId]?params.productId:'PB-04';
  light='studio';tracking=false;handState='';gripState='';
  autoTrack=true;qualityPreference='auto';performanceStats='';
  bodyTracking=!Boolean(window.matchMedia?.('(max-width: 690px)')?.matches);
  showPoints=true;
  trackingError='';diagnosticState='';bodyState='';
  if(q('[data-cp-track-body]'))q('[data-cp-track-body]').checked=bodyTracking;
  if(q('[data-cp-show-points]'))q('[data-cp-show-points]').checked=true;
  overlay?.setVisible(true);overlay?.clear();
  palmWidthCm=8.5;fingerOverlay=true;
  if(q('[data-cp-palm-cm]'))q('[data-cp-palm-cm]').value='8.5';
  if(q('[data-cp-occlusion]'))q('[data-cp-occlusion]').checked=true;
  occlusion?.setEnabled(true);occlusion?.clear();
  statusKey='loading';stage.dataset.camera='off';layer.hidden=false;document.body.style.overflow='hidden';
  viewer.src=url;viewer.setAttribute('poster',params.poster||'');
  setMode(params.mode||'scene');
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