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
    // Reserve the editorial text column in both languages. Move the original
    // interactive 3D tag into the opposite photographic margin, with a
    // modest 10–11% larger ID on tablet/desktop while mobile stays unchanged.
    const phone=window.matchMedia('(max-width: 680px)');
    const tablet=window.matchMedia('(max-width: 1100px)');
    const renderLanyard=()=>{
      const arabic=document.documentElement.lang==='ar';
      const anchor=phone.matches
        ?(arabic?'patch-hero-safe-left-mobile':'patch-hero-safe-right-mobile')
        :tablet.matches
          ?(arabic?'patch-hero-safe-left-tablet':'patch-hero-safe-right-tablet')
          :(arabic?'patch-hero-safe-left':'patch-hero-safe-right');
      root.render(React.createElement(Lanyard,{
        className:'patch-original-reactbits-lanyard',
        frontImage:'./assets/reactbits/patch-tag-front.svg',
        backImage:'./assets/reactbits/patch-tag-back.svg',
        imageFit:'cover',
        cardColor:'#f8f7f1',
        orientation:'portrait',
        finish:'matte',
        cornerRadius:0.29,
        size:phone.matches?0.24:tablet.matches?0.33:0.39,
        anchor,
        strapLength:phone.matches?0.018:0.052,
        strapColor:'#596d59',
        strapWidth:0.44,
        metal:'gold',
        gravity:1,
        damping:0.55,
        elasticity:0.48,
        breeze:0.13,
        interactive:true,
        intro:true
      }));
    };
    renderLanyard();
    // Preserve component state and physics when the customer changes language
    // or device orientation: change props instead of mounting a second canvas.
    document.addEventListener('patch:language-changed',renderLanyard);
    phone.addEventListener('change',renderLanyard);
    tablet.addEventListener('change',renderLanyard);
    // Record when the real WebGL canvas exists; the hero has no loading emblem.
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
      document.removeEventListener('patch:language-changed',renderLanyard);
      phone.removeEventListener('change',renderLanyard);
      tablet.removeEventListener('change',renderLanyard);
      root.unmount();
    },{once:true});
  }catch(error){
    stage.dataset.error='true';
    console.warn('The React Bits 3D tag is unavailable on this device.');
  }
})();
