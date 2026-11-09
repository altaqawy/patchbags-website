/* Patch Bags V4.7 — Live finger-foreground compositor.
 * Video pixels are copied only into temporary on-screen canvas regions selected
 * from MediaPipe hand landmarks, never stored, recorded or uploaded.
 * 2D finger occlusion is approximate; the GLB does not have a deformable strap rig.
 */
(()=>{
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function mount({stage,video}={}){
  if(!stage||!video)return null;
  const canvas=document.createElement('canvas');
  canvas.className='patch-cp-finger-occlusion';
  canvas.setAttribute('aria-hidden','true');
  canvas.hidden=true;
  stage.appendChild(canvas);
  const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
  let enabled=true;
  function clear(){
   if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
   canvas.hidden=true;
  }
  function setEnabled(flag){
   enabled=Boolean(flag);
   if(!enabled)clear();
  }
  function fingerPath(points,indices,width){
   const first=points[indices[0]];
   if(!first)return;
   ctx.beginPath();
   ctx.moveTo(first.x,first.y);
   for(let i=1;i<indices.length;i++){
    const pt=points[indices[i]];
    if(!pt)return;
    ctx.lineTo(pt.x,pt.y);
   }
   ctx.lineWidth=width;
   ctx.lineJoin='round';
   ctx.lineCap='round';
   ctx.stroke();
  }
  function draw(hand){
   if(!ctx||!enabled||!hand||!video.videoWidth||video.readyState<2){
    clear();return false;
   }
   const width=stage.clientWidth,height=stage.clientHeight;
   if(!width||!height||!Array.isArray(hand.points)||hand.points.length!==21){
    clear();return false;
   }
   const dpr=clamp(Math.min(window.devicePixelRatio||1,1.3,900/width),.5,1.3);
   const pixelW=Math.max(1,Math.round(width*dpr));
   const pixelH=Math.max(1,Math.round(height*dpr));
   if(canvas.width!==pixelW||canvas.height!==pixelH){
    canvas.width=pixelW;canvas.height=pixelH;
   }
   ctx.setTransform(dpr,0,0,dpr,0,0);
   ctx.globalCompositeOperation='source-over';
   ctx.clearRect(0,0,width,height);
   const points=hand.points;
   const palm=clamp(hand.palmPx,22,190);
   try{
    // Reveal the actual fingers/palm from the camera ABOVE the model's handle.
    // Restrict the foreground to the hand-grip area to avoid hiding the bag.
    ctx.save();
    ctx.fillStyle='#fff';ctx.strokeStyle='#fff';
    fingerPath(points,[1,2,3,4],clamp(palm*.24,9,36));
    fingerPath(points,[5,6,7,8],clamp(palm*.19,8,31));
    fingerPath(points,[9,10,11,12],clamp(palm*.16,7,27));
    const web={x:(points[2].x+points[5].x)/2,y:(points[2].y+points[5].y)/2};
    ctx.beginPath();ctx.ellipse(web.x,web.y,palm*.19,palm*.18,0,0,Math.PI*2);ctx.fill();
    ctx.globalCompositeOperation='source-in';
    // Match <video object-fit:cover> including front-camera mirroring.
    if(hand.mirrored){ctx.translate(width,0);ctx.scale(-1,1)}
    ctx.drawImage(video,hand.left,hand.top,
      hand.videoWidth*hand.cover,hand.videoHeight*hand.cover);
    ctx.restore();
    ctx.save();
    ctx.globalCompositeOperation='destination-in';
    const grip=hand.grip;
    const radius=palm*1.52;
    const radial=ctx.createRadialGradient(grip.x,grip.y,radius*.50,
      grip.x,grip.y,radius);
    radial.addColorStop(0,'rgba(255,255,255,1)');
    radial.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=radial;
    ctx.fillRect(grip.x-radius,grip.y-radius,radius*2,radius*2);
    ctx.restore();
    canvas.hidden=false;
    return true;
   }catch(_){
    // Some browsers block drawing a video frame; retain normal 3D and manual controls.
    clear();return false;
   }
  }
  function dispose(){clear();canvas.remove()}
  return {draw,clear,setEnabled,dispose,isEnabled:()=>enabled,element:canvas};
 }
 window.PATCH_GRIP_OCCLUSION={mount};
})();