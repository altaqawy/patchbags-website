/* Patch Bags V4.9 — adaptive visual tracking performance policy.
   Pure arithmetic/state: no ML SDK downloaded until Camera Preview starts.
   Auto uses public device capability hints, not fingerprinting / persistence.
 */
(()=>{
'use strict';
const PROFILES=Object.freeze({
 light:Object.freeze({name:'light',handMs:180,poseMs:950,idealWidth:640,idealHeight:480,maxHands:1,poseModel:'lite',maxFps:7}),
 balanced:Object.freeze({name:'balanced',handMs:115,poseMs:600,idealWidth:960,idealHeight:540,maxHands:1,poseModel:'lite',maxFps:10}),
 detail:Object.freeze({name:'detail',handMs:75,poseMs:350,idealWidth:1280,idealHeight:720,maxHands:2,poseModel:'full',maxFps:15})
});
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function profile(preference='auto',navigatorInfo=typeof navigator!=='undefined'?navigator:{}){
 if(Object.prototype.hasOwnProperty.call(PROFILES,preference))return PROFILES[preference];
 const mem=Number(navigatorInfo?.deviceMemory||0),cpu=Number(navigatorInfo?.hardwareConcurrency||0);
 if((mem&&mem<=4)||(cpu&&cpu<=4))return PROFILES.light;
 return PROFILES.balanced;
}
function makeBudget(settings=PROFILES.balanced){
 const p=settings||PROFILES.balanced;
 let handMs=p.handMs,poseMs=p.poseMs,inferAvg=0,count=0,lastAdapt=0;
 function observe(duration,now=0){
  if(!Number.isFinite(duration)||duration<0)return;
  inferAvg=count?inferAvg*.83+duration*.17:duration;
  count++;
  // Adapt conservatively: 3-second windows prevent rapid quality switching.
  if(count<8||now-lastAdapt<3000)return;
  lastAdapt=now;
  if(inferAvg>handMs*.75){
   handMs=Math.min(340,Math.round(handMs*1.22));
   poseMs=Math.min(1400,Math.round(poseMs*1.16));
  }else if(inferAvg<handMs*.27&&handMs>p.handMs){
   handMs=Math.max(p.handMs,Math.round(handMs*.92));
   poseMs=Math.max(p.poseMs,Math.round(poseMs*.95));
  }
 }
 return {get handMs(){return handMs},get poseMs(){return poseMs},
  get inferenceMs(){return Math.round(inferAvg)},
  get status(){return {handMs,poseMs,inferenceMs:Math.round(inferAvg),count}},
  observe};
}
// Adaptive one-euro-like filter. Near-stationary points get heavy smoothing,
// fast motion receives less smoothing, avoiding the lag of fixed 0.24 EMA.
function makeMotionFilter(){
 let last=null,lastAt=0;
 return {
  apply(next,now=0){
   if(!last||now-lastAt>650||now<lastAt){last={...next};lastAt=now;return {...next}}
   const dt=clamp((now-lastAt)/1000,.015,.2);
   const movement=Math.hypot((next.x-last.x)/dt,(next.y-last.y)/dt);
   const gain=clamp(.20+movement/1100,.20,.83);
   const result={...next};
   for(const k of ['x','y','scale','tilt']){
    if(Number.isFinite(next[k])&&Number.isFinite(last[k])){
     result[k]=last[k]+(next[k]-last[k])*gain;
    }
   }
   last={...result};lastAt=now;
   return result;
  },
  reset(){last=null;lastAt=0}
 };
}
window.PATCH_TRACKING_PERFORMANCE={PROFILES,profile,makeBudget,makeMotionFilter};
})();