'use strict';

// Website concept uses the customer's own photographs. Product labels are editable
// working names, not confirmed SKU names or claims of inventory/pricing.
const products = [
  {id:'PB-01',name:'The Striped Tote',category:'bags',label:'COTTON CORD BAG',tag:'Signature texture',image:'assets/woven-stripe-tote.webp',description:'A beautifully textured cotton cord tote with a sculptural woven flap and soft striped finish. Made for the moments you want to carry something special.'},
  {id:'PB-02',name:'The Blush Tote',category:'bags',label:'COTTON CORD BAG',tag:'A soft favorite',image:'assets/blush-cotton-tote.webp',description:'Gentle blush-pink stripes meet an expressive woven flap. A handmade statement with a soft, easygoing personality.'},
  {id:'PB-03',name:'The Round Crossbody',category:'bags',label:'WOVEN CROSSBODY',tag:'Everyday classic',image:'assets/round-crossbody-sun.webp',description:'A round cotton cord crossbody with a tactile spiral weave, decorative flap and contrasting strap details. Easy to style, beautiful to look at.'},
  {id:'PB-04',name:'The Chapter Sleeve',category:'accessories',label:'BOOK ACCESSORIES',tag:'For book lovers',image:'assets/book-sleeve-natural.webp',description:'A book sleeve made for the one-more-chapter kind of day. A simple, thoughtful way to carry your current read.'},
  {id:'PB-05',name:'The Gingham Chapter',category:'accessories',label:'BOOK ACCESSORIES',tag:'Little joys',image:'assets/book-sleeve-gingham.webp',description:'A playful red gingham take on the book sleeve, featuring the “Just One More Chapter” motif. A sweet gift for a reader.'},
  {id:'PB-06',name:'The Monogram Pouch',category:'personalized',label:'PERSONALIZED POUCH',tag:'Made personal',image:'assets/personalized-pouch.webp',description:'A fabric zip pouch with a bold initial detail. Ask the studio about personalizing it with your chosen letter or special touch.'}
];
const $ = (selector,scope=document) => scope.querySelector(selector);
const $$ = (selector,scope=document) => [...scope.querySelectorAll(selector)];
const byId = id => document.getElementById(id);
let picks = [];
try {const old = JSON.parse(localStorage.getItem('patchbags_enquiry') || '[]'); if(Array.isArray(old)) picks = old.filter(id=>products.some(p=>p.id===id));}catch(e){}
let currentFilter='all';
let activeProduct=null;
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
function renderProducts(){const list=currentFilter==='all'?products:products.filter(p=>p.category===currentFilter);const grid=byId('productGrid');grid.innerHTML=list.map((p,i)=>`
  <article class="product-card" style="animation-delay:${Math.min(i,5)*55}ms">
  <div class="product-photo">
  <img src="${p.image}" alt="${p.name}" loading="eager">
  <span class="product-image-label">${p.tag}</span>
  <button class="product-quick" type="button" aria-label="View ${p.name}" data-detail="${p.id}">↗</button>
  </div>
  <div class="product-info"><div><small>${p.label}</small><h3 class="product-name"><button type="button" data-detail="${p.id}">${p.name}</button></h3><p>Details & pricing on request</p></div><button class="product-add" type="button" data-add="${p.id}" aria-label="Add ${p.name} to your picks">+</button></div>
  </article>`).join('');
 $$('[data-detail]',grid).forEach(button=>button.addEventListener('click',()=>showProduct(button.dataset.detail)));
 $$('[data-add]',grid).forEach(button=>button.addEventListener('click',()=>addPick(button.dataset.add)));
}
function openDialog(name){closeMobileMenu();if(activeDialog){closeDialog(true)}returnFocus=document.activeElement;activeDialog=name;document.body.classList.add('no-scroll');const overlay=byId('overlay');overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('show'));
 const el=byId(name==='bag'?'bagDrawer':name==='search'?'searchModal':'productModal');el.classList.add('open');el.setAttribute('aria-hidden','false');setTimeout(()=>{if(name==='search')byId('searchInput').focus();else el.focus()},120);
}
function closeDialog(immediate=false){if(!activeDialog)return;const name=activeDialog;const overlay=byId('overlay');overlay.classList.remove('show');const el=byId(name==='bag'?'bagDrawer':name==='search'?'searchModal':'productModal');el.classList.remove('open');el.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll');activeDialog=null;const focus=returnFocus;returnFocus=null;setTimeout(()=>{if(!activeDialog)overlay.hidden=true;if(focus&&document.contains(focus))focus.focus()},immediate?0:320)}
function showProduct(id){const p=products.find(p=>p.id===id);if(!p)return;activeProduct=id;byId('modalPhoto').src=p.image;byId('modalPhoto').alt=p.name;byId('modalTitle').textContent=p.name;byId('modalDescription').textContent=p.description;byId('modalCode').textContent=`PIECE ${p.id}`;openDialog('product');}
function renderSearch(term=''){const words=term.trim().toLocaleLowerCase();const found=products.filter(p=>(p.name+' '+p.label+' '+p.description).toLocaleLowerCase().includes(words));byId('searchResults').innerHTML=found.length?found.map(p=>`<button class="search-result" type="button" data-search-product="${p.id}"><img src="${p.image}" alt=""><span><strong>${p.name}</strong><small>${p.label}</small></span></button>`).join(''):'<p class="search-empty">No matches yet. Try “bag”, “book” or “pouch”.</p>';$$('[data-search-product]',byId('searchResults')).forEach(el=>el.addEventListener('click',()=>showProduct(el.dataset.searchProduct)));}
async function copyEnquiry(){if(!picks.length){toast('Choose a piece from the collection first');return;}const details=picks.map(id=>{const p=products.find(p=>p.id===id);return `• ${p.name} (${p.id})`;}).join('\n');const message=`Hello PatCh.BaGs! ♡\nI'm interested in these handmade pieces:\n${details}\nCould you please share the prices, available colors, and order details? Thank you!`;
 let success=false;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(message);success=true;}else{const area=document.createElement('textarea');area.value=message;area.style.position='fixed';area.style.opacity='0';document.body.appendChild(area);area.select();success=document.execCommand('copy');area.remove();}}catch(e){}
 if(success)toast('Enquiry copied — paste it into your Instagram message');else{window.prompt('Copy this enquiry and send it on Instagram:',message)}
}
function setup(){byId('year').textContent=new Date().getFullYear();renderProducts();updatePicks();
 $$('.filter-chip').forEach(btn=>btn.addEventListener('click',()=>{currentFilter=btn.dataset.filter;$$('.filter-chip').forEach(chip=>{const pressed=chip===btn;chip.classList.toggle('active',pressed);chip.setAttribute('aria-pressed',String(pressed));});renderProducts();}));
 $$('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{if(btn.dataset.open==='search')renderSearch();openDialog(btn.dataset.open)}));
 $$('[data-close]').forEach(btn=>btn.addEventListener('click',()=>closeDialog()));byId('overlay').addEventListener('click',()=>closeDialog());
 byId('searchInput').addEventListener('input',e=>renderSearch(e.target.value));
 byId('copyEnquiry').addEventListener('click',copyEnquiry);
 byId('modalAdd').addEventListener('click',()=>{if(activeProduct)addPick(activeProduct)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeDialog();closeMobileMenu()}if(e.key==='Tab'&&activeDialog){const el=byId(activeDialog==='bag'?'bagDrawer':activeDialog==='search'?'searchModal':'productModal');const nodes=$$('a[href],button:not([disabled]),input:not([disabled])',el).filter(n=>n.getClientRects().length);if(nodes.length){const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}}});
 byId('menuToggle').addEventListener('click',()=>{const isOpen=byId('mobileNav').classList.toggle('open');byId('menuToggle').setAttribute('aria-expanded',String(isOpen));});
 $$('#mobileNav a').forEach(a=>a.addEventListener('click',closeMobileMenu));
 const observer=window.IntersectionObserver?new IntersectionObserver((entries,obs)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');obs.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px 35px 0px'}):null;
 $$('.reveal').forEach(el=>observer?observer.observe(el):el.classList.add('visible'));
 const header=byId('siteHeader');window.addEventListener('scroll',()=>{header.classList.toggle('compact',window.scrollY>65)},{passive:true});
}
function closeMobileMenu(){byId('mobileNav').classList.remove('open');byId('menuToggle').setAttribute('aria-expanded','false')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
