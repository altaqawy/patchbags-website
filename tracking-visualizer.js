/* Patch Bags V4.8 — on-device live tracking diagnostics.
 * Visible hand (21) + body (33) landmarks prove that models are actually running.
 * No camera frames, images or biometrics are stored or uploaded.
 */
(()=>{
'use strict';
const handEdges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
const bodyEdges=[[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
function mount({stage}={}){
 if(!stage)return null;
 const canvas=document.createElement('canvas');
 canvas.className='patch-cp-landmark-overlay';
 canvas.setAttribute('aria-hidden','true');
 canvas.hidden=true;stage.appendChild(canvas);
 const ctx=canvas.getContext('2d',{alpha:true,desynchronized:true});
 let visible=true,lastBody=[],lastHands=[],ratio=1;
 function resize(){
  if(!ctx)return false;
  const w=stage.clientWidth,h=stage.clientHeight;
  if(!w||!h)return false;
  ratio=Math.max(.5,Math.min(window.devicePixelRatio||1,1.5,900/w));
  const pw=Math.round(w*ratio),ph=Math.round(h*ratio);
  if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph}
  ctx.setTransform(ratio,0,0,ratio,0,0);
  return true;
 }
 function clear(){
  if(ctx)ctx.clearRect(0,0,canvas.width,canvas.height);
  canvas.hidden=true;lastHands=[];lastBody=[];
 }
 function paint(){
  if(!ctx||!visible||!resize()){canvas.hidden=true;return}
  const w=stage.clientWidth,h=stage.clientHeight;
  ctx.clearRect(0,0,w,h);
  const draw=(points,edges,color)=>{
   if(!points?.length)return;
   ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=2.0;
   for(const [a,b] of edges){
    const x=points[a],y=points[b];
    if(!x||!y)continue;
    ctx.beginPath();ctx.moveTo(x.x,x.y);ctx.lineTo(y.x,y.y);ctx.stroke();
   }
   points.forEach((p,i)=>{
    if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
    if(i>20&&points.length===33&&i%2) return; // simplify body landmarks
    ctx.beginPath();ctx.arc(p.x,p.y,points.length===33?3:2.5,0,Math.PI*2);ctx.fill();
   });
  };
  lastBody.forEach(body=>draw(body,bodyEdges,'rgba(250,181,93,.96)'));
  lastHands.forEach(hand=>draw(hand,handEdges,'rgba(139,255,169,.98)'));
  canvas.hidden=!lastBody.length&&!lastHands.length;
 }
 function setVisible(next){visible=Boolean(next);if(!visible)clear();else paint()}
 function hands(points){lastHands=Array.isArray(points?.[0])?points:points?[points]:[];paint()}
 function pose(points){lastBody=Array.isArray(points?.[0])?points:points?[points]:[];paint()}
 function dispose(){clear();canvas.remove()}
 return {hands,pose,clear,dispose,setVisible,isVisible:()=>visible};
}
window.PATCH_TRACKING_OVERLAY={mount};
})();