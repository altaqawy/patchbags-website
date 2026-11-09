/* Patch Bags V5.0 — local camera compositor for Android/slow 3D overlays.
 * Draws lower-resolution frames from the already-approved local camera into a
 * visible canvas. No storage, no recording, no upload, no second camera stream.
 * Can switch back to native video at any time without restarting tracking.
 */
(()=>{
 'use strict';
 const clamp=(v,a,b)=>Math.min(Math.max(v,a),b);
 function mount({video,stage,onFailure}={}){
  if(!video||!stage)return null;
  const canvas=document.createElement('canvas');
  canvas.className='patch-cp-camera-canvas';
  canvas.hidden=true;canvas.setAttribute('aria-hidden','true');
  stage.appendChild(canvas);
  const ctx=canvas.getContext('2d',{alpha:false,desynchronized:true});
  let enabled=false,frame=0,last=0,failed=false,frames=0,lastReport=0;
  let fps=10,renderWidth=480,raf=0;
  function setQuality(level){
   fps=level==='light'?8:level==='detail'?14:11;
   renderWidth=level==='light'?384:level==='detail'?640:480;
  }
  function stop(){
   enabled=false;
   if(raf){cancelAnimationFrame(raf);raf=0}
   canvas.hidden=true;stage.dataset.videoRender='native';
  }
  function draw(now){
   if(!enabled)return;
   raf=requestAnimationFrame(draw);
   if(!ctx||document.hidden||video.readyState<2||
      !video.videoWidth||!stage.clientWidth||!stage.clientHeight)return;
   if(now-last<1000/fps)return;
   last=now;
   const w=stage.clientWidth,h=stage.clientHeight;
   const scaled=Math.min(1,renderWidth/w);
   const width=Math.max(1,Math.round(w*scaled));
   const height=Math.max(1,Math.round(h*scaled));
   if(canvas.width!==width||canvas.height!==height){
    canvas.width=width;canvas.height=height;
   }
   const vw=video.videoWidth,vh=video.videoHeight;
   const scale=Math.max(w/vw,h/vh);
   const sourceW=w/scale,sourceH=h/scale;
   const sx=clamp((vw-sourceW)/2,0,vw),sy=clamp((vh-sourceH)/2,0,vh);
   try{
    ctx.drawImage(video,sx,sy,sourceW,sourceH,0,0,width,height);
    if(canvas.hidden)canvas.hidden=false;
    frames++;
    if(now-lastReport>1500){frame=frames;frames=0;lastReport=now}
   }catch(error){
    if(!failed){
     failed=true;
     onFailure?.(String(error?.message||error).slice(0,110));
    }
    stop();
   }
  }
  function start(quality='balanced'){
   if(!ctx){onFailure?.('Camera canvas context unavailable');return false}
   if(enabled){setQuality(quality);return true}
   failed=false;setQuality(quality);enabled=true;
   stage.dataset.videoRender='canvas';
   raf=requestAnimationFrame(draw);
   return true;
  }
  function dispose(){stop();canvas.remove()}
  return {start,stop,dispose,setQuality,isActive:()=>enabled,getFPS:()=>frame};
 }
 window.PATCH_CAMERA_COMPOSITOR={mount};
})();