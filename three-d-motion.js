/* Original automatic 3D review depth cards + editorial coverflow.
   No Framer runtime or third-party paid component code is copied. */
(()=>{
window.PATCH_3D_REVIEWS=true;
const on=()=>{

 const reviews=document.getElementById('patchWords');
 if(reviews && !reviews.querySelector('.patch-depth-reviews')){
  const oldCopy=reviews.querySelector('.patch-words-copy');
  if(oldCopy){
   // Grounded in the owner's supplied customer screenshots. Decorative star
   // sparkles are NOT star ratings. Translated messages are labelled.
   const feedback=[
    {name:'Habeeba MH',quote:"I bought one of your bags and it's super well made. Great job and keep going.",source:'ORIGINAL ENGLISH MESSAGE'},
    {name:'Haidy Elsherief',quote:'The bag is amazing — the material, finishing and bright white color.',source:'TRANSLATED FROM ARABIC'},
    {name:'Marian Imakethis',quote:'The bag is absolutely gorgeous. I was genuinely so happy with it.',source:'TRANSLATED FROM ARABIC'},
    {name:'Heba Sabry',quote:'The bag is a masterpiece. The craftsmanship is incredibly delicate.',source:'TRANSLATED FROM ARABIC'},
    {name:'Mariam Ehab',quote:'A beautiful piece with lovely materials and such thoughtful finishing.',source:'TRANSLATED FROM ARABIC'}
   ];
   const related=[
    'assets/new/ivory-tote-portrait-front.webp',
    'assets/new/striped-tote-studio-angle.webp',
    'assets/new/ivory-tote-lifestyle-carry.webp',
    'assets/new/monogram-cream-s.webp',
    'assets/new/blush-tote-scarf-closeup.webp'
   ];
   const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   reviews.classList.add('patch-scroll-reviews');
   reviews.style.setProperty('--review-steps',String(feedback.length-1));
   const stage=document.createElement('div');
   stage.className='patch-depth-reviews';
   stage.setAttribute('role','group');
   stage.setAttribute('aria-label','Real customer reviews displayed as you scroll down this section');
   stage.innerHTML='<div class="patch-review-space" aria-live="off">'+feedback.map((r,i)=>
    '<article class="patch-depth-card" data-review-index="'+i+'" aria-hidden="'+(i!==0)+'">'+
      '<div class="patch-review-card-top">'+
        '<span class="patch-review-card-label">WORDS WE TREASURE</span>'+
        '<span class="patch-review-sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></span>'+
      '</div>'+
      '<blockquote class="quote">“'+escape(r.quote)+'”</blockquote>'+
      '<div class="patch-review-byline"><span class="patch-review-initial">'+escape(r.name.slice(0,1))+'</span>'+
        '<div><strong>'+escape(r.name)+'</strong><small>'+escape(r.source)+'</small></div>'+
      '</div>'+
    '</article>').join('')+'</div>'+
    '<div class="patch-review-scroll-status" aria-hidden="true"><span class="patch-review-scroll-label">SCROLL TO READ ↓</span><span class="patch-review-scroll-number">01 / 0'+feedback.length+'</span></div>'+
    '<div class="patch-review-scroll-track" aria-hidden="true"><span></span></div>';
   oldCopy.replaceWith(stage);
   const cards=Array.from(stage.querySelectorAll('.patch-depth-card'));
   const counter=stage.querySelector('.patch-review-scroll-number');
   const progress=stage.querySelector('.patch-review-scroll-track span');
   const photo=reviews.querySelector('.patch-words-photo img');
   let active=-1;
   const renderActive=index=>{
    if(index===active)return;
    active=index;
    cards.forEach((card,i)=>{
     card.classList.toggle('is-active',i===active);
     card.classList.toggle('is-previous',i===active-1);
     card.classList.toggle('is-next',i===active+1);
     card.setAttribute('aria-hidden',String(i!==active));
    });
    if(photo && related[index] && photo.getAttribute('src')!==related[index]){
     photo.src=related[index];
     photo.alt='Handmade PatCh.BaGs item accompanying the customer feedback';
    }
    if(counter)counter.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');
    if(progress)progress.style.transform='scaleX('+((index+1)/cards.length)+')';
   };
   const computeIndex=()=>{
    // Use native page scrolling, not wheel capture or a timed carousel.
    const rect=reviews.getBoundingClientRect();
    const viewport=Math.max(1,window.innerHeight||document.documentElement.clientHeight);
    const travel=Math.max(1,rect.height-viewport);
    const ratio=Math.min(1,Math.max(0,-rect.top/travel));
    return Math.min(cards.length-1,Math.floor(ratio*cards.length));
   };
   let frame=0;
   const update=()=>{
    frame=0;
    if(!stage.isConnected)return;
    renderActive(computeIndex());
   };
   const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
   renderActive(0);
   window.addEventListener('scroll',schedule,{passive:true});
   window.addEventListener('resize',schedule,{passive:true});
   schedule();
  }
 }
 const lookbook=document.querySelector('.lookbook-section');
 if(lookbook && !document.getElementById('patchCms3d')){
  const fallbackSrcs=[
   ['assets/new/ivory-tote-lifestyle-carry.webp','Everyday carry'],
   ['assets/new/striped-tote-studio-angle.webp','The handmade edit'],
   ['assets/new/round-crossbody-red.webp','A pop of color'],
   ['assets/new/monogram-cream-s.webp','Made personal'],
   ['assets/new/phone-pouch-mustard.webp','Little essentials'],
   ['assets/new/blush-tote-scarf-closeup.webp','Soft details']
  ];
  const srcs=(typeof products!=='undefined' && Array.isArray(products) && products.length) ? products.slice(0,8).map(p=>[p.images?.[1]||p.image, p.name]) : fallbackSrcs;
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
