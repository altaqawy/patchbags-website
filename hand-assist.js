/* Patch Bags V4.8 — production-oriented on-device Hand + Body tracking.
 * Browser engine: MediaPipe hand (21 landmarks) and optional pose (33 landmarks).
 * CPU-first, CDN/version fallback, clear errors and live visual output.
 * Python is separately offered for developer desktop testing; GitHub Pages runs JS.
 */
(()=>{
 'use strict';
 const PACKAGES=[
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2',
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22'
 ];
 const HAND_MODEL='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
 const LOCAL_HAND='assets/models/hand_landmarker.task';
 const LOCAL_POSE='assets/models/pose_landmarker_full.task';
 const POSE_MODELS=[
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
 ];
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const mix=(a,b,k)=>a+(b-a)*k;
 const mid=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const normalizeError=e=>String(e?.message||e||'Unknown error').replace(/https?:\/\/\S+/g,'resource').slice(0,180);
 let active=null,generation=0;
 function timeout(promise,ms,label){
  let timer;
  return Promise.race([
   promise,
   new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label+' timed out')),ms)})
  ]).finally(()=>clearTimeout(timer));
 }
 async function localSource(path){
  if(typeof fetch!=='function')return false;
  try{
   const response=await timeout(fetch(path,{method:'HEAD',cache:'force-cache'}),3500,'Local model');
   return response?.ok&&!(response.headers?.get('content-type')||'').includes('text/html');
  }catch(_){return false}
 }
 async function createHands(onProgress){
  let last;
  const models=[...(await localSource(LOCAL_HAND)?[LOCAL_HAND]:[]),HAND_MODEL];
  for(const host of PACKAGES){
   onProgress?.('sdk',host);
   try{
    const lib=await timeout(import(host+'/vision_bundle.mjs'),14000,'SDK');
    if(!lib?.HandLandmarker||!lib?.FilesetResolver)throw Error('MediaPipe exports missing');
    const wasm=await timeout(lib.FilesetResolver.forVisionTasks(host+'/wasm'),14000,'WASM');
    onProgress?.('hand-model',host);
    for(const modelURL of models){
     try{
      const detector=await timeout(lib.HandLandmarker.createFromOptions(wasm,{
       baseOptions:{modelAssetPath:modelURL,delegate:'CPU'},
       runningMode:'VIDEO',numHands:2,
       minHandDetectionConfidence:.55,minHandPresenceConfidence:.50,minTrackingConfidence:.52
      }),26000,'Hand model');
      return {host,lib,wasm,detector};
     }catch(error){
      last=error;
      console.warn('[Patch Tracker] Hand model source failed:',modelURL,normalizeError(error));
     }
    }
   }catch(error){
    last=error;
    console.warn('[Patch Tracker] Hand model load failed:',host,normalizeError(error));
   }
  }
  throw Error('Unable to load MediaPipe Hand Landmarker: '+normalizeError(last));
 }
 async function createPose(session,resources){
  let last;
  const bodySources=[...(await localSource(LOCAL_POSE)?[LOCAL_POSE]:[]),...POSE_MODELS];
  for(const modelURL of bodySources){
   if(active!==session)return null;
   session.onPoseState?.('loading');
   try{
    const detector=await timeout(resources.lib.PoseLandmarker.createFromOptions(resources.wasm,{
     baseOptions:{modelAssetPath:modelURL,delegate:'CPU'},runningMode:'VIDEO',
     numPoses:1,minPoseDetectionConfidence:.55,minPosePresenceConfidence:.5,
     minTrackingConfidence:.55,outputSegmentationMasks:false
    }),27000,'Body model');
    if(active!==session){detector.close?.();return null}
    session.onPoseState?.('searching');
    return detector;
   }catch(error){
    last=error;console.warn('[Patch Tracker] Body model load failed:',normalizeError(error));
   }
  }
  if(active===session){
   session.onPoseState?.('error');
   session.onError?.({part:'body',detail:normalizeError(last)});
  }
  return null;
 }
 function videoReady(video){
  if(video?.videoWidth>0&&video?.videoHeight>0&&video.readyState>=2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
   if(!video)return reject(Error('No video element'));
   let settled=false;
   const done=err=>{
    if(settled)return;settled=true;
    video.removeEventListener?.('loadedmetadata',check);
    video.removeEventListener?.('playing',check);
    clearTimeout(timer);
    err?reject(err):resolve();
   };
   const check=()=>{if(video.videoWidth>0&&video.readyState>=2)done()};
   const timer=setTimeout(()=>done(Error('Camera frames not ready')),10000);
   video.addEventListener?.('loadedmetadata',check);
   video.addEventListener?.('playing',check);
   check();
  });
 }
 const GRIP_Y=.15;
 function mapped(landmarks,video,stage,isFront){
  const w=stage.clientWidth,h=stage.clientHeight,vw=video.videoWidth,vh=video.videoHeight;
  if(!w||!h||!vw||!vh)return null;
  const cover=Math.max(w/vw,h/vh),left=(w-vw*cover)/2,top=(h-vh*cover)/2;
  const mirrored=Boolean(isFront?.());
  return {
   points:landmarks.map(p=>({
    x:left+(mirrored?1-p.x:p.x)*vw*cover,
    y:top+p.y*vh*cover,
    visibility:p.visibility??1
   })),
   cover,left,top,mirrored,
   videoWidth:vw,videoHeight:vh,stageWidth:w,stageHeight:h
  };
 }
 function processHand(session,landmarks,info){
  const {video,stage,frame,isFront,getCalibration}=session;
  const candidates=landmarks?.filter(x=>x?.length===21)||[];
  if(!candidates.length){session.missed++;
   if(session.missed>=4){session.state('noHand');if(session.missed===4)session.onLost?.()}
   return;
  }
  const mappedHands=candidates.map(x=>mapped(x,video,stage,isFront)).filter(Boolean);
  if(!mappedHands.length)return;
  const source=info?.previousGrip;
  mappedHands.sort((a,b)=>{
   if(!source)return 0;
   const ag=mid(a.points[4],a.points[8]),bg=mid(b.points[4],b.points[8]);
   return distance(ag,source)-distance(bg,source);
  });
  const base=mappedHands[0];
  const points=base.points;
  if(session.previousPoints){
   points.forEach((p,i)=>{
    const prev=session.previousPoints[i];
    p.x=mix(prev.x,p.x,.43);p.y=mix(prev.y,p.y,.43);
   });
  }
  session.previousPoints=points.map(x=>({...x}));
  const gripPalm=distance(points[5],points[17]);
  if(!Number.isFinite(gripPalm)||gripPalm<8)return;
  const pinchPx=distance(points[4],points[8]);
  const pinching=pinchPx<gripPalm*.87;
  const grip=pinching?mid(points[4],points[8]):mid(points[2],points[5]);
  session.previousGrip=grip;
  session.missed=0;
  const {stageWidth:w,stageHeight:h}=base;
  const settings=typeof getCalibration==='function'?getCalibration():{};
  const palmCm=clamp(Number(settings?.palmCm)||8.5,6.5,11);
  const bagCm=clamp(Number(settings?.bagCm)||41.7,12,80);
  const frameW=frame?.clientWidth||Math.min(w*.65,330);
  const frameH=frame?.clientHeight||Math.min(h*.70,450);
  const modeledFraction=.75;
  // 2D size estimate: true scale needs physical geometry + calibrated camera distance.
  const rough=(gripPalm*(bagCm/palmCm))/(frameW*modeledFraction);
  const rawScale=clamp(rough*.74,.60,1.75);
  const angle=Math.atan2(points[17].y-points[5].y,points[17].x-points[5].x)*180/Math.PI;
  const adjusted=angle>90?angle-180:angle< -90?angle+180:angle;
  const desired={
   x:grip.x-w/2,
   y:grip.y-h/2+(0.5-GRIP_Y)*frameH*rawScale,
   scale:rawScale,tilt:clamp(adjusted*.21,-7,7),
   gripX:grip.x,gripY:grip.y
  };
  if(session.previous){
   for(const key of ['x','y','scale','tilt'])desired[key]=mix(session.previous[key],desired[key],.24);
  }
  session.previous=desired;
  session.onAnchor?.(desired);
  session.onHand?.({...base,points,allHands:mappedHands.map(x=>x.points),grip,
   palmPx:gripPalm,pinching});
  session.state('tracking');
 }
 async function start({
  video,stage,frame,isFront,onAnchor,onHand,onLost,onState,onPose,onPoseState,onError,
  onDiagnostics,getCalibration,withPose=false
 }={}){
  stop();
  const session={id:++generation,video,stage,frame,isFront,getCalibration,onAnchor,onHand,
   onLost,onPose,onPoseState,onError,onDiagnostics,missed:0,previous:null,
   previousPoints:null,previousGrip:null,handDetector:null,poseDetector:null,
   raf:0,atHand:0,atPose:0,countHand:0,countPose:0,startedAt:0,lastState:''};
  session.state=key=>{
   if(active===session&&session.lastState!==key){
    session.lastState=key;onState?.(key);
   }
  };
  active=session;
  session.state('loading');
  try{
   await videoReady(video);
   if(active!==session)return false;
   const resources=await createHands((part,host)=>{
    if(active===session)onDiagnostics?.({part,host,status:'loading'});
   });
   if(active!==session){resources.detector.close?.();return false}
   session.handDetector=resources.detector;
   session.state('searching');
   session.startedAt=performance.now();
   onDiagnostics?.({part:'hand',host:resources.host,status:'ready',videoWidth:video.videoWidth,videoHeight:video.videoHeight});
   if(withPose){
    createPose(session,resources).then(detector=>{
     if(active===session)session.poseDetector=detector;
     else detector?.close?.();
    }).catch(error=>{
     if(active===session){onPoseState?.('error');onError?.({part:'body',detail:normalizeError(error)})}
    });
   }
   const tick=now=>{
    if(active!==session)return;
    session.raf=requestAnimationFrame(tick);
    if(!video.videoWidth||video.readyState<2||document.hidden)return;
    if(now-session.atHand>=110){
     session.atHand=now;
     try{
      const raw=session.handDetector.detectForVideo(video,now);
      processHand(session,raw?.landmarks,session);
      session.countHand++;
     }catch(error){
      onError?.({part:'hand',detail:normalizeError(error)});
      session.state('error');
      stop();
      onLost?.();
      return;
     }
    }
    if(session.poseDetector&&now-session.atPose>=350){
     session.atPose=now;
     try{
      const result=session.poseDetector.detectForVideo(video,now);
      const pose=result?.landmarks?.[0];
      if(pose?.length>=33){
       const geometry=mapped(pose,video,stage,isFront);
       if(geometry){
        const shoulder=geometry.points[11],other=geometry.points[12];
        const hips=[geometry.points[23],geometry.points[24]];
        const anchor=shoulder?.visibility>other?.visibility?shoulder:other;
        onPose?.({...geometry,shoulder:anchor,hips,
         worldLandmarks:result?.worldLandmarks?.[0]||[]});
       }
       onPoseState?.('tracking');
      }else{
       onPose?.(null);
       onPoseState?.('noBody');
      }
      session.countPose++;
     }catch(error){
      onError?.({part:'body',detail:normalizeError(error)});
      onPoseState?.('error');
      session.poseDetector.close?.();
      session.poseDetector=null;
     }
    }
    if(now-session.startedAt>1500&&now-session.startedAt<2200){
     onDiagnostics?.({
      part:'live',status:session.lastState,
      handFrames:session.countHand,poseFrames:session.countPose,
      videoWidth:video.videoWidth,videoHeight:video.videoHeight
     });
    }
   };
   session.raf=requestAnimationFrame(tick);
   return true;
  }catch(error){
   if(active===session){
    onError?.({part:'hand',detail:normalizeError(error)});
    session.state('error');stop();onLost?.();
   }
   return false;
  }
 }
 function stop(){
  ++generation;
  const session=active;active=null;
  if(!session)return;
  if(session.raf)cancelAnimationFrame(session.raf);
  try{session.handDetector?.close?.()}catch(_){}
  try{session.poseDetector?.close?.()}catch(_){}
 }
 window.PATCH_HAND_ASSIST={start,stop,isActive:()=>Boolean(active),
  getStatus:()=>active?.lastState||'stopped'};
})();
