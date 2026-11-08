/* Mount the original React Bits Lanyard as an isolated React island on the
   existing PatCh.BaGs HTML/CSS website. CDN ESM dependencies are pinned.
   Header, hero and vanilla-JS commerce modules remain untouched. */
(async()=>{
  const stage=document.getElementById('patchReactBitsStrip');
  const mount=document.getElementById('patchReactBitsMount');
  if(!stage||!mount)return;
  try{
    const [React, reactDom, {default:Lanyard}]=await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('./Lanyard.js')
    ]);
    const root=reactDom.createRoot(mount);
    root.render(React.createElement(Lanyard,{
      className:'patch-original-reactbits-lanyard',
      frontImage:'./assets/reactbits/patch-tag-front.svg',
      backImage:'./assets/reactbits/patch-tag-back.svg',
      imageFit:'cover',
      cardColor:'#f8f7f1',
      orientation:'portrait',
      finish:'matte',
      cornerRadius:0.29,
      size:window.matchMedia('(max-width: 680px)').matches?0.43:0.60,
      anchor:'patch-right',
      strapLength:0.8,
      strapColor:'#7f9879',
      strapWidth:0.6,
      metal:'gold',
      gravity:1,
      damping:0.51,
      elasticity:0.58,
      breeze:0.24,
      interactive:true,
      intro:true
    }));
    // Hide the static loading emblem once the real WebGL canvas exists.
    const watcher=new MutationObserver(()=>{
      if(mount.querySelector('canvas')){
        stage.dataset.ready='true';
        watcher.disconnect();
      }
    });
    watcher.observe(mount,{childList:true,subtree:true});
    if(mount.querySelector('canvas')){stage.dataset.ready='true';watcher.disconnect();}
    window.addEventListener('pagehide',()=>{
      watcher.disconnect();
      root.unmount();
    },{once:true});
  }catch(error){
    stage.dataset.error='true';
    console.warn('The React Bits 3D tag is unavailable on this device.');
  }
})();
