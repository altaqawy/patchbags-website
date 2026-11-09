/* Patch Bags V4.6 — optional experimental hand-assist.
 * On-demand MediaPipe hand landmark detection in the user's browser.
 * Never starts until the visitor explicitly enables it, never sends video to
 * the store, and only offers approximate 2D overlay placement. Manual always
 * works if the ML dependency, inference, or a hand is unavailable.
 */
(()=>{
 'use strict';
 const VERSION='1.2.2';
 const HOST='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+VERSION;
 const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
 let active=null, generation=0;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 async function start({video,stage,isFront,onAnchor,onState}={}){
  stop();
  const id=++generation;
  const session={id,detector:null,raf:0,prevTime:-1,at:0,missed:0,previous:null,video,stage,onState};
  active=session;
  const state=s=>{if(active===session)onState?.(s)};
  state('loading');
  try{
   if(!video||!stage||!video.videoWidth)throw new Error('Live camera required');
   const {FilesetResolver,HandLandmarker}=await import(HOST+'/vision_bundle.mjs');
   if(active!==session)return false;
   const wasm=await FilesetResolver.forVisionTasks(HOST+'/wasm');
   if(active!==session)return false;
   const detector=await HandLandmarker.createFromOptions(wasm,{
    baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},
    runningMode:'VIDEO',numHands:1,
    minHandDetectionConfidence:0.62,
    minHandPresenceConfidence:0.6,
    minTrackingConfidence:0.55
   });
   if(active!==session){detector.close?.();return false}
   session.detector=detector;
   state('searching');
   const tick=now=>{
    if(active!==session)return;
    session.raf=requestAnimationFrame(tick);
    if(!video.videoWidth||video.readyState<2||document.hidden)return;
    // Restrict to 6–8 inference calls/s to protect low-end mobile phones.
    if(now-session.at<145||video.currentTime===session.prevTime)return;
    session.prevTime=video.currentTime;
    session.at=now;
    let landmarks=null;
    try{
     const r=detector.detectForVideo(video,now);
     landmarks=r?.landmarks?.[0]||null;
    }catch(_){state('error');stop();return}
    if(!landmarks?.[0]||!landmarks?.[5]||!landmarks?.[17]){
     session.missed++;
     if(session.missed===8)state('noHand');
     return;
    }
    session.missed=0;
    const width=stage.clientWidth,height=stage.clientHeight;
    if(!width||!height)return;
    const vw=video.videoWidth,vh=video.videoHeight;
    const cover=Math.max(width/vw,height/vh);
    const left=(width-vw*cover)/2,top=(height-vh*cover)/2;
    const center={x:(landmarks[5].x+landmarks[17].x)/2,y:(landmarks[5].y+landmarks[17].y)/2};
    const xNorm=isFront?.()?1-center.x:center.x;
    const palmPx=Math.hypot(
      (landmarks[5].x-landmarks[17].x)*vw*cover,
      (landmarks[5].y-landmarks[17].y)*vh*cover
    );
    // Align the illustrated bag strap/handle near the detected hand.
    const target={
     x:left+xNorm*vw*cover-width/2,
     y:top+center.y*vh*cover+palmPx*.45-height*.51,
     scale:clamp(palmPx/105,.64,1.33)
    };
    if(session.previous){
      const smooth=.19;
      target.x=session.previous.x+(target.x-session.previous.x)*smooth;
      target.y=session.previous.y+(target.y-session.previous.y)*smooth;
      target.scale=session.previous.scale+(target.scale-session.previous.scale)*smooth;
    }
    session.previous=target;
    onAnchor?.(target);
    if(session.missed===0)state('tracking');
   };
   session.raf=requestAnimationFrame(tick);
   return true;
  }catch(_){
   if(active===session){state('error');stop()}
   return false;
  }
 }
 function stop(){
  ++generation;
  const s=active;active=null;
  if(!s)return;
  if(s.raf)cancelAnimationFrame(s.raf);
  try{s.detector?.close?.()}catch(_){}
 }
 window.PATCH_HAND_ASSIST={start,stop,isActive:()=>Boolean(active)};
})();