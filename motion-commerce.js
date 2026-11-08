/* PatCh.BaGs — Framer-style progressive motion + functional guest bag.
   Original header/hero/navigation/font styles are left untouched.
   Accounts and hosted payment remain disabled until secure services are configured. */
(()=>{
"use strict";
const $=(q,root=document)=>root.querySelector(q);
const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
const icon=(name)=>({
 instagram:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></svg>',
 bag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16l-1 13H5L4 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>',
 user:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21c0-4.2 3-6.5 7.5-6.5s7.5 2.3 7.5 6.5"/></svg>',
 shield:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 5v6c0 5.1 3.4 9.1 8 11 4.6-1.9 8-5.9 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
 credit:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 10h20M6 15h5"/></svg>',
 heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 6l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.3a5.5 5.5 0 0 0 0-7.8Z"/></svg>'
}[name]||'');
const mini=(name)=>'<span class="patch-mini-icon">'+icon(name)+'</span>';
const escaped=(value)=>String(value).replace(/[&<>"']/g,chr=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[chr]));
const byId=(id)=>document.getElementById(id);
const config=window.PATCH_STORE_CONFIG||{};
const authReady=()=>/^https:\/\/[^/]+/i.test(config.supabaseUrl||'') && String(config.supabasePublishableKey||'').length>12;
const authClient=()=>authReady()&&window.supabase?.createClient?window.PATCH_SUPABASE_CLIENT||(window.PATCH_SUPABASE_CLIENT=window.supabase.createClient(config.supabaseUrl,config.supabasePublishableKey,{
 auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
})):null;
const paymentReady=()=>/^https:\/\/[^/]+/i.test(config.paymentApiEndpoint||'');
let authSession=null;
let cart={};
let checkoutAfterAuth=false;
let activeUserId=null;
let suppressCloud=false;
let cartCloudReady=false;
let cloudWrite=Promise.resolve();
let commerceOpen=false;
let focusBefore=null;
const cartStorageKey='patchbags_cart_v2';
function loadCart(){
 try{
  const old=JSON.parse(localStorage.getItem(cartStorageKey)||'null');
  if(old&&typeof old==='object'&&!Array.isArray(old)){
   for(const [id,q] of Object.entries(old))
    if(products.some(p=>p.id===id) && Number.isInteger(q) && q>0)cart[id]=Math.min(20,q);
  }
  if(!Object.keys(cart).length){
   const older=JSON.parse(localStorage.getItem('patchbags_enquiry')||'[]');
   if(Array.isArray(older))for(const id of older)if(products.some(p=>p.id===id))cart[id]=1;
  }
 }catch(_){}
}
function saveCart(){
 try{
  if(activeUserId)localStorage.setItem('patchbags_user_cart_v1_'+activeUserId,JSON.stringify(cart));
  else localStorage.setItem(cartStorageKey,JSON.stringify(cart));
  // Keep the old enquiry list compatible with the original storefront.
  localStorage.setItem('patchbags_enquiry',JSON.stringify(Object.keys(cart)));
 }catch(_){}
 if(typeof picks!=='undefined')picks=Object.keys(cart);
 renderCart();
}
function updateCloudItem(id,qty){
 if(!authSession||!authClient()||!cartCloudReady||suppressCloud)return;
 const uid=authSession.user.id,client=authClient();
 cloudWrite=cloudWrite.then(async()=>{
  if(qty<=0)await client.from('customer_cart_items').delete().eq('user_id',uid).eq('product_id',id);
  else await client.from('customer_cart_items').upsert({user_id:uid,product_id:id,quantity:qty},{onConflict:'user_id,product_id'});
 }).catch(()=>announce('Your bag is saved on this device; cloud sync needs setup.'));
}
async function activateCustomerSession(session){
 if(!session?.user?.id)return;
 const client=authClient(),uid=session.user.id;
 const same=activeUserId===uid;
 authSession=session;
 if(same&&cartCloudReady){updateAccountCopy();return}
 activeUserId=uid;
 const guest={...cart};
 try{
  const local=JSON.parse(localStorage.getItem('patchbags_user_cart_v1_'+uid)||'{}');
  if(local&&typeof local==='object')for(const [id,q] of Object.entries(local))
    if(products.some(p=>p.id===id)&&Number.isInteger(q)&&q>0)
     guest[id]=Math.max(guest[id]||0,Math.min(q,20));
 }catch(_){}
 suppressCloud=true;
 cart=guest;
 let cloudRows=[];
 try{
  const {data,error}=await client.from('customer_cart_items').select('product_id,quantity').eq('user_id',uid);
  if(error)throw error;
  cloudRows=Array.isArray(data)?data:[];
  for(const row of cloudRows)if(products.some(p=>p.id===row.product_id)&&Number.isInteger(row.quantity))
   cart[row.product_id]=Math.max(cart[row.product_id]||0,Math.min(20,row.quantity));
  cartCloudReady=true;
 }catch(_){cartCloudReady=false}
 suppressCloud=false;saveCart();
 // Merge saved guest picks into account cart, without ever trusting product prices.
 if(cartCloudReady){
  const remoteIds=new Set(cloudRows.map(x=>x.product_id));
  for(const [id,qty] of Object.entries(cart))
   if(!remoteIds.has(id)||cloudRows.find(x=>x.product_id===id)?.quantity!==qty)updateCloudItem(id,qty);
  try{localStorage.removeItem(cartStorageKey)}catch(_){}
 }
 updateAccountCopy();
 if(checkoutAfterAuth){checkoutAfterAuth=false;openCheckout();}
}
async function initializeCustomerAuth(){
 const client=authClient();
 if(!client)return;
 try{
  const {data:{session}}=await client.auth.getSession();
  if(session?.user)await activateCustomerSession(session);
  client.auth.onAuthStateChange((event,nextSession)=>{
   // Avoid waiting on Supabase client network calls inside the auth callback.
   setTimeout(()=>{
    if(nextSession?.user)activateCustomerSession(nextSession).catch(()=>{});
    else if(event==='SIGNED_OUT'){
     activeUserId=null;authSession=null;cartCloudReady=false;cart={};
     loadCart();renderCart();updateAccountCopy();
    }
   },0);
  });
 }catch(_){}
}
window.PATCH_AUTH={
 isSignedIn:()=>Boolean(authSession?.user),
 getUser:()=>authSession?.user||null,
 getAccessToken:async()=>{
  const c=authClient();if(!c)return null;
  const {data}=await c.auth.getSession();
  return data.session?.access_token||null;
 },
 startCheckout:()=>openCheckout()
};

function cartCount(){return Object.values(cart).reduce((n,q)=>n+q,0)}
function cartList(){return Object.entries(cart).map(([id,q])=>({product:products.find(p=>p.id===id),quantity:q})).filter(x=>x.product)}
function addToCart(id){if(!products.some(p=>p.id===id))return;cart[id]=Math.min((cart[id]||0)+1,20);saveCart();updateCloudItem(id,cart[id]);announce('Added to your bag');}
function setQuantity(id,n){if(!products.some(p=>p.id===id))return;if(n<=0)delete cart[id];else cart[id]=Math.min(n,20);saveCart();updateCloudItem(id,cart[id]||0);}
function announce(msg){
 const target=byId('toast');
 if(!target)return;
 target.textContent=msg;target.classList.add('show');
 clearTimeout(announce.timer);announce.timer=setTimeout(()=>target.classList.remove('show'),3100);
}
function renderCart(){
 const total=cartCount();
 if(byId('bagCount'))byId('bagCount').textContent=String(total);
 if(byId('drawerCount'))byId('drawerCount').textContent='('+total+')';
 const area=byId('bagItems');if(!area)return;
 if(!total){
  area.innerHTML='<div class="patch-cart-empty">'+mini('bag')+'<h3>Your bag starts here.</h3><p>Find a piece you love, then come back here.</p></div>';
 }else{
  area.innerHTML=cartList().map(({product:p,quantity:q})=>'<article class="patch-cart-card">'+
    '<img loading="lazy" src="'+escaped(p.image)+'" alt="'+escaped(p.name)+'">'+
    '<div><small>'+escaped(p.label)+'</small><h3>'+escaped(p.name)+'</h3>'+
    '<p class="patch-cart-price">Price confirmed with the studio</p>'+
    '<div class="patch-cart-adjust" aria-label="Adjust '+escaped(p.name)+' quantity">'+
    '<button type="button" data-patch-minus="'+p.id+'" aria-label="Decrease '+escaped(p.name)+' quantity">−</button>'+
    '<output aria-label="Quantity">'+q+'</output>'+
    '<button type="button" data-patch-plus="'+p.id+'" aria-label="Increase '+escaped(p.name)+' quantity">+</button>'+
    '<button type="button" class="patch-cart-remove" data-patch-remove="'+p.id+'">Remove</button>'+
    '</div></div></article>').join('');
 }
 const checkout=byId('patchStartCheckout');if(checkout)checkout.disabled=!total;
}
function upgradeBag(){
 const drawer=byId('bagDrawer');if(!drawer)return;
 const title=$('.drawer-head h2',drawer);if(title&&title.firstChild)title.firstChild.textContent='Your bag ';
 const eyebrow=$('.drawer-eyebrow',drawer);if(eyebrow)eyebrow.textContent='THE PATCH EDIT';
 const bottom=$('.drawer-bottom',drawer);
 if(bottom&&!byId('patchStartCheckout')){
  const note=$('p',bottom);if(note)note.textContent='Prices and delivery are confirmed with the studio before any payment is requested.';
  const checkout=document.createElement('button');
  checkout.type='button';checkout.id='patchStartCheckout';checkout.className='patch-action-button patch-cart-checkout';
  checkout.innerHTML=mini('bag')+' Continue to checkout <span>↗</span>';
  const old=byId('copyEnquiry');
  if(old)bottom.insertBefore(checkout,old);else bottom.appendChild(checkout);
  if(old)old.textContent='Copy bag enquiry ↗';
 }
 renderCart();
}
function buildModal(){
 if(byId('patchCommerceLayer'))return;
 document.body.insertAdjacentHTML('beforeend',
 '<div class="patch-commerce-layer" id="patchCommerceLayer" hidden>'+
 '<div class="patch-commerce-scrim" data-patch-close></div>'+
 '<section class="patch-commerce-dialog" role="dialog" aria-modal="true" aria-labelledby="patchCommerceTitle" tabindex="-1">'+
 '<button type="button" class="patch-commerce-close" data-patch-close aria-label="Close dialog">×</button>'+
 '<div class="patch-commerce-content" id="patchCommerceContent"></div></section></div>');
}
function openModal(html){
 const layer=byId('patchCommerceLayer');
 if(typeof closeDialog==='function')closeDialog(true);
 focusBefore=document.activeElement;byId('patchCommerceContent').innerHTML=html;
 layer.hidden=false;commerceOpen=true;document.body.classList.add('no-scroll');
 $('.patch-commerce-dialog',layer).focus();
}
function closeModal(){
 if(!commerceOpen)return;
 commerceOpen=false;byId('patchCommerceLayer').hidden=true;
 document.body.classList.remove('no-scroll');
 if(focusBefore&&document.contains(focusBefore))focusBefore.focus();
}
function authHeader(mode){
 const isSignIn=mode==='signin';
 return '<p class="patch-kicker">WELCOME TO THE STUDIO</p>'+
 '<h2 id="patchCommerceTitle">'+(isSignIn?'Welcome back.':'A little more yours.')+'</h2>'+
 '<p class="patch-commerce-intro">'+(checkoutAfterAuth?'Sign in or create an account to continue. Your selected colors and quantities stay in your bag.':'Your own corner of the PatCh.BaGs studio — designed for a thoughtful shopping journey.')+'</p>'+
 '<div class="patch-auth-tabs"><button type="button" data-patch-auth="signin" class="'+(isSignIn?'active':'')+'" aria-pressed="'+isSignIn+'">Sign in</button>'+
 '<button type="button" data-patch-auth="signup" class="'+(!isSignIn?'active':'')+'" aria-pressed="'+(!isSignIn)+'">Create account</button></div>';
}
function showAccount(mode='signin'){
 if(authSession){
  const email=authSession.user?.email||'';
  openModal('<p class="patch-kicker">YOUR STUDIO ACCOUNT</p><h2 id="patchCommerceTitle">Hello again.</h2>'+
   '<p class="patch-commerce-intro">Signed in as '+escaped(email)+'. Your bag is ready to explore.</p>'+
   '<button type="button" class="patch-form-submit" data-patch-signout>Sign out</button>');
  return;
 }
 const canAuth=Boolean(authClient());
 const disabled=canAuth?'':' disabled';
 const fieldName=mode==='signup'?'<label>Your name<input name="name" type="text" autocomplete="name" maxlength="80" required'+disabled+'></label>':'';
 const notice=!canAuth?'<div class="patch-auth-notice">'+mini('shield')+
  ' Secure sign-in is being configured. Your chosen items, colors and quantities remain saved on this device. Do not enter a password until the service is activated.</div>':'';
 openModal(authHeader(mode)+notice+'<form id="patchAuthForm" class="patch-commerce-form" data-mode="'+mode+'">'+fieldName+
  '<label>Email address<input type="email" autocomplete="email" name="email" required'+disabled+'></label>'+
  '<label>Password<input type="password" autocomplete="'+(mode==='signup'?'new-password':'current-password')+'" minlength="8" name="password" required'+disabled+'></label>'+
  '<p class="patch-auth-message" role="status" id="patchAuthMessage"></p>'+
  '<button class="patch-form-submit" type="submit"'+disabled+'>'+(mode==='signup'?'Create my account':'Sign in securely')+'</button></form>'+
  '<p class="patch-checkout-disclaimer">Passwords are never stored in this website’s code or local cart.</p>');
}
async function submitAuth(form){
 const mode=form.dataset.mode;
 const client=authClient(),message=byId('patchAuthMessage');
 if(!client){message.textContent='Secure authentication is not yet connected. Your bag is still saved here.';return;}
 const values=new FormData(form),email=String(values.get('email')||'').trim(),password=String(values.get('password')||''),name=String(values.get('name')||'').trim();
 const submit=$('button[type=submit]',form);message.textContent='';submit.disabled=true;submit.textContent='Connecting securely…';
 try{
  const response=mode==='signup'
   ?await client.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:location.origin+location.pathname}})
   :await client.auth.signInWithPassword({email,password});
  if(response.error)throw response.error;
  if(response.data.session?.user){
   closeModal();
   await activateCustomerSession(response.data.session);
   announce('Signed in — your saved bag is ready');
  }else if(mode==='signup'){
   message.style.color='#3d633e';
   message.textContent='Check your email to verify your account. Your bag stays saved on this device.';
  }else message.textContent='Unable to finish sign-in right now.';
 }catch(e){message.textContent=e.message||'Secure sign-in unavailable'}
 finally{submit.disabled=false;submit.textContent=mode==='signup'?'Create my account':'Sign in securely'}
}
async function signOut(){
 const client=authClient();
 checkoutAfterAuth=false;
 if(client)try{await client.auth.signOut()}catch(_){}
 authSession=null;activeUserId=null;cartCloudReady=false;cart={};
 loadCart();renderCart();updateAccountCopy();closeModal();announce('Signed out');
}
function updateAccountCopy(){
 const el=byId('patchAccountStatus');if(el)el.textContent=authSession?'You are signed in. Your cart is saved on this device.':'Explore our handmade collection. Secure accounts are being prepared.';
}
function checkoutBody(){
 return '<p class="patch-kicker">THE PATCH BAG / CHECKOUT</p>'+
  '<h2 id="patchCommerceTitle">Almost yours.</h2>'+
  '<div class="patch-checkout-steps"><span class="active">01 / Your picks</span><span class="active">02 / Delivery</span><span class="active">03 / Payment</span></div>'+
  '<div class="patch-checkout-items">'+cartList().map(({product:p,quantity:q})=>
   '<div class="patch-checkout-line"><img src="'+escaped(p.image)+'" alt=""><strong>'+escaped(p.name)+'</strong><span>× '+q+'</span></div>').join('')+'</div>'+
  '<p class="patch-auth-notice">Prices, delivery and totals are quoted by the studio. This page does not charge you or place an order automatically.</p>'+
  '<form id="patchCheckoutForm" class="patch-commerce-form">'+
  '<label>Full name<input required autocomplete="name" name="name" type="text" maxlength="100" placeholder="Your name"></label>'+
  '<label>Email address<input required autocomplete="email" name="email" type="email" placeholder="you@example.com"></label>'+
  '<label>Phone number<input required autocomplete="tel" name="phone" type="tel" maxlength="26" placeholder="Your contact number"></label>'+
  '<label>City / delivery area<input required name="city" autocomplete="address-level2" type="text" maxlength="100" placeholder="Your city"></label>'+
  '<label>Delivery notes (optional)<textarea name="notes" maxlength="400" placeholder="Your preferred delivery address or customization request"></textarea></label>'+
  '<div class="patch-kicker" style="margin-top:12px">PAYMENT OPTION</div>'+
  '<label class="patch-pay-option"><input type="radio" name="payment" value="studio" checked>'+
  '<span><strong>Request a payment link from the studio</strong><small>No payment taken here. Copy your request and send it to the maker via Instagram.</small></span></label>'+
  '<label class="patch-pay-option '+(paymentReady()?'':'disabled')+'"><input type="radio" name="payment" value="online"'+(paymentReady()?'':' disabled')+'>'+
  '<span><strong>Secure online payment</strong><small>'+(paymentReady()?'Continue to hosted checkout after the server confirms prices.':'Coming soon — requires a connected merchant payment service.')+'</small></span></label>'+
  '<div id="patchPaymentFeedback" class="patch-payment-feedback" role="status"></div>'+
  '<button class="patch-form-submit" type="submit">Copy order request →</button>'+
  '<p class="patch-checkout-disclaimer">This is an enquiry until the studio confirms prices and accepts your order. Never enter card details here.</p></form>'+
  '<div class="patch-commerce-toolbar"><a rel="noopener noreferrer" target="_blank" href="https://www.instagram.com/patch.bags.nbd/">'+mini('instagram')+' Message the studio</a></div>';
}
function openCheckout(){
 if(!cartCount()){announce('Add a handmade piece to your bag first');return;}
 if(!authSession?.user){
  checkoutAfterAuth=true;
  saveCart();
  showAccount('signin');
  return;
 }
 openModal(checkoutBody());
}
async function copyText(s){
 try{await navigator.clipboard.writeText(s);return true}
 catch(_){
  const box=document.createElement('textarea');box.value=s;box.style.position='fixed';box.style.opacity='0';document.body.appendChild(box);box.select();
  let ok=false;try{ok=document.execCommand('copy')}catch(_){}
  box.remove();return ok;
 }
}
function enquiryText(details){
 const fields=details||{};
 let rows=cartList().map(({product,quantity})=>'• '+product.name+' ('+product.id+') × '+quantity).join('\n');
 let msg='Hello PatCh.BaGs ♡\nI would like to ask about these handmade pieces:\n'+rows;
 if(fields.name)msg+='\n\nName: '+fields.name;
 if(fields.email)msg+='\nEmail: '+fields.email;
 if(fields.phone)msg+='\nPhone: '+fields.phone;
 if(fields.city)msg+='\nCity: '+fields.city;
 if(fields.notes)msg+='\nNotes: '+fields.notes;
 return msg+'\n\nCould you please confirm current prices, delivery cost, available colors and payment options? Thank you!';
}
async function copyRequest(details){
 const content=enquiryText(details),ok=await copyText(content);
 if(ok){
  announce('Request copied — send it to PatCh.BaGs on Instagram');
  const feedback=byId('patchPaymentFeedback');
  if(feedback){feedback.textContent='Your enquiry is copied. Open Instagram to send it. No order or payment has been placed.';feedback.classList.add('show');}
 }else window.prompt('Copy your enquiry and send it to the studio:',content);
}
async function submitCheckout(form){
 const values=Object.fromEntries(new FormData(form));
 const name=String(values.name||'').trim(),email=String(values.email||'').trim(),
 phone=String(values.phone||'').trim(),city=String(values.city||'').trim(),notes=String(values.notes||'').trim();
 if(!name||!email||!phone||!city)return;
 const payment=values.payment||'studio';
 const submit=$('button[type=submit]',form),feedback=byId('patchPaymentFeedback');
 feedback.classList.remove('show');submit.disabled=true;
 try{
  if(payment==='online'&&paymentReady()){
   submit.textContent='Starting secure checkout…';
   const response=await fetch(config.paymentApiEndpoint,{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({cart:cartList().map(({product,quantity})=>({id:product.id,quantity})),customer:{name,email,phone,city,notes}})
   });
   const data=await response.json();
   if(!response.ok)throw Error(data.message||'Online checkout is unavailable.');
   const checkoutUrl=new URL(data.checkoutUrl);
   if(checkoutUrl.protocol!=='https:')throw Error('The payment link was not secure.');
   window.location.assign(checkoutUrl.href);
  }else{
   submit.textContent='Copying your request…';
   await copyRequest({name,email,phone,city,notes});
  }
 }catch(e){feedback.textContent=e.message||'Could not start checkout.';feedback.classList.add('show')}
 finally{submit.disabled=false;submit.textContent='Copy order request →'}
}
function enhanceMotion(){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window))return;
 document.documentElement.classList.add('patch-motion-on');
 const observer=new IntersectionObserver((entries,obs)=>{
  for(const e of entries)if(e.isIntersecting){e.target.classList.add('patch-visible');obs.unobserve(e.target)}
 },{threshold:.08,rootMargin:'0px 0px 70px 0px'});
 const targets=[
  '.category-tile','.feature-card','.lookbook-frame',
  '.collection .product-card','.social-gallery a',
  '.patch-words-section','.patch-account-section'
 ];
 const apply=()=>{
  for(const selector of targets){
   const els=$$(selector);
   els.forEach((el,index)=>{
    if(el.classList.contains('patch-reveal'))return;
    el.style.setProperty('--patch-stagger',Math.min((index%3)*105,210)+'ms');
    el.classList.add('patch-reveal');observer.observe(el);
   });
  }
  $$('.category-header h2,.collection .section-heading h2,.lookbook-head h2,.feature-top h2,.social-heading h2').forEach(el=>{
   if(el.classList.contains('patch-text-unveil'))return;el.classList.add('patch-text-unveil');observer.observe(el);
  });
 };
 apply();
 const grid=byId('productGrid');
 if(grid)new MutationObserver(apply).observe(grid,{childList:true});
}
function setupReviews(){
 // The 3D review component now owns the review rotation and photo timing.
 if(window.PATCH_3D_REVIEWS || byId('patchWords')?.dataset.reviews3d === 'true') return;
 const quotes=[
  {text:"I bought one of your bags and it's super well made. Great job and keep going.",source:"Customer feedback · Original English",image:"assets/new/ivory-tote-portrait-front.webp"},
  {text:"Thank you — amazing quality.",source:"Customer feedback · Original English",image:"assets/new/crescent-crossbody-taupe.webp"},
  {text:"The bag is absolutely gorgeous. I was genuinely so happy with it.",source:"Customer feedback · Translated from Arabic",image:"assets/new/striped-tote-studio-angle.webp"},
  {text:"Lovely material, lovely finishing — and such a beautiful bright white.",source:"Customer feedback · Translated from Arabic",image:"assets/new/ivory-tote-lifestyle-carry.webp"}
 ];
 let current=0,paused=false,visible=false,timer=null,busy=false;
 const section=byId('patchWords');if(!section)return;
 const title=byId('patchReviewQuote'),meta=byId('patchReviewMeta'),photo=byId('patchReviewImage'),count=byId('patchReviewCount');
 function render(transition=true){
  const item=quotes[current];
  if(!transition){title.textContent='“'+item.text+'”';meta.textContent=item.source;photo.src=item.image;count.textContent=(current+1)+' / '+quotes.length;return;}
  if(busy)return;busy=true;title.classList.add('patch-changing');photo.classList.add('patch-switching');
  setTimeout(()=>{title.textContent='“'+item.text+'”';meta.textContent=item.source;photo.src=item.image;count.textContent=(current+1)+' / '+quotes.length;
   title.classList.remove('patch-changing');photo.classList.remove('patch-switching');busy=false;},260);
 }
 function move(delta){if(busy)return;current=(current+delta+quotes.length)%quotes.length;render()}
 const prefersReduced=window.matchMedia('(prefers-reduced-motion:reduce)').matches;
 function tick(){clearInterval(timer);if(visible&&!paused&&!prefersReduced)timer=setInterval(()=>move(1),7100)}
 const prev=$('[data-patch-review-prev]',section),next=$('[data-patch-review-next]',section),pause=$('[data-patch-review-pause]',section);
 prev?.addEventListener('click',()=>{move(-1);tick()});
 next?.addEventListener('click',()=>{move(1);tick()});
 pause?.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'▶':'Ⅱ';pause.setAttribute('aria-label',paused?'Resume automatic reviews':'Pause automatic reviews');tick()});
 section.addEventListener('mouseenter',()=>{if(!prefersReduced){clearInterval(timer)}});
 section.addEventListener('mouseleave',tick);
 section.addEventListener('focusin',()=>{clearInterval(timer)});
 section.addEventListener('focusout',()=>setTimeout(tick,100));
 if('IntersectionObserver' in window){
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;tick()},{threshold:.12}).observe(section);
 }else{visible=true;tick()}
 render(false);
}
function enhanceSocialIcons(){
 $$('.patch-instagram-link').forEach(a=>{if(!$('.patch-mini-icon',a))a.insertAdjacentHTML('afterbegin',mini('instagram'))});
}
function setupCommerce(){
 if(typeof products==='undefined'||!byId('bagDrawer'))return;
 loadCart();
 buildModal();
 upgradeBag();
 enhanceSocialIcons();
 if(!document.querySelector('script[src$="three-d-motion.js"]'))setupReviews();
 enhanceMotion();
 updateAccountCopy();
 initializeCustomerAuth().catch(()=>{});
 document.addEventListener('click',e=>{
  const target=e.target instanceof Element?e.target:null;if(!target)return;
  /* The old storefront's add handlers use one-item enquiry lists.
     Capture before them so a click increments an actual cart quantity once. */
  const add=target.closest('[data-add],#modalAdd');
  if(add){
   const id=add.getAttribute('data-add')||(byId('modalCode')?.textContent||'').match(/PB-\d+/)?.[0];
   if(id){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();addToCart(id);return;}
  }
  const oldCopy=target.closest('#copyEnquiry');
  if(oldCopy){e.preventDefault();e.stopImmediatePropagation();copyRequest();return;}
  const change=target.closest('[data-patch-minus],[data-patch-plus],[data-patch-remove]');
  if(change){
   e.preventDefault();e.stopPropagation();
   const id=change.dataset.patchMinus||change.dataset.patchPlus||change.dataset.patchRemove;
   if(change.hasAttribute('data-patch-plus'))setQuantity(id,(cart[id]||0)+1);
   else if(change.hasAttribute('data-patch-minus'))setQuantity(id,(cart[id]||0)-1);
   else setQuantity(id,0);
   return;
  }
  if(target.closest('#patchStartCheckout,[data-patch-open-checkout]')){e.preventDefault();openCheckout();return}
  const auth=target.closest('[data-patch-auth]');
  if(auth){e.preventDefault();showAccount(auth.dataset.patchAuth);return;}
  if(target.closest('[data-patch-close]')){e.preventDefault();closeModal();return}
  if(target.closest('[data-patch-signout]')){e.preventDefault();signOut();return}
 },true);
 document.addEventListener('submit',e=>{
  if(e.target.id==='patchAuthForm'){e.preventDefault();submitAuth(e.target);}
  if(e.target.id==='patchCheckoutForm'){e.preventDefault();submitCheckout(e.target);}
 });
 document.addEventListener('change',e=>{
  if(e.target.name==='payment'){
   const submit=$('#patchCheckoutForm button[type=submit]');
   if(submit)submit.textContent=e.target.value==='online'?'Continue to secure payment →':'Copy order request →';
  }
 });
 document.addEventListener('keydown',e=>{
  if(!commerceOpen)return;
  if(e.key==='Escape'){e.preventDefault();closeModal();}
  if(e.key!=='Tab')return;
  const node=$('.patch-commerce-dialog'),focusables=$$('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled)',node).filter(el=>el.offsetParent!==null);
  if(!focusables.length)return;
  if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables[focusables.length-1].focus()}
  else if(!e.shiftKey&&document.activeElement===focusables[focusables.length-1]){e.preventDefault();focusables[0].focus()}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupCommerce);
else setupCommerce();
})();
