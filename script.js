'use strict';

// Website concept uses the customer's own photographs. Product labels are editable
// working names, not confirmed SKU names or claims of inventory/pricing.
const products = [
  {"id":"PB-01","name":"The Signature Striped Tote","category":"bags","label":"HANDMADE COTTON ROPE TOTE","tag":"Signature piece","images":["assets/new/striped-tote-studio-front.webp","assets/new/striped-tote-studio-angle.webp","assets/new/striped-tote-clasp-closeup.webp","assets/new/striped-tote-label-closeup.webp","assets/new/striped-tote-inside.webp","assets/new/striped-tote-capacity.webp"],"description":"A striped cotton-rope tote with a sculptural flap and distinctive clasp. Explore the weave, finishing and inner space through the photo gallery.","image":"assets/new/striped-tote-studio-front.webp"},
  {"id":"PB-02","name":"The Ivory Sculpted Tote","category":"bags","label":"HANDMADE COTTON ROPE TOTE","tag":"In the spotlight","images":["assets/new/ivory-tote-portrait-front.webp","assets/new/ivory-tote-portrait.webp","assets/new/ivory-tote-lifestyle-raised.webp","assets/new/ivory-tote-lifestyle-carry.webp","assets/new/ivory-tote-orange-lifestyle.webp","assets/new/ivory-tote-knot-closeup.webp","assets/new/ivory-tote-shoulder-detail.webp"],"description":"An ivory-toned woven tote with a sculptural front flap. The gallery shows close-up texture and different ways to wear or hold it.","image":"assets/new/ivory-tote-portrait-front.webp"},
  {"id":"PB-03","name":"The Blush Striped Tote","category":"bags","label":"PINK STRIPED HANDMADE TOTE","tag":"Soft color story","images":["assets/blush-cotton-tote.webp","assets/new/blush-tote-scarf-closeup.webp","assets/new/blush-tote-hand-detail.webp","assets/new/blush-tote-label-detail.webp"],"description":"A soft pink-and-ivory striped tote with textured cotton-rope detailing. See the decorative scarf and the handmade brand tag in close-up.","image":"assets/blush-cotton-tote.webp"},
  {"id":"PB-04","name":"The Taupe Crescent Crossbody","category":"bags","label":"WOVEN CROSSBODY","tag":"Everyday texture","images":["assets/new/crescent-crossbody-taupe.webp"],"description":"A compact woven crossbody in an earthy taupe shade, with a statement curved flap and detachable-style strap fittings shown in the photo.","image":"assets/new/crescent-crossbody-taupe.webp"},
  {"id":"PB-05","name":"The Ivory Crescent Crossbody","category":"bags","label":"WOVEN CROSSBODY","tag":"A soft neutral","images":["assets/new/crescent-crossbody-ivory.webp"],"description":"A light ivory crossbody with a curved woven flap and long matching strap, photographed from above.","image":"assets/new/crescent-crossbody-ivory.webp"},
  {"id":"PB-06","name":"The Ruby Crescent Crossbody","category":"bags","label":"WOVEN CROSSBODY","tag":"A pop of color","images":["assets/new/round-crossbody-red.webp"],"description":"A vivid red woven crossbody with a sculptural flap, styled on a wooden display.","image":"assets/new/round-crossbody-red.webp"},
  {"id":"PB-07","name":"The Round Crossbody","category":"bags","label":"COTTON ROPE CROSSBODY","tag":"A timeless shape","images":["assets/round-crossbody-sun.webp","assets/round-crossbody-lifestyle.webp"],"description":"A round cotton-rope crossbody featuring concentric woven lines and a compact shape.","image":"assets/round-crossbody-sun.webp"},
  {"id":"PB-08","name":"The Mustard Phone Pouch","category":"accessories","label":"COTTON ROPE PHONE POUCH","tag":"Hands-free essential","images":["assets/new/phone-pouch-mustard.webp"],"description":"A small mustard-yellow woven pouch with a matching long cord strap and wooden-button closure.","image":"assets/new/phone-pouch-mustard.webp"},
  {"id":"PB-09","name":"The Natural Phone Pouch","category":"accessories","label":"COTTON ROPE PHONE POUCH","tag":"Naturally simple","images":["assets/new/phone-pouch-natural.webp"],"description":"A natural-toned woven pouch with a long matching cord strap and wooden button.","image":"assets/new/phone-pouch-natural.webp"},
  {"id":"PB-10","name":"The Initial Zip Pouch","category":"personalized","label":"MONOGRAM ACCESSORY","tag":"Make it yours","images":["assets/new/monogram-black-h.webp","assets/new/monogram-cream-s.webp","assets/personalized-pouch.webp"],"description":"Personalized initial pouches in different fabrics and colors. The photographs show examples with H and S initials; ask the studio about available letters.","image":"assets/new/monogram-black-h.webp"},
  {"id":"PB-11","name":"The Chapter Book Sleeve","category":"accessories","label":"BOOK ACCESSORY","tag":"For book lovers","images":["assets/new/book-sleeve-grey.webp","assets/book-sleeve-natural.webp"],"description":"A soft book sleeve with the Just One More Chapter message, made for everyday reading moments.","image":"assets/new/book-sleeve-grey.webp"},
  {"id":"PB-12","name":"The Gingham Book Sleeve","category":"accessories","label":"BOOK ACCESSORY","tag":"The little joys","images":["assets/book-sleeve-gingham.webp"],"description":"A red gingham book sleeve with the Just One More Chapter motif.","image":"assets/book-sleeve-gingham.webp"}
];
const $ = (selector,scope=document) => scope.querySelector(selector);
const $$ = (selector,scope=document) => [...scope.querySelectorAll(selector)];
const byId = id => document.getElementById(id);
let picks = [];
try {const old = JSON.parse(localStorage.getItem('patchbags_enquiry') || '[]'); if(Array.isArray(old)) picks = old.filter(id=>products.some(p=>p.id===id));}catch(e){}
let currentFilter='all';
let activeProduct=null;
let activeImageIndex=0;
// Optional live catalog — created and edited through the owner's secure backend.
// Existing editorial images remain in place until the owner activates items.
function cleanCatalogText(value,max=240){return String(value??'').replace(/[<>"'&]/g,'').slice(0,max)}
function pricedLine(p){
 const price=Number(p.priceMinor);
 if(!Number.isFinite(price)||price<=0)return '<p>Details & pricing on request</p>';
 const now=(price/100).toFixed(2)+' EGP',was=Number(p.compareAtMinor);
 return '<p class="patch-live-price">'+now+'</p>'+
  (was>price?'<p class="patch-compare-price"><del>'+(was/100).toFixed(2)+' EGP</del><span>Save '+Math.round((1-price/was)*100)+'%</span></p>':'');
}
function applyOwnerCatalog(data){
 if(!data||!Array.isArray(data.products))return;
 for(const row of data.products){
  const id=String(row.id||'');
  if(!/^PB-[0-9]{2,4}$/.test(id)||!row.active||Number(row.price_minor)<=0)continue;
  const name=cleanCatalogText(row.title,200),description=cleanCatalogText(row.description,3000);
  let cover=String(row.image_url||'');
  if(!cover.startsWith('https://')&&!cover.startsWith('assets/'))cover='';
  const photos=(Array.isArray(row.media)?row.media:[])
   .filter(a=>a?.type==='image'&&typeof a.url==='string'&&a.url.startsWith('https://')).slice(0,12).map(a=>a.url);
  const image=cover||photos[0]||'assets/new/striped-tote-studio-front.webp';
  const existing=products.find(p=>p.id===id);
  const gallery=photos.length?Array.from(new Set([image,...photos])):(existing?.images||[image]);
  const category=/^[a-z0-9-]{2,50}$/.test(String(row.category_slug||''))?row.category_slug:'bags';
  const update={
   id,name,description,category,image,images:gallery,
   label:cleanCatalogText((data.categories||[]).find(c=>c.slug===category)?.name_en||category,80).toUpperCase(),
   tag:cleanCatalogText(row.badge||'Handmade',40),
   priceMinor:Number(row.price_minor),compareAtMinor:row.compare_at_minor?Number(row.compare_at_minor):null,
   mediaExtras:(Array.isArray(row.media)?row.media:[]).filter(a=>['video','model'].includes(a?.type)&&typeof a.url==='string'&&a.url.startsWith('https://')).slice(0,12)
  };
  if(existing)Object.assign(existing,update);
  else products.push(update);
 }
 const filters=document.querySelector('.filters');
 if(filters&&Array.isArray(data.categories))for(const category of data.categories){
  const slug=String(category.slug||'');
  if(!/^[a-z0-9-]{2,50}$/.test(slug)||filters.querySelector('[data-filter="'+slug+'"]'))continue;
  const btn=document.createElement('button');btn.type='button';btn.className='filter-chip';btn.dataset.filter=slug;
  btn.setAttribute('aria-pressed','false');btn.textContent=cleanCatalogText(category.name_en||category.name_ar,70);
  btn.addEventListener('click',()=>{
   currentFilter=slug;
   document.querySelectorAll('.filter-chip').forEach(chip=>{const chosen=chip===btn;chip.classList.toggle('active',chosen);chip.setAttribute('aria-pressed',String(chosen))});
   renderProducts();
  });filters.append(btn);
 }
 if(document.getElementById('productGrid'))renderProducts();
}
window.PATCH_APPLY_CATALOG=applyOwnerCatalog;

// Photographed variants share one storefront card but retain distinct original SKUs.
// These color options map only to real images supplied by the maker.
const productColorFamilies=[
 {root:'PB-01',options:[
  {id:'PB-01',color:'Charcoal Stripe',hex:'#eee9dc',pattern:'repeating-linear-gradient(0deg,#eee9dc 0 5px,#4e4a45 5px 7px)'},
  {id:'PB-02',color:'Ivory',hex:'#eee9dc'},
  {id:'PB-03',color:'Blush Stripe',hex:'#e9c6cd',pattern:'repeating-linear-gradient(0deg,#f6ede7 0 5px,#dcacb9 5px 8px)'}
 ]},
 {root:'PB-04',options:[
  {id:'PB-04',color:'Taupe',hex:'#8e8273'},
  {id:'PB-05',color:'Ivory',hex:'#e9e2d1'},
  {id:'PB-06',color:'Ruby',hex:'#a6172c'}
 ]},
 {root:'PB-08',options:[
  {id:'PB-08',color:'Mustard',hex:'#caa13f'},
  {id:'PB-09',color:'Natural',hex:'#c0b5a3'}
 ]}
];
const colorFamilyByRoot=new Map(productColorFamilies.map(f=>[f.root,f]));
const colorRootById=new Map(productColorFamilies.flatMap(f=>f.options.map(option=>[option.id,f.root])));
const selectedColorVariant={};
try{
 const previous=JSON.parse(localStorage.getItem('patchbags_color_choices_v1')||'{}');
 if(previous&&typeof previous==='object'&&!Array.isArray(previous))
  for(const family of productColorFamilies){
   const saved=previous[family.root]||(family.root==='PB-01'?previous['PB-02']:null);
   if(family.options.some(option=>option.id===saved))
    selectedColorVariant[family.root]=saved;
  }
}catch(_){}
function persistColorChoices(){try{localStorage.setItem('patchbags_color_choices_v1',JSON.stringify(selectedColorVariant))}catch(_){}}
function collectionProducts(){return products.filter(p=>!colorRootById.has(p.id)||colorRootById.get(p.id)===p.id)}
function getDisplayedVariant(root){
 const family=colorFamilyByRoot.get(root);
 return products.find(p=>p.id===(family?(selectedColorVariant[root]||root):root));
}
function renderColorPicker(root,selectedId,modal=false){
 const family=colorFamilyByRoot.get(root);
 if(!family)return '';
 const chosen=family.options.find(option=>option.id===selectedId)||family.options[0];
 const name=(products.find(p=>p.id===root)||{}).name||'product';
 return '<div class="product-variant-picker'+(modal?' is-modal':'')+'" data-color-group="'+root+'">'+
  '<div class="product-variant-heading"><span class="product-variant-kicker">COLOR</span>'+
  '<strong class="product-variant-color">'+chosen.color+'</strong></div>'+
  '<div class="product-variant-options" role="group" aria-label="Choose color for '+name+'">'+
  family.options.map(option=>'<button type="button" class="product-variant-swatch" '+
   'data-color-family="'+root+'" data-color-option="'+option.id+'" '+
   'aria-label="Show '+option.color+' color" title="'+option.color+'" '+
   'aria-pressed="'+(option.id===chosen.id)+'" style="--swatch-color:'+option.hex+';'+(option.pattern?'--swatch-pattern:'+option.pattern:'')+'">'+
   '<span class="product-variant-dot" aria-hidden="true"></span></button>').join('')+
  '</div>'+
  (modal?'<p class="product-variant-note">Photos show the selected color. Availability is confirmed by the studio.</p>':'')+
  '</div>';
}
function updateColorCard(root){
 const card=byId('productGrid')?.querySelector('[data-color-card="'+root+'"]');
 const p=getDisplayedVariant(root);
 const family=colorFamilyByRoot.get(root);
 if(!card||!p||!family)return;
 card.dataset.selectedProduct=p.id;
 const main=$('.primary-photo',card),hover=$('.hover-photo',card),count=$('.photo-count',card);
 if(main){main.src=p.image;main.alt=p.name;main.classList.remove('product-variant-fade');void main.offsetWidth;main.classList.add('product-variant-fade')}
 if(hover){hover.src=p.images[1]||p.image;hover.hidden=p.images.length<2}
 if(count){count.hidden=p.images.length<2;count.textContent=p.images.length+' photos'}
 const tag=$('.product-image-label',card);if(tag)tag.textContent=p.tag;
 const label=$('.product-info small',card);if(label)label.textContent=p.label;
 const name=$('.product-name [data-detail]',card);if(name)name.textContent=p.name;
 $$('[data-detail]',card).forEach(button=>{
  button.dataset.detail=p.id;
  if(button.classList.contains('product-quick'))button.setAttribute('aria-label','View '+p.name);
 });
 const add=$('[data-add]',card);
 if(add){add.dataset.add=p.id;add.setAttribute('aria-label','Add '+p.name+' to your picks')}
 const color=$('.product-variant-color',card);
 if(color)color.textContent=family.options.find(o=>o.id===p.id)?.color||'';
 $$('[data-color-option]',card).forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.colorOption===p.id)));
 card.dispatchEvent(new CustomEvent('patch:variant-changed',{bubbles:true,detail:{root,productId:p.id}}));
}
function selectProductColor(root,id){
 const family=colorFamilyByRoot.get(root);
 if(!family||!family.options.some(option=>option.id===id))return;
 selectedColorVariant[root]=id;
 persistColorChoices();
 updateColorCard(root);
 if(activeDialog==='product'&&colorRootById.get(activeProduct)===root)populateProductModal(id);
}

let activeDialog=null;
let returnFocus=null;
let toastTimer=null;

function toast(message){const el=byId('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);}
function persist(){try {localStorage.setItem('patchbags_enquiry',JSON.stringify(picks));}catch(e){} updatePicks();}
function updatePicks(){byId('bagCount').textContent=picks.length;byId('drawerCount').textContent=`(${picks.length})`;
 const wrapper=byId('bagItems');if(!picks.length){wrapper.innerHTML='<div class="empty-bag"><span>✳</span><h3>Beautiful things belong here.</h3><p>Save a few favorites, then send the studio an enquiry.</p></div>';return;}
 wrapper.innerHTML=picks.map(id=>{const p=products.find(p=>p.id===id);return `<article class="bag-item"><img src="${p.image}" alt="${p.name}"><div class="bag-item-body"><div><h3>${p.name}</h3><small>${p.label} · ${p.id}</small></div><button type="button" data-remove="${p.id}">Remove piece</button></div></article>`}).join('');
 $$('[data-remove]',wrapper).forEach(button=>button.addEventListener('click',()=>removePick(button.dataset.remove)));
}
function addPick(id){if(!picks.includes(id)){picks.push(id);persist();toast('Added to your enquiry list ♡')}else{toast('Already in your picks ♡')}}
function removePick(id){picks=picks.filter(p=>p!==id);persist();toast('Removed from your picks');}
function renderProducts(){
 const list=collectionProducts().filter(p=>currentFilter==='all'||p.category===currentFilter);
 const grid=byId('productGrid');
 grid.innerHTML=list.map((base,i)=>{
  const p=getDisplayedVariant(base.id)||base;
  return '<article class="product-card" data-color-card="'+base.id+'" data-selected-product="'+p.id+'" style="animation-delay:'+Math.min(i,5)*55+'ms">'+
    '<div class="product-photo">'+
    '<img class="primary-photo" src="'+p.image+'" alt="'+p.name+'" loading="lazy" decoding="async">'+
    '<img class="hover-photo" src="'+(p.images[1]||p.image)+'" alt="" loading="lazy" decoding="async" '+(p.images.length>1?'':'hidden')+'>'+
    '<span class="photo-count" '+(p.images.length>1?'':'hidden')+'>'+p.images.length+' photos</span>'+
    '<span class="product-image-label">'+p.tag+'</span>'+
    '<button class="product-quick" type="button" aria-label="View '+p.name+'" data-detail="'+p.id+'">↗</button></div>'+
    '<div class="product-info"><div><small>'+p.label+'</small>'+
    '<h3 class="product-name"><button type="button" data-detail="'+p.id+'">'+p.name+'</button></h3>'+
    pricedLine(p)+renderColorPicker(base.id,p.id)+'</div>'+
    '<button class="product-add" type="button" data-add="'+p.id+'" aria-label="Add '+p.name+' to your picks">+</button></div>'+
    '</article>';
 }).join('');
 $$('[data-detail]',grid).forEach(button=>button.addEventListener('click',()=>showProduct(button.dataset.detail)));
 $$('[data-add]',grid).forEach(button=>button.addEventListener('click',()=>addPick(button.dataset.add)));
 if(!grid.dataset.colorEventsBound){
  grid.addEventListener('click',event=>{
   const swatch=event.target.closest('[data-color-family][data-color-option]');
   if(!swatch||!grid.contains(swatch))return;
   event.preventDefault();selectProductColor(swatch.dataset.colorFamily,swatch.dataset.colorOption);
  });
  grid.dataset.colorEventsBound='true';
 }
}
function openDialog(name){closeMobileMenu();if(activeDialog){closeDialog(true)}returnFocus=document.activeElement;activeDialog=name;document.body.classList.add('no-scroll');const overlay=byId('overlay');overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('show'));
 const el=byId(name==='bag'?'bagDrawer':name==='search'?'searchModal':'productModal');el.classList.add('open');el.setAttribute('aria-hidden','false');setTimeout(()=>{if(name==='search')byId('searchInput').focus();else el.focus()},120);
}
function closeDialog(immediate=false){if(!activeDialog)return;const name=activeDialog;const overlay=byId('overlay');overlay.classList.remove('show');const el=byId(name==='bag'?'bagDrawer':name==='search'?'searchModal':'productModal');el.classList.remove('open');el.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll');activeDialog=null;const focus=returnFocus;returnFocus=null;setTimeout(()=>{if(!activeDialog)overlay.hidden=true;if(focus&&document.contains(focus))focus.focus()},immediate?0:320)}
function setGalleryImage(index){
 const p=products.find(p=>p.id===activeProduct);if(!p)return;
 activeImageIndex=(index+p.images.length)%p.images.length;
 const photo=byId('modalPhoto');photo.src=p.images[activeImageIndex];photo.alt=`${p.name} — view ${activeImageIndex+1} of ${p.images.length}`;
 byId('modalImageStatus').textContent=`${activeImageIndex+1} / ${p.images.length}`;
 const thumbWrap=byId('modalThumbnails');
 thumbWrap.innerHTML=p.images.map((src,i)=>`<button class="modal-thumb ${i===activeImageIndex?'active':''}" data-image-index="${i}" type="button" aria-label="View photo ${i+1} of ${p.name}" aria-pressed="${i===activeImageIndex}"><img src="${src}" alt="" loading="lazy"></button>`).join('');
 $$('[data-image-index]',thumbWrap).forEach(button=>button.addEventListener('click',()=>setGalleryImage(+button.dataset.imageIndex)));
 byId('modalPrevPhoto').hidden=p.images.length<2;byId('modalNextPhoto').hidden=p.images.length<2;
 thumbWrap.hidden=p.images.length<2;
}
function populateProductModal(id){
 const p=products.find(p=>p.id===id);
 if(!p)return;
 activeProduct=p.id;
 byId('modalTitle').textContent=p.name;
 byId('modalDescription').textContent=p.description;
 byId('modalCode').textContent='PIECE '+p.id;
 const priceEl=byId('modalPricing');
 if(priceEl)priceEl.innerHTML=pricedLine(p);
 const root=colorRootById.get(id);
 const picker=byId('modalColorOptions');
 if(picker){picker.hidden=!root;picker.innerHTML=root?renderColorPicker(root,id,true):''}
 setGalleryImage(0);
 const extras=byId('modalAdditionalMedia');
 if(extras){
  extras.replaceChildren();
  for(const item of p.mediaExtras||[]){
   if(item.type==='video'){
    const video=document.createElement('video');
    video.src=item.url;video.controls=true;video.preload='none';video.playsInline=true;
    video.className='patch-modal-extra-video';
    video.setAttribute('aria-label','Product video');
    extras.appendChild(video);
   }
   if(item.type==='model'){
    const area=document.createElement('div');area.className='patch-modal-model';
    const label=document.createElement('p');label.textContent='Explore the 3D product model';area.appendChild(label);
    const model=document.createElement('model-viewer');
    model.setAttribute('src',item.url);model.setAttribute('camera-controls','');model.setAttribute('auto-rotate','');
    model.setAttribute('alt','Interactive 3D product model');area.appendChild(model);
    const link=document.createElement('a');link.href=item.url;link.rel='noopener noreferrer';link.target='_blank';link.textContent='Open original 3D model ↗';
    area.appendChild(link);extras.appendChild(area);
   }
  }
 }
}
function showProduct(id){
 const p=products.find(p=>p.id===id);if(!p)return;
 const root=colorRootById.get(id);
 if(root){selectedColorVariant[root]=id;persistColorChoices();updateColorCard(root)}
 populateProductModal(id);
 if(activeDialog!=='product')openDialog('product');
}

function renderSearch(term=''){const words=term.trim().toLocaleLowerCase();const found=products.filter(p=>(p.name+' '+p.label+' '+p.description).toLocaleLowerCase().includes(words));byId('searchResults').innerHTML=found.length?found.map(p=>`<button class="search-result" type="button" data-search-product="${p.id}"><img src="${p.image}" alt=""><span><strong>${p.name}</strong><small>${p.label}</small></span></button>`).join(''):'<p class="search-empty">No matches yet. Try “bag”, “book” or “pouch”.</p>';$$('[data-search-product]',byId('searchResults')).forEach(el=>el.addEventListener('click',()=>showProduct(el.dataset.searchProduct)));}
async function copyEnquiry(){if(!picks.length){toast('Choose a piece from the collection first');return;}const details=picks.map(id=>{const p=products.find(p=>p.id===id);return `• ${p.name} (${p.id})`;}).join('\n');const message=`Hello PatCh.BaGs! ♡\nI'm interested in these handmade pieces:\n${details}\nCould you please share the prices, available colors, and order details? Thank you!`;
 let success=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(message);success=true;}else{const area=document.createElement('textarea');area.value=message;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();success=document.execCommand('copy');area.remove();}}catch(e){}
 if(success)toast('Enquiry copied — paste it into your Instagram message');else{window.prompt('Copy this enquiry and send it on Instagram:',message)}
}
function setup(){byId('year').textContent=new Date().getFullYear();renderProducts();updatePicks();
 const count=byId('allPiecesCount');if(count)count.textContent=String(collectionProducts().length).padStart(2,'0');
 byId('modalPrevPhoto').addEventListener('click',()=>setGalleryImage(activeImageIndex-1));
 byId('modalNextPhoto').addEventListener('click',()=>setGalleryImage(activeImageIndex+1));
 const modalColors=byId('modalColorOptions');
 if(modalColors)modalColors.addEventListener('click',event=>{
  const swatch=event.target.closest('[data-color-family][data-color-option]');
  if(swatch)selectProductColor(swatch.dataset.colorFamily,swatch.dataset.colorOption);
 });
 let touchX=null;byId('modalPhoto').addEventListener('touchstart',e=>{touchX=e.changedTouches[0].screenX},{passive:true});
 byId('modalPhoto').addEventListener('touchend',e=>{if(touchX===null)return;const d=e.changedTouches[0].screenX-touchX;touchX=null;if(Math.abs(d)>45)setGalleryImage(activeImageIndex+(d<0?1:-1))},{passive:true});
 $$('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;$$('.filter-chip').forEach(chip=>{const pressed=chip===btn;chip.classList.toggle('active',pressed);chip.setAttribute('aria-pressed',String(pressed));});renderProducts();}));
 $$('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.open==='search')renderSearch();openDialog(btn.dataset.open)}));
 $$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeDialog()));byId('overlay').addEventListener('click',()=>closeDialog());
 byId('searchInput').addEventListener('input',e=>renderSearch(e.target.value));
 byId('copyEnquiry').addEventListener('click',copyEnquiry);
 byId('modalAdd').addEventListener('click',()=>{if(activeProduct)addPick(activeProduct)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialog();closeMobileMenu()}if(activeDialog==='product'&&e.key==='ArrowRight')setGalleryImage(activeImageIndex+1);if(activeDialog==='product'&&e.key==='ArrowLeft')setGalleryImage(activeImageIndex-1);if(e.key==='Tab'&&activeDialog){const el=byId(activeDialog==='bag'?'bagDrawer':activeDialog==='search'?'searchModal':'productModal');const nodes=$$('a[href],button:not([disabled]),input:not([disabled])',el).filter(n=>n.getClientRects().length);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}});
 byId('menuToggle').addEventListener('click',()=>{const isOpen=byId('mobileNav').classList.toggle('open');byId('menuToggle').setAttribute('aria-expanded',String(isOpen));});
 $$('#mobileNav a').forEach(a=>a.addEventListener('click',closeMobileMenu));
 const observer=window.IntersectionObserver?new IntersectionObserver((entries,obs)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px 35px 0px'}):null;
 $$('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('visible'));
 const header=byId('siteHeader');window.addEventListener('scroll',()=>{header.classList.toggle('compact',window.scrollY>65)},{passive:true});
}
function closeMobileMenu(){byId('mobileNav').classList.remove('open');byId('menuToggle').setAttribute('aria-expanded','false')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();

// Editorial category tiles reuse the existing product filters and collection navigation.
document.addEventListener('click', function(event) {
  const tile=event.target.closest('[data-shop-filter]');
  if(!tile)return;
  const chip=document.querySelector('.filter-chip[data-filter="'+tile.dataset.shopFilter+'"]');
  if(chip)chip.click();
});
