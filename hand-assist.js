/* Patch Bags V4.7 — Grip Anchor Pro
 * Gesture-aware palm/finger tracking from user-triggered MediaPipe on-device inference.
 * Approximate 2D hand attachment only; it is not a skeletal strap rig or measured AR.
 */
(()=>{
 'use strict';
 const VERSION='1.2.2';
 const HOST='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+VERSION;
 const MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
 let active=null,generation=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const mix=(a,b,k)=>a+(b-a)*k;
 const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const GRIP_Y=0.15; // projected top of actual strap in viewer; refine after asset rigging
 async function start({video,stage,frame,isFront,onAnchor,onHand,onLost,onState,getCalibration}={}){
  stop();
  const session={id:++generation,detector:null,raf:0,prevTime:-1,at:0,missed:0,
   previous:null,points:null,lastState:'',video,stage};
  active=session;
  const state=s=>{if(active===session&&session.lastState!==s){session.lastState=s;onState?.(s)}};
  state('loading');
  try{
   if(!video||!stage||!video.videoWidth)throw Error('Live camera required');
   const {FilesetResolver,HandLandmarker}=await import(HOST+'/vision_bundle.mjs');
   if(active!==session)return false;
   const wasm=await FilesetResolver.forVisionTasks(HOST+'/wasm');
   if(active!==session)return false;
   const detector=await HandLandmarker.createFromOptions(wasm,{
    baseOptions:{modelAssetPath:MODEL,delegate:'CPU'},
    runningMode:'VIDEO',numHands:1,
    minHandDetectionConfidence:0.62,
    minHandPresenceConfidence:0.6,
    minTrackingConfidence:0.58
   });
   if(active!==session){detector.close?.();return false}
   session.detector=detector;
   state('searching');
   const tick=now=>{
    if(active!==session)return;
    session.raf=requestAnimationFrame(tick);
    if(!video.videoWidth||video.readyState<2||document.hidden)return;
    // Limit heavy CPU inference and camera foreground masking to ~7 fps.
    if(now-session.at<145||video.currentTime===session.prevTime)return;
    session.prevTime=video.currentTime;
    session.at=now;
    let landmarks;
    try{landmarks=detector.detectForVideo(video,now)?.landmarks?.[0]}
    catch(_){state('error');stop();onLost?.();return}
    if(!landmarks?.[0]||!landmarks?.[4]||!landmarks?.[5]||!landmarks?.[8]||!landmarks?.[17]){
     session.missed++;
     if(session.missed===5){state('noHand');onLost?.()}
     return;
    }
    session.missed=0;
    const width=stage.clientWidth,height=stage.clientHeight;
    const vw=video.videoWidth,vh=video.videoHeight;
    if(!width||!height||!vw||!vh)return;
    const cover=Math.max(width/vw,height/vh);
    const left=(width-vw*cover)/2,top=(height-vh*cover)/2;
    const mirrored=Boolean(isFront?.());
    const points=landmarks.map(p=>({
     x:left+(mirrored?1-p.x:p.x)*vw*cover,
     y:top+p.y*vh*cover
    }));
    if(session.points&&session.points.length===points.length){
     // Reduce visual jitter; finger positions follow slightly faster than the bag.
     points.forEach((p,i)=>{
      p.x=mix(session.points[i].x,p.x,.42);
      p.y=mix(session.points[i].y,p.y,.42);
     });
    }
    session.points=points;
    const palmPx=distance(points[5],points[17]);
    if(!Number.isFinite(palmPx)||palmPx<10)return;
    const pinchPx=distance(points[4],points[8]);
    const pinching=pinchPx<palmPx*.88;
    // Pinched thumb-index tips anchor onto the top strap; open hands use thumb/index web.
    const grip=pinching?mid(points[4],points[8]):mid(points[2],points[5]);
    const calibration=typeof getCalibration==='function'?getCalibration():{};
    // Same-distance approximate ratio: model preview width / visible hand width.
    // A person's true palm width, phone FOV and camera depth are not measured.
    const assumedPalmCm=clamp(Number(calibration?.palmCm)||8.5,6.5,11);
    const referenceBagCm=clamp(Number(calibration?.bagCm)||41.7,12,80);
    const frameW=frame?.clientWidth||Math.min(width*.66,330);
    const frameH=frame?.clientHeight||Math.min(height*.7,450);
    const bagRenderedRatio=.75; // conservative screen fraction occupied by glTF model
    const baseScale=(palmPx*(referenceBagCm/assumedPalmCm))/(frameW*bagRenderedRatio);
    const scale=clamp(baseScale*.74,.6,1.75);
    const palmAngle=Math.atan2(points[17].y-points[5].y,points[17].x-points[5].x)*180/Math.PI;
    const palmTilt=(palmAngle>90?palmAngle-180:palmAngle< -90?palmAngle+180:palmAngle);
    const desired={
     x:grip.x-width/2,
     y:grip.y-height/2+(0.5-GRIP_Y)*frameH*scale,
     scale,
     tilt:clamp(palmTilt*.22,-7,7),
     gripX:grip.x,gripY:grip.y
    };
    if(session.previous){
     const ease=.20;
     for(const key of ['x','y','scale','tilt']){
      desired[key]=mix(session.previous[key],desired[key],ease);
     }
    }
    session.previous=desired;
    onAnchor?.(desired);
    onHand?.({points,grip,palmPx,pinching,mirrored,
     stageWidth:width,stageHeight:height,videoWidth:vw,videoHeight:vh,
     cover,left,top});
    state('tracking');
   };
   session.raf=requestAnimationFrame(tick);
   return true;
  }catch(_){
   if(active===session){state('error');stop();onLost?.()}
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
