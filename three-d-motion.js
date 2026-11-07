/* Original automatic 3D review portal + editorial coverflow.
   No Framer runtime or third-party paid component code is copied. */
(()=>{
const on=()=>{
 const reviews=document.getElementById('patchWords');
 if(reviews&&!reviews.querySelector('.patch-tunnel-reviews')){
  const parent=reviews.querySelector('.patch-words-copy');
  if(parent){
   const quoteText=[
    ['I bought one of your bags and it’s super well made. Great job and keep going.','ORIGINAL CUSTOMER MESSAGE'],
    ['Thank you — amazing quality.','ORIGINAL CUSTOMER MESSAGE'],
    ['The bag is absolutely gorgeous. I was genuinely happy with it.','TRANSLATED CUSTOMER MESSAGE'],
    ['Lovely material and finishing. Such a beautiful bright white.','TRANSLATED CUSTOMER MESSAGE']
   ];
   const scene=document.createElement('div');scene.className='patch-tunnel-reviews';scene.setAttribute('aria-label','Customer feedback in an automatic 3D gallery');
   scene.innerHTML='<i class="patch-portal right" aria-hidden="true"></i><i class="patch-portal left" aria-hidden="true"></i><div class="patch-review-space">'+quoteText.map(([q,who],i)=>'<article style="--index:'+i+'" aria-hidden="'+(i!==0)+'"><p class="quote">“'+q+'”</p><small>'+who+'</small></article>').join('')+'</div>';
   parent.replaceWith(scene);
   const photo=reviews.querySelector('.patch-words-photo');if(photo){photo.style.minHeight='370px';}
   // The previous review's auto-rotation is disabled after its elements are replaced.
   // A screen reader announcement would otherwise constantly interrupt reading.
  }
 }
 const lookbook=document.querySelector('.lookbook-section');
 if(lookbook && !document.getElementById('patchCms3d')){
  const srcs=[
   ['assets/new/ivory-tote-lifestyle-carry.webp','Everyday carry'],
   ['assets/new/striped-tote-studio-angle.webp','The handmade edit'],
   ['assets/new/round-crossbody-red.webp','A pop of color'],
   ['assets/new/monogram-cream-s.webp','Made personal'],
   ['assets/new/phone-pouch-mustard.webp','Little essentials'],
   ['assets/new/blush-tote-scarf-closeup.webp','Soft details']
  ];
  const section=document.createElement('section');section.className='patch-cms3d';section.id='patchCms3d';section.setAttribute('aria-label','Automatic 3D collection photo carousel');
  section.innerHTML='<p class="patch-cms-eyebrow">THE PATCH COLLECTION</p><h2>In every <em>detail.</em></h2><div class="patch-cms3d-stage">'+srcs.map(([src,title],i)=>'<figure class="patch-cms3d-card"><img src="'+src+'" alt="'+title+'" loading="lazy"><figcaption>'+title+'</figcaption></figure>').join('')+'</div><div class="patch-cms3d-progress" aria-hidden="true"></div>';
  lookbook.after(section);
  const cards=[...section.querySelectorAll('.patch-cms3d-card')];let index=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const render=()=>cards.forEach((card,i)=>{
    let delta=((i-index+cards.length+Math.floor(cards.length/2))%cards.length)-Math.floor(cards.length/2);
    const abs=Math.abs(delta);
    card.style.transform='translateX('+(delta*Math.min(window.innerWidth*.3,265))+'px) translateZ('+(-abs*100)+'px) rotateY('+(-delta*19)+'deg) scale('+(1-abs*.12)+')';
    card.style.opacity=abs<=2?'1':'0';card.style.filter=abs?'brightness(.87)':'brightness(1)';card.style.zIndex=String(20-abs);
  });
  render();if(!reduced){let visible=true;const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false},{threshold:.05});observer.observe(section);
   setInterval(()=>{if(visible){index=(index+1)%cards.length;render()}},4600);}
 }
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',on);else on();
})();
