/* Patch Bags V4.9 — Dedicated MediaPipe Web Worker
 * Synchronous MediaPipe detectForVideo runs off the storefront UI thread.
 * Incoming ImageBitmap is transferred from the live local camera and closed
 * immediately after inference. No network submission or video recording.
 */
'use strict';
let hands=null,pose=null,version='',running=false,handFrames=0,poseFrames=0;
const canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(1,1):null;
const MODELS={
 hand:'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
 full:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task',
 lite:'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task'
};
const PACKAGES=[
 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.2',
 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22'
];
const failText=e=>String(e?.message||e||'Unknown worker error').replace(/https?:\/\/\S+/g,'model URL').slice(0,180);
function emit(type,detail={}){self.postMessage({type,...detail})}
async function chooseLocal(path){
 try{
  const resp=await fetch(path,{method:'HEAD',cache:'force-cache'});
  return resp.ok&&!String(resp.headers.get('content-type')||'').includes('text/html');
 }catch(_){return false}
}
async function setup(settings,withPose){
 let last;
 const localHand=await chooseLocal(new URL('assets/models/hand_landmarker.task',self.location.href).href);
 const handModels=localHand
  ?[new URL('assets/models/hand_landmarker.task',self.location.href).href,MODELS.hand]
  :[MODELS.hand];
 for(const host of PACKAGES){
  try{
   emit('progress',{part:'sdk',host});
   const sdk=await import(host+'/vision_bundle.mjs');
   const wasm=await sdk.FilesetResolver.forVisionTasks(host+'/wasm');
   emit('progress',{part:'hand-model',host});
   for(const model of handModels){
    try{
     hands=await sdk.HandLandmarker.createFromOptions(wasm,{
      baseOptions:{modelAssetPath:model,delegate:'CPU'},
      ...(canvas?{canvas}:{}),
      runningMode:'VIDEO',numHands:settings.maxHands||1,
      minHandDetectionConfidence:.55,minHandPresenceConfidence:.52,minTrackingConfidence:.56
     });
     version=host;
     running=true; // Hand tracking starts immediately while pose weights load separately.
     emit('ready',{host,part:'hand'});
     if(withPose){
      const localPose=new URL('assets/models/pose_landmarker_full.task',self.location.href).href;
      const list=(settings.poseModel==='full'
       ?[...(await chooseLocal(localPose)?[localPose]:[]),MODELS.full,MODELS.lite]
       :[MODELS.lite]);
      for(const url of list){
       try{
        emit('progress',{part:'body-model',host});
        pose=await sdk.PoseLandmarker.createFromOptions(wasm,{
         baseOptions:{modelAssetPath:url,delegate:'CPU'},...(canvas?{canvas}:{}),runningMode:'VIDEO',
         numPoses:1,minPoseDetectionConfidence:.54,minPosePresenceConfidence:.52,
         minTrackingConfidence:.56,outputSegmentationMasks:false
        });
        emit('pose-ready',{host});
        break;
       }catch(err){last=err}
      }
      if(!pose)emit('pose-error',{message:failText(last)});
     }
     return;
    }catch(error){last=error;emit('progress',{part:'hand-retry',message:failText(error)})}
   }
  }catch(error){last=error;emit('progress',{part:'sdk-retry',message:failText(error)})}
 }
 emit('init-error',{message:'Hand model unavailable: '+failText(last)});
}
self.onmessage=async event=>{
 const data=event.data||{};
 if(data.type==='init'){
  await setup(data.settings||{},Boolean(data.withPose));
  return;
 }
 if(data.type==='frame'){
  const bitmap=data.bitmap;
  const begin=performance.now();
  try{
   if(!running||!hands){
    emit('result',{seq:data.seq,hand:[],pose:null,inferenceMs:0,notReady:true});
    return;
   }
   const timestamp=Number.isFinite(data.timestamp)?data.timestamp:begin;
   const handResult=hands.detectForVideo(bitmap,timestamp);
   handFrames++;
   let posePoints=null,worldPoints=null;
   // Body tracking is optional and lower-frequency than hand tracking.
   if(pose&&data.poseDue){
    const poseResult=pose.detectForVideo(bitmap,timestamp);
    posePoints=poseResult?.landmarks?.[0]||[];
    worldPoints=poseResult?.worldLandmarks?.[0]||[];
    poseFrames++;
   }
   emit('result',{
    seq:data.seq,timestamp,hand:handResult?.landmarks||[],
    pose:posePoints,world:worldPoints,
    inferenceMs:Math.round((performance.now()-begin)*10)/10,
    handFrames,poseFrames
   });
  }catch(error){
   emit('frame-error',{seq:data.seq,message:failText(error)});
  }finally{bitmap?.close?.()}
  return;
 }
 if(data.type==='stop'){
  running=false;
  try{hands?.close?.()}catch(_){}
  try{pose?.close?.()}catch(_){}
  hands=null;pose=null;
  emit('stopped');
  self.close();
 }
};
