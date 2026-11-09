/* Patch Bags V4.9 — Worker-first, latest-frame-only tracker.
 * MediaPipe runs off the UI thread when Worker + OffscreenCanvas + ImageBitmap
 * are usable. Any initialization or inference failure falls back to the
 * existing on-device main-thread tracker with adaptive reduced-frequency mode.
 */
(()=>{
 'use strict';
 const legacy=window.PATCH_HAND_ASSIST;
 const policy=window.PATCH_TRACKING_PERFORMANCE;
 if(!legacy||!policy)return;
 let active=null,sequence=0;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function projected(points,session){
  const {video,stage,isFront}=session.options;
  const w=stage?.clientWidth||0,h=stage?.clientHeight||0;
  const vw=video?.videoWidth||0,vh=video?.videoHeight||0;
  if(!w||!h||!vw||!vh)return null;
  const scale=Math.max(w/vw,h/vh);
  const left=(w-vw*scale)/2,top=(h-vh*scale)/2;
  const mirrored=Boolean(isFront?.());
  return {points:points.map(pt=>({
   x:left+(mirrored?1-pt.x:pt.x)*vw*scale,
   y:top+pt.y*vh*scale,visibility:pt.visibility??1
  })),cover:scale,left,top,mirrored,videoWidth:vw,videoHeight:vh,
  stageWidth:w,stageHeight:h};
 }
 function deliverHand(session,groups){
  const {options}=session;
  const candidates=(groups||[]).filter(p=>p?.length===21)
   .map(p=>projected(p,session)).filter(Boolean);
  if(!candidates.length){
   if(++session.missed===4){
    session.state('noHand');options.onLost?.();session.motion.reset();
   }
   return;
  }
  session.missed=0;
  const previousGrip=session.grip;
  if(previousGrip)candidates.sort((a,b)=>distance(midpoint(a.points[4],a.points[8]),previousGrip)
   -distance(midpoint(b.points[4],b.points[8]),previousGrip));
  const target=candidates[0],points=target.points;
  const palmPx=distance(points[5],points[17]);
  if(!Number.isFinite(palmPx)||palmPx<8)return;
  const pinch=distance(points[4],points[8])<palmPx*.87;
  const grip=pinch?midpoint(points[4],points[8]):midpoint(points[2],points[5]);
  session.grip=grip;
  const calibration=options.getCalibration?.()||{};
  const palmCm=clamp(Number(calibration.palmCm)||8.5,6.5,11);
  const bagCm=clamp(Number(calibration.bagCm)||41.7,12,80);
  const fw=options.frame?.clientWidth||Math.min(target.stageWidth*.65,330);
  const fh=options.frame?.clientHeight||Math.min(target.stageHeight*.70,450);
  const apparent=clamp((palmPx*(bagCm/palmCm))/(fw*.75)*.74,.60,1.75);
  const angle=Math.atan2(points[17].y-points[5].y,points[17].x-points[5].x)*180/Math.PI;
  const adjusted=angle>90?angle-180:angle< -90?angle+180:angle;
  const candidate={
   x:grip.x-target.stageWidth/2,
   y:grip.y-target.stageHeight/2+.35*fh*apparent,
   scale:apparent,tilt:clamp(adjusted*.21,-7,7),
   gripX:grip.x,gripY:grip.y
  };
  const movement=session.motion.apply(candidate,performance.now());
  options.onAnchor?.(movement);
  options.onHand?.({...target,points,allHands:candidates.map(x=>x.points),
   grip,palmPx,pinching:pinch});
  session.state('tracking');
 }
 function deliverPose(session,points,world){
  const {options}=session;
  if(!points?.length){
   options.onPose?.(null);options.onPoseState?.('noBody');return;
  }
  const mapped=projected(points,session);
  if(!mapped)return;
  const left=mapped.points[11],right=mapped.points[12];
  const shoulder=(left?.visibility||0)>(right?.visibility||0)?left:right;
  options.onPose?.({...mapped,shoulder,hips:[mapped.points[23],mapped.points[24]],
   worldLandmarks:world||[]});
  options.onPoseState?.('tracking');
 }
 function stop(){
  sequence++;
  const s=active;active=null;
  if(!s){legacy.stop();return}
  if(s.raf)cancelAnimationFrame(s.raf);
  if(s.timer)clearTimeout(s.timer);
  s.worker?.terminate?.();
  s.worker=null;
  if(s.pendingResolve){s.pendingResolve(false);s.pendingResolve=null}
  legacy.stop();
 }
 function compatible(){
  return typeof Worker!=='undefined'&&typeof createImageBitmap==='function'&&
   typeof OffscreenCanvas!=='undefined'&&window.isSecureContext;
 }
 function start(options={}){
  stop();
  const id=++sequence;
  const profile=policy.profile(options.quality||'auto');
  const session={id,options,profile,worker:null,raf:0,timer:0,busy:false,
   motion:policy.makeMotionFilter(),budget:policy.makeBudget(profile),
   missed:0,grip:null,lastCapture:0,lastPose:0,lastVideoTime:-1,
   lastDiagnostic:0,frames:0,startedAt:performance.now(),errors:0,
   fallback:false,mode:'worker',lastState:'',pendingResolve:null};
  active=session;
  session.state=key=>{
   if(active===session&&session.lastState!==key){
    session.lastState=key;options.onState?.(key);
   }
  };
  session.state('loading');
  function still(){return active===session}
  function fallback(reason){
   if(!still()||session.fallback)return;
   session.fallback=true;session.mode='main';
   if(session.raf)cancelAnimationFrame(session.raf);
   if(session.timer)clearTimeout(session.timer);
   session.worker?.terminate?.();session.worker=null;
   options.onDiagnostics?.({part:'fallback',status:'loading',reason,
    mode:'main',profile:profile.name});
   session.state('loading');
   // Low-end devices start with low frame rates even in fallback mode.
   legacy.start({...options,performanceProfile:profile,quality:profile.name,
    onDiagnostics:info=>options.onDiagnostics?.({...info,mode:'main',profile:profile.name}),
    onState:state=>session.state(state)
   }).then(success=>{
    if(!still())return;
    session.state(success?'searching':'error');
    if(session.pendingResolve){session.pendingResolve(Boolean(success));session.pendingResolve=null}
   }).catch(err=>{
    if(!still())return;
    options.onError?.({part:'hand',detail:String(err?.message||err).slice(0,130)});
    session.state('error');
    if(session.pendingResolve){session.pendingResolve(false);session.pendingResolve=null}
   });
  }
  if(!compatible()){
   return new Promise(resolve=>{session.pendingResolve=resolve;fallback('Worker/OffscreenCanvas not supported')});
  }
  return new Promise(resolve=>{
   session.pendingResolve=resolve;
   try{
    const url=new URL('tracking-worker.js?v=4.9',document.baseURI);
    session.worker=new Worker(url,{type:'module'});
   }catch(error){fallback(String(error?.message||error));return}
   const worker=session.worker;
   session.timer=setTimeout(()=>fallback('Worker model initialization timed out'),29000);
   worker.onerror=event=>{
    event.preventDefault?.();
    fallback('Worker initialization failed');
   };
   worker.onmessage=event=>{
    if(!still()||session.fallback)return;
    const data=event.data||{};
    if(data.type==='progress'){
     options.onDiagnostics?.({part:data.part,status:'loading',mode:'worker',
      profile:profile.name});
     return;
    }
    if(data.type==='init-error'){fallback(data.message||'Worker unavailable');return}
    if(data.type==='ready'){
     clearTimeout(session.timer);session.timer=0;
     session.state('searching');
     options.onDiagnostics?.({part:'hand',status:'ready',mode:'worker',
      profile:profile.name,host:data.host});
     if(session.pendingResolve){session.pendingResolve(true);session.pendingResolve=null}
     pump();
     return;
    }
    if(data.type==='pose-ready'){options.onPoseState?.('searching');return}
    if(data.type==='pose-error'){
     options.onPoseState?.('error');
     options.onError?.({part:'body',detail:data.message||'Body model unavailable'});
     return;
    }
    if(data.type==='frame-error'){
     session.busy=false;
     if(++session.errors>=3)fallback(data.message||'Inference failed');
     return;
    }
    if(data.type==='result'){
     session.busy=false;session.errors=0;
     const now=performance.now();
     session.budget.observe(Number(data.inferenceMs)||0,now);
     session.frames++;
     deliverHand(session,data.hand||[]);
     if(data.pose!==null&&data.pose!==undefined)deliverPose(session,data.pose,data.world);
     if(now-session.lastDiagnostic>1100){
      const elapsed=Math.max(.001,(now-session.startedAt)/1000);
      options.onDiagnostics?.({
       part:'live',status:session.lastState,mode:'worker',
       inferenceMs:session.budget.inferenceMs,
       fps:Math.round((session.frames/elapsed)*10)/10,
       profile:profile.name,handFrames:session.frames,
       poseFrames:data.poseFrames||0
      });
      session.lastDiagnostic=now;
     }
    }
   };
   worker.postMessage({type:'init',settings:profile,withPose:Boolean(options.withPose)});
  });
  function pump(){
   if(!still()||session.fallback)return;
   session.raf=requestAnimationFrame(pump);
   const now=performance.now();
   const video=options.video;
   if(document.hidden||!video||video.readyState<2||!video.videoWidth)return;
   if(session.busy||now-session.lastCapture<session.budget.handMs||
      video.currentTime===session.lastVideoTime)return;
   session.busy=true;session.lastCapture=now;session.lastVideoTime=video.currentTime;
   const seq=++session.id;
   // Downsample before transfer when browser supports bitmap resizing.
   const scale=profile.idealWidth/video.videoWidth;
   const width=Math.min(video.videoWidth,profile.idealWidth);
   const height=Math.round(video.videoHeight*Math.min(1,scale));
   Promise.resolve().then(()=>createImageBitmap(video,{
    resizeWidth:Math.max(1,width),resizeHeight:Math.max(1,height),
    resizeQuality:'medium'
   })).catch(()=>createImageBitmap(video)).then(bitmap=>{
    if(!still()||session.fallback){bitmap?.close?.();return}
    const poseDue=Boolean(options.withPose)&&now-session.lastPose>=session.budget.poseMs;
    if(poseDue)session.lastPose=now;
    session.worker.postMessage({type:'frame',bitmap,seq,
     timestamp:Math.round(now),poseDue},[bitmap]);
   }).catch(error=>{
    session.busy=false;
    if(++session.errors>=3)fallback(String(error?.message||error).slice(0,100));
   });
  }
 }
 window.PATCH_HAND_ASSIST={
  start,stop,isActive:()=>Boolean(active),
  getStatus:()=>active?.lastState||'stopped',
  getMode:()=>active?.mode||'stopped'
 };
})();
