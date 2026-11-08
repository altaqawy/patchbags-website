/* Patch storefront checkout link to the independent Next.js server.
   Not active until a HTTPS endpoint is explicitly configured. Never submits card data. */
(()=>{
 const endpoint=String(window.PATCH_STORE_CONFIG?.paymentApiEndpoint||'').replace(/\/$/,'');
 if(!/^https:\/\/[^/]+/.test(endpoint))return;
 const accepted=new Set(['paymob','cod','bank','wallet']);
 let catalogMap=new Map();
 function updatePrice(card){
  const id=card.dataset.selectedProduct||card.querySelector('[data-detail]')?.dataset.detail;
  const product=catalogMap.get(id);
  const label=card.querySelector('.product-info p');
  if(!label)return;
  const price=Number(product?.price_minor);
  label.textContent=product?.active && Number.isFinite(price) && price>0
   ?(price/100).toFixed(2)+' EGP'
   :'Details & pricing on request';
 }
 function refreshVisiblePrices(){
  document.querySelectorAll('.product-card').forEach(updatePrice);
 }
 let methods=new Set(),cart={};
 async function reload(){
  const r=await fetch(endpoint+'/api/catalog',{cache:'no-store'});
  if(!r.ok)throw Error('Could not load payment availability');
  const data=await r.json();methods=new Set((data.methods||[]).filter(x=>x.enabled).map(x=>x.method));catalogMap=new Map((data.products||[]).map(x=>[x.id,x]));
  document.querySelectorAll('#patchCheckoutForm input[name=payment]').forEach(radio=>{if(accepted.has(radio.value)){radio.disabled=!methods.has(radio.value);radio.closest('label')?.classList.toggle('disabled',radio.disabled)}});
 refreshVisiblePrices();
 }
 reload().catch(()=>{});
 // Swatches retain a distinct original SKU; repaint any backend-supplied price
 // after the photo/color changes rather than leaving the previous shade's price.
 document.addEventListener('patch:variant-changed',event=>{
  const card=event.target.closest?.('.product-card');
  if(card)updatePrice(card);
 });
 const productGrid=document.getElementById('productGrid');
 if(productGrid && 'MutationObserver' in window){
  new MutationObserver(refreshVisiblePrices).observe(productGrid,{childList:true});
 }
 function enrich(){
  const form=document.getElementById('patchCheckoutForm');if(!form||form.dataset.patchReady)return;
  form.dataset.patchReady='1';
  reload().catch(()=>{});
  const original=form.querySelector('input[name="payment"][value="studio"]')?.closest('label');
  const options=form.querySelector('input[name="payment"][value="online"]')?.closest('label');
  if(options)options.style.display='none';
  const label={paymob:'Pay securely with Paymob',cod:'Cash on delivery',bank:'Bank / InstaPay transfer',wallet:'Mobile wallet transfer'};
  for(const id of ['paymob','cod','bank','wallet']){
   const l=document.createElement('label');l.className='patch-pay-option'+(methods.has(id)?'':' disabled');
   const radio=document.createElement('input');radio.type='radio';radio.name='payment';radio.value=id;radio.disabled=!methods.has(id);
   const span=document.createElement('span');span.innerHTML='<strong>'+label[id]+'</strong><small>'+(methods.has(id)?'Total calculated and confirmed by the store server':'Not yet enabled by the store owner')+'</small>';
   l.append(radio,span);(original||form.querySelector('button[type="submit"]')).before(l);
  }
  const delivery=document.createElement('label');delivery.textContent='Delivery street / address';
  const input=document.createElement('textarea');input.name='address';input.maxLength=300;input.placeholder='Street, building, apartment and delivery details';delivery.appendChild(input);
  const city=form.querySelector('[name="city"]')?.closest('label');city?.after(delivery);
  const fields=()=>[...form.querySelectorAll('input[name="payment"]')];
  fields().forEach(r=>r.addEventListener('change',()=>{
   const submit=form.querySelector('button[type="submit"]'),chosen=fields().find(f=>f.checked)?.value;
   if(submit)submit.textContent=chosen==='paymob'?'Continue to secure payment →':accepted.has(chosen)?'Create order request →':'Copy order request →';
   input.required=accepted.has(chosen);
  }));
 }
 const obs=new MutationObserver(()=>{if(document.getElementById('patchCheckoutForm')&&!document.getElementById('patchCheckoutForm').dataset.patchReady)enrich()});
 obs.observe(document.body,{childList:true,subtree:true});
 document.addEventListener('submit',async e=>{
  const form=e.target;if(!(form instanceof HTMLFormElement)||form.id!=='patchCheckoutForm')return;
  const data=new FormData(form),method=data.get('payment');
  if(!accepted.has(method))return;
  e.preventDefault();e.stopImmediatePropagation();
  const submit=form.querySelector('button[type="submit"]'),feedback=document.getElementById('patchPaymentFeedback');
  if(submit)submit.disabled=true;
  try{
   cart=JSON.parse(localStorage.getItem('patchbags_cart_v2')||'{}');
   const items=Object.entries(cart).filter(([,q])=>Number.isInteger(q)&&q>0).map(([id,quantity])=>({id,quantity}));
   if(!items.length)throw Error('The bag is empty');
   const token=await window.PATCH_AUTH?.getAccessToken?.();
   if(!token||!window.PATCH_AUTH?.isSignedIn?.())throw Error('Sign in to your account before continuing. Your bag is saved.');
   const result=await fetch(endpoint+'/api/checkout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({requestId:crypto.randomUUID()+'-'+Date.now(),cart:items,method,customer:{name:String(data.get('name')||''),email:String(data.get('email')||''),phone:String(data.get('phone')||''),city:String(data.get('city')||''),address:String(data.get('address')||''),notes:String(data.get('notes')||'')}})});
   const response=await result.json();if(!result.ok)throw Error(response.error||'Checkout unavailable');
   if(response.trackingToken&&response.orderId)sessionStorage.setItem('patch_order_'+response.orderId,response.trackingToken);
   if(response.checkoutUrl){const url=new URL(response.checkoutUrl);if(url.protocol!=='https:'||!url.hostname.endsWith('paymob.com'))throw Error('Unexpected payment domain');location.assign(url.href);return;}
   if(feedback){feedback.classList.add('show');feedback.textContent='Order '+response.orderId.slice(0,8)+' received. Payment status: '+response.paymentStatus+'. '+(response.instructions||'')+' '+(response.receivingAccount||'')+' Do not send money until you confirm the receiving details with the studio.';}
   if(['bank','wallet'].includes(method)&&response.trackingToken){
    const box=document.createElement('div');box.style.marginTop='12px';const label=document.createElement('label');label.textContent='Transaction reference after your transfer';
    const field=document.createElement('input');field.type='text';field.placeholder='Transfer reference';field.maxLength=120;field.style.margin='8px 0';
    const button=document.createElement('button');button.type='button';button.textContent='Submit reference for manual verification';button.className='patch-form-submit';
    button.addEventListener('click',async()=>{if(field.value.trim().length<5)return;const res=await fetch(endpoint+'/api/orders/'+response.orderId+'/reference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({trackingToken:response.trackingToken,reference:field.value.trim()})});if(res.ok){button.disabled=true;button.textContent='Reference sent — awaiting studio verification'}else button.textContent='Unable to submit reference — try again';});
    label.append(field,button);box.append(label);feedback?.after(box);
   }
  }catch(err){if(feedback){feedback.classList.add('show');feedback.textContent=err.message||'Payment request failed';}}
  finally{if(submit)submit.disabled=false;}
 },true);
})();
