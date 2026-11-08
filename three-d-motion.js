/* Original automatic 3D review portal + editorial coverflow.
   No Framer runtime or third-party paid component code is copied. */
(()=>{
const on=()=>{
 const reviews=document.getElementById('patchWords');
 if(reviews&&!reviews.querySelector('.patch-stack3d-reviews')){
  const parent=reviews.querySelector('.patch-words-copy');
  if(parent){
   // These four authors and the substance of their words are grounded in
   // customer screenshots provided by the store owner. Arabic quotes are translated.
   // Stars below are decorative sparkles, NOT fabricated star ratings.
   const messages=[
    {
     text:"I bought one of your bags and it's super well made. Great job and keep going.",
     author:"Habeeba MH",source:"ORIGINAL ENGLISH · CUSTOMER FEEDBACK",
     image:"assets/new/ivory-tote-portrait-front.webp"
    },
    {
     text:"The bag is gorgeous. I really loved it. Beautiful work!",
     author:"Marian Imakethis",source:"TRANSLATED FROM ARABIC · CUSTOMER FEEDBACK",
     image:"assets/new/striped-tote-studio-angle.webp"
    },
    {
     text:"Wonderful material, finishing and sizing — even the white is beautifully bright.",
     author:"Haidy Elsherief",source:"TRANSLATED FROM ARABIC · CUSTOMER FEEDBACK",
     image:"assets/new/ivory-tote-lifestyle-carry.webp"
    },
    {
     text:"Such a beautiful piece, lovely material and amazing craftsmanship. Definitely not my last order!",
     author:"Mariam Ehab",source:"TRANSLATED FROM ARABIC · CUSTOMER FEEDBACK",
     image:"assets/new/ivory-tote-portrait.webp"
    }
   ];
   const scene=document.createElement('div');
   scene.className='patch-stack3d-reviews';
   scene.setAttribute('aria-label','Real customer testimonials in an automatic three-dimensional card stack');
   scene.innerHTML='<div class="patch-review-stack">'+messages.map((item,i)=>(
    '<article class="patch-stack-card" data-review-index="'+i+'" aria-hidden="'+(i===0?'false':'true')+'">'+
      '<div class="patch-stack-top"><span class="patch-stack-label">KIND WORDS / PATCH.BAGS</span>'+
        '<span class="patch-review-sparkles" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></span></div>'+
      '<blockquote>“'+item.text+'”</blockquote>'+
      '<footer><span class="patch-stack-author">'+item.author+'</span>'+
        '<span class="patch-stack-source">'+item.source+'</span></footer>'+
    '</article>'
   )).join('')+'</div>'+
   '<div class="patch-stack-progress" aria-hidden="true"><span></span></div>';
   parent.replaceWith(scene);
   const cards=[...scene.querySelectorAll('.patch-stack-card')];
   let active=0;
   const photo=reviews.querySelector('.patch-words-photo img');
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   let visible=true;
   function render(){
    cards.forEach((card,i)=>{
     const delta=(i-active+cards.length)%cards.length;
     card.classList.toggle('is-front',delta===0);
     card.classList.toggle('is-next',delta===1);
     card.classList.toggle('is-next2',delta===2);
     card.classList.toggle('is-back',delta===cards.length-1);
     card.setAttribute('aria-hidden',delta===0?'false':'true');
    });
    if(photo) {
     photo.src=messages[active].image;
     photo.alt='PatCh.BaGs handmade bag pictured beside a customer testimonial';
    }
   }
   render();
   if(!reduced){
    if('IntersectionObserver' in window){
     const observer=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting)}, {threshold:.08});
     observer.observe(reviews);
    }
    const progress=scene.querySelector('.patch-stack-progress span');
    setInterval(()=>{
     if(!visible||document.hidden)return;
     active=(active+1)%cards.length;
     render();
     if(progress){progress.classList.remove('is-restarting');void progress.offsetWidth;progress.classList.add('is-restarting');}
    },6500);
   }
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
