/* PatCh.BaGs – original lightweight hanging signature tag.
   Drag the card to pull its woven rope, release to swing, tap/press Enter to flip.
   Inspired by the interaction principles of React Bits Lanyard; no vendor code copied.
   No WebGL, React, or extra dependencies on the public static storefront. */
(()=>{
  "use strict";
  const init=()=>{
    const stage=document.getElementById('patchLanyardStage');
    if(!stage||stage.dataset.initialized)return;
    stage.dataset.initialized='true';
    const rig=stage.querySelector('.patch-lanyard-rig');
    const front=stage.querySelector('.patch-lanyard-front');
    const rope=stage.querySelectorAll('.patch-lanyard-strap path');
    const svg=stage.querySelector('.patch-lanyard-strap');
    const flip=stage.querySelector('[data-patch-lanyard-flip]');
    if(!rig||!front||!svg||rope.length===0)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let x=0,y=0,vx=0,vy=0,dragging=false,moved=false,flipped=false;
    let active=!reduced,frame=0,last=0,dragX=0,dragY=0,lastMove=0;
    let pointerId=null,downX=0,downY=0;
    let width=0,height=0,rigHeight=0;
    const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
    function dimensions(){
      const bounds=stage.getBoundingClientRect();
      width=bounds.width;height=bounds.height;rigHeight=rig.getBoundingClientRect().height||230;
      svg.setAttribute('viewBox','0 0 '+width+' '+height);
      render(performance.now());
    }
    function render(t){
      const z=clamp(-x*.07-vx*.65,-17,17);
      const rx=clamp(-y*.06+vy*.35,-11,11);
      rig.style.transform='translate3d(calc(-50% + '+x.toFixed(2)+'px),calc(-50% + '+y.toFixed(2)+'px),0) rotateZ('+z.toFixed(2)+'deg) rotateX('+rx.toFixed(2)+'deg)';
      const sx=width/2,sy=10;
      const ex=width/2+x,ey=height*.56+y-rigHeight/2-17;
      const mid=sy+(ey-sy)*.5;
      const bend=x*.23+(dragging?x*.05:Math.sin(t*.0014)*3);
      const d='M '+sx.toFixed(1)+' '+sy+' C '+(sx+bend*.7).toFixed(1)+' '+(mid-31).toFixed(1)+', '+(ex-bend*.85).toFixed(1)+' '+(mid+24).toFixed(1)+', '+ex.toFixed(1)+' '+ey.toFixed(1);
      rope.forEach(path=>path.setAttribute('d',d));
    }
    function animate(t){
      frame=0;
      if(!document.contains(stage))return;
      const dt=clamp(last?(t-last)/16.67:1,.1,2);last=t;
      if(!dragging&&!reduced){
        const tx=Math.sin(t*.00097)*9+Math.sin(t*.00041)*3;
        const ty=Math.cos(t*.00076)*3;
        vx=clamp((vx+(tx-x)*.028*dt)*Math.pow(.91,dt),-20,20);
        vy=clamp((vy+(ty-y)*.039*dt)*Math.pow(.89,dt),-20,20);
        x+=vx*dt;y+=vy*dt;
      }
      render(t);
      if((dragging||(!reduced&&active))&&!document.hidden)frame=requestAnimationFrame(animate);
    }
    const start=()=>{
      if(!frame&&!document.hidden){
        last=0;
        frame=requestAnimationFrame(animate);
      }
    };
    function toggleFlip(){
      flipped=!flipped;
      rig.classList.toggle('is-flipped',flipped);
      flip?.setAttribute('aria-pressed',String(flipped));
      rig.setAttribute('aria-label',flipped?'PatCh.BaGs tag, back side. Activate to see the front.':'PatCh.BaGs hanging tag. Activate to see the back.');
    }
    rig.addEventListener('pointerdown',event=>{
      if(event.button!==0&&event.pointerType==='mouse')return;
      if(event.target.closest('a'))return;
      pointerId=event.pointerId;dragging=true;moved=false;
      downX=event.clientX;downY=event.clientY;dragX=x;dragY=y;vx=0;vy=0;lastMove=performance.now();
      rig.classList.add('is-dragging');
      rig.setPointerCapture(event.pointerId);
      start();
    });
    rig.addEventListener('pointermove',event=>{
      if(!dragging||event.pointerId!==pointerId)return;
      const deltaX=event.clientX-downX,deltaY=event.clientY-downY;
      if(Math.abs(deltaX)>7||Math.abs(deltaY)>7)moved=true;
      const nextX=clamp(dragX+deltaX,-width*.33,width*.33);
      const nextY=clamp(dragY+deltaY,-height*.21,height*.24);
      const now=performance.now(),dt=Math.max(1,(now-lastMove)/16.67);
      vx=clamp((nextX-x)/dt*0.56,-17,17);
      vy=clamp((nextY-y)/dt*.56,-17,17);
      x=nextX;y=nextY;lastMove=now;
      render(now);
    });
    function release(event){
      if(!dragging||event.pointerId!==pointerId)return;
      dragging=false;pointerId=null;rig.classList.remove('is-dragging');
      if(rig.hasPointerCapture(event.pointerId))rig.releasePointerCapture(event.pointerId);
      if(!moved)toggleFlip();
      if(!reduced)start();
    }
    rig.addEventListener('pointerup',release);
    rig.addEventListener('pointercancel',event=>{
      if(event.pointerId!==pointerId)return;
      dragging=false;pointerId=null;rig.classList.remove('is-dragging');
      if(!reduced)start();
    });
    rig.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();toggleFlip();
      }
    });
    flip?.addEventListener('click',toggleFlip);
    if('ResizeObserver' in window)new ResizeObserver(dimensions).observe(stage);
    else window.addEventListener('resize',dimensions,{passive:true});
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{
        active=Boolean(entries[0]?.isIntersecting);
        if(active)start();
        else if(frame&&!dragging){cancelAnimationFrame(frame);frame=0;}
      },{threshold:.02}).observe(stage);
    }
    dimensions();
    if(!reduced)start();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
