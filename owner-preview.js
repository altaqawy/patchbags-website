/* PatCh.BaGs — public-safe owner dashboard visual preview.
   NO real admin authentication, NO DB connections, NO payment credentials.
   Changes affect only this page's in-memory preview for the current visit. */
(()=>{
 "use strict";
 const catalog=[
  {id:"PB-01",name:"The Signature Striped Tote",category:"bags",image:"assets/new/striped-tote-studio-front.webp",color:"Charcoal Stripe"},
  {id:"PB-02",name:"The Ivory Sculpted Tote",category:"bags",image:"assets/new/ivory-tote-portrait-front.webp",color:"Ivory"},
  {id:"PB-03",name:"The Blush Striped Tote",category:"bags",image:"assets/blush-cotton-tote.webp",color:"Blush Stripe"},
  {id:"PB-04",name:"The Taupe Crescent Crossbody",category:"bags",image:"assets/new/crescent-crossbody-taupe.webp",color:"Taupe"},
  {id:"PB-05",name:"The Ivory Crescent Crossbody",category:"bags",image:"assets/new/crescent-crossbody-ivory.webp",color:"Ivory"},
  {id:"PB-06",name:"The Ruby Crescent Crossbody",category:"bags",image:"assets/new/round-crossbody-red.webp",color:"Ruby"},
  {id:"PB-07",name:"The Round Crossbody",category:"bags",image:"assets/round-crossbody-sun.webp",color:"Natural"},
  {id:"PB-08",name:"The Mustard Phone Pouch",category:"accessories",image:"assets/new/phone-pouch-mustard.webp",color:"Mustard"},
  {id:"PB-09",name:"The Natural Phone Pouch",category:"accessories",image:"assets/new/phone-pouch-natural.webp",color:"Natural"},
  {id:"PB-10",name:"The Initial Zip Pouch",category:"personalized",image:"assets/new/monogram-black-h.webp",color:"Personalized"},
  {id:"PB-11",name:"The Chapter Book Sleeve",category:"accessories",image:"assets/new/book-sleeve-grey.webp",color:"Gray"},
  {id:"PB-12",name:"The Gingham Book Sleeve",category:"accessories",image:"assets/book-sleeve-gingham.webp",color:"Gingham"}
 ].map(item=>({...item,description:"",nameEnglish:item.name,comparePrice:null,badge:"Handmade",media:[],featured:false,price:null,stock:0,active:false}));
 let items=catalog;
 const collectionNames={
  bags:{ar:"الشنط",en:"Handmade bags"},accessories:{ar:"الإكسسوارات",en:"Accessories"},personalized:{ar:"القطع المخصصة",en:"Personalized"}
 };
 const previewKey="patchbags_owner_preview_only_v2";
 // Text metadata only; browser file previews are NEVER uploaded or persisted.
 try{
  const saved=JSON.parse(localStorage.getItem(previewKey)||"null");
  if(saved&&typeof saved==="object"){
   if(Array.isArray(saved.categories))for(const c of saved.categories)
    if(c&&/^[a-z0-9-]{2,50}$/.test(c.slug)&&String(c.ar||"").length<71&&String(c.en||"").length<71)
      collectionNames[c.slug]={ar:String(c.ar),en:String(c.en)};
   if(Array.isArray(saved.products))for(const p of saved.products){
    if(!p||! /^(PB-[0-9]{2,4}|DRAFT-[0-9]{2,4})$/.test(p.id)||!p.name)continue;
    const clean={...p,media:Array.isArray(p.media)?p.media.filter(m=>m&&String(m.url||"").startsWith("https://")).slice(0,12):[]};
    if(typeof clean.image!=="string"||!(clean.image.startsWith("https://")||clean.image.startsWith("assets/")))
      clean.image="assets/new/striped-tote-studio-front.webp";
    const idx=items.findIndex(x=>x.id===p.id);
    if(idx>=0)items[idx]={...items[idx],...clean};
    else if(items.length<250)items.push(clean);
   }
  }
 }catch(_){}
 function persistDemo(){
  try{
   const compact=items.map(p=>({...p,media:(p.media||[]).filter(m=>String(m.url||"").startsWith("https://"))}));
   localStorage.setItem(previewKey,JSON.stringify({products:compact,categories:Object.entries(collectionNames).map(([slug,v])=>({slug,...v}))}));
  }catch(_){}
 }

 let editingId=null;
 let toastTimer=null;
 let lastFocus=null;
 const $=(sel,base=document)=>base.querySelector(sel);
 const $$=(sel,base=document)=>[...base.querySelectorAll(sel)];
 const byId=id=>document.getElementById(id);
 const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const categories=Object.fromEntries(Object.entries(collectionNames).map(([id,v])=>[id,v.ar]));
 const panels={overview:"نظرة عامة",products:"المنتجات",categories:"التصنيفات",orders:"الطلبات",customers:"العملاء",payments:"المدفوعات",insights:"الإحصائيات",settings:"إعدادات المتجر"};
 const panelsEnglish={overview:"Overview",products:"Products",categories:"Collections",orders:"Orders",customers:"Customers",payments:"Payments",insights:"Analytics",settings:"Settings"};
 let ownerLocale="ar";
 const formatMoney=value=>value===null||!Number.isFinite(value)?"لم يتحدد":Number(value).toLocaleString("ar-EG",{maximumFractionDigits:2})+" ج.م";
 function notice(message){
  const node=byId("ownerToast");node.textContent=message;
  node.classList.add("is-visible");clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>node.classList.remove("is-visible"),3500);
 }
 function sidebar(open){
  const side=byId("ownerSidebar"),back=byId("ownerBackdrop"),btn=byId("openSidebar");
  side.classList.toggle("is-open",open);
  back.hidden=!open;btn.setAttribute("aria-expanded",String(open));
  document.body.classList.toggle("nav-open",open);
 }
 function view(name){
  if(!panels[name])name="overview";
  $$("[data-panel]").forEach(panel=>{
   const on=panel.dataset.panel===name;
   panel.hidden=!on;panel.classList.toggle("is-active",on);
  });
  $$("#ownerNav button[data-view], .owner-sidebar nav button[data-view]").forEach(btn=>{
   const on=btn.dataset.view===name;
   btn.classList.toggle("is-selected",on);
   if(on)btn.setAttribute("aria-current","page");
   else btn.removeAttribute("aria-current");
  });
  byId("currentPageName").textContent=panels[name];
  sidebar(false);
  if(name==="products")renderProducts();
  if(name==="categories")renderCategories();
  if(name==="overview")renderOverview();
  if(location.hash!=="#"+name)history.replaceState(null,"","#"+name);
  window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth"});
 }
 function renderOverview(){
  byId("statProducts").textContent=items.length.toLocaleString("ar-EG");
  $$(".owner-nav-count").forEach(el=>el.textContent=items.length);
  const featured=items.slice(0,4);
  byId("featuredProducts").innerHTML=featured.map(p=>
   '<article class="preview-product-card"><img src="'+escape(p.image)+'" alt="'+escape(p.name)+'" loading="lazy">'+
   '<div><small>'+escape(p.id)+' · '+escape(p.color)+'</small>'+
   '<strong>'+escape(p.name)+'</strong>'+
   '<button type="button" data-edit="'+escape(p.id)+'">تفاصيل القطعة ↗</button></div></article>'
  ).join("");
 }
 function renderCategories(){
  const rows=Object.entries(collectionNames),list=byId("categoryList");
  if(!list)return;
  list.innerHTML=rows.map(([slug,c])=>
   '<div class="category-item"><span class="category-icon">✳</span>'+
   '<div><strong>'+escape(c.ar)+'</strong><small>'+escape(c.en)+' / '+escape(slug)+'</small></div>'+
   '<span class="category-products-count">'+items.filter(p=>p.category===slug).length+' قطعة</span></div>'
  ).join("");
  const opts=byId("productCategory"),current=opts.value;
  opts.innerHTML='<option value="all">كل الأقسام</option>'+rows.map(([slug,c])=>'<option value="'+escape(slug)+'">'+escape(c.ar)+'</option>').join("");
  opts.value=collectionNames[current]?current:"all";
 }
 function addCategory(e){
  e.preventDefault();
  const ar=byId("categoryArabic").value.trim(),en=byId("categoryEnglish").value.trim();
  const explicit=byId("categorySlug").value.trim().toLowerCase();
  const slug=(explicit||en.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")).slice(0,50);
  if(ar.length<2||en.length<2||!/^[a-z0-9][a-z0-9-]{1,49}$/.test(slug)||collectionNames[slug]){
   notice("راجعي اسم التصنيف أو اختاري رمزًا مختلفًا");return;
  }
  collectionNames[slug]={ar,en};categories[slug]=ar;
  renderCategories();persistDemo();e.target.reset();
  notice("تمت إضافة التصنيف للمعاينة المحلية فقط");
 }
 function renderProducts(){
  const q=byId("productSearch").value.toLocaleLowerCase("en").trim();
  const cat=byId("productCategory").value;
  const list=items.filter(p=>(cat==="all"||p.category===cat)&&
   (p.name.toLocaleLowerCase("en").includes(q)||p.id.toLocaleLowerCase("en").includes(q)||p.color.toLocaleLowerCase("en").includes(q)));
  byId("productsCount").textContent=list.length.toLocaleString("ar-EG")+" قطعة";
  byId("productEmpty").hidden=list.length>0;
  byId("productsTable").innerHTML=list.map(p=>
   '<tr><td><div class="table-product"><img src="'+escape(p.image)+'" alt="" loading="lazy">'+
    '<div><strong dir="ltr">'+escape(p.name)+'</strong><small>'+escape(p.color)+'</small></div></div></td>'+
   '<td dir="ltr">'+escape(p.id)+'</td><td>'+escape(categories[p.category]||"أخرى")+'</td>'+
   '<td>'+formatMoney(p.price)+'</td>'+
   '<td><span class="pill '+(p.active?"":"neutral")+'">'+(p.active?"متاح في المعاينة":"بانتظار التسعير")+'</span></td>'+
   '<td><button type="button" class="table-edit" data-edit="'+escape(p.id)+'">تعديل</button></td></tr>'
  ).join("");
 }
 function openEditor(id){
  let product=items.find(p=>p.id===id);
  if(!product){
   product={id:"DRAFT-"+String(items.length+1).padStart(2,"0"),name:"منتج جديد",category:"bags",color:"New",image:"assets/new/striped-tote-studio-front.webp",price:null,stock:null,active:false};
   items=[...items,product];
   id=product.id;
   renderOverview();renderProducts();
  }
  editingId=id;lastFocus=document.activeElement;
  byId("editorTitle").textContent="تعديل "+product.id;
  byId("editorImage").src=product.image;
  byId("editorImage").alt=product.name;
  byId("editorSku").value=product.id;
  byId("editorName").value=product.name;
  byId("editorPrice").value=product.price===null?"":String(product.price);
  byId("editorStock").value=product.stock===null?"0":String(product.stock);
  byId("editorActive").checked=product.active;
  byId("ownerProductEditor").hidden=false;
  byId("ownerEditorBackdrop").hidden=false;
  document.body.style.overflow="hidden";
  byId("editorName").focus();
 }
 function closeEditor(){
  byId("ownerProductEditor").hidden=true;
  byId("ownerEditorBackdrop").hidden=true;
  document.body.style.overflow="";
  editingId=null;
  if(lastFocus&&document.contains(lastFocus))lastFocus.focus();
  lastFocus=null;
 }
 function saveEditor(event){
  event.preventDefault();
  const p=items.find(item=>item.id===editingId);
  if(!p)return;
  const priceRaw=byId("editorPrice").value.trim();
  const price=priceRaw===""?null:Number(priceRaw);
  const stock=Number(byId("editorStock").value);
  const name=byId("editorName").value.trim();
  if(!name||price!==null&&(!Number.isFinite(price)||price<0)||!Number.isInteger(stock)||stock<0){
   notice("راجعي الاسم والسعر والمخزون");return;
  }
  p.name=name;p.price=price;p.stock=stock;
  p.active=Boolean(byId("editorActive").checked&&price!==null&&price>0&&stock>0);
  closeEditor();
  renderProducts();renderOverview();
  notice("تم تطبيق التعديل في المعاينة فقط — المتجر الحقيقي لم يتغير");
 }
 document.addEventListener("click",event=>{
  const navButton=event.target.closest("button[data-view]");
  if(navButton){event.preventDefault();view(navButton.dataset.view);return}
  const edit=event.target.closest("[data-edit]");
  if(edit){event.preventDefault();openEditor(edit.dataset.edit);return}
  const action=event.target.closest("[data-action]");
  if(action){
   event.preventDefault();
   if(action.dataset.action==="new-product"){view("products");openEditor(null)}
   if(action.dataset.action==="payment-info"){view("payments");byId("paymentGuide").scrollIntoView({behavior:"smooth",block:"start"})}
  }
 });
 byId("openSidebar").addEventListener("click",()=>sidebar(true));
 byId("closeSidebar").addEventListener("click",()=>sidebar(false));
 byId("ownerBackdrop").addEventListener("click",()=>sidebar(false));
 byId("editorClose").addEventListener("click",closeEditor);
 byId("editorCancel").addEventListener("click",closeEditor);
 byId("ownerEditorBackdrop").addEventListener("click",closeEditor);
 byId("productForm").addEventListener("submit",saveEditor);
 byId("productSearch").addEventListener("input",renderProducts);
 byId("productCategory").addEventListener("change",renderProducts);
 document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;
  if(!byId("ownerProductEditor").hidden)closeEditor();else sidebar(false);
 });
 window.addEventListener("hashchange",()=>view(location.hash.slice(1)));
 renderOverview();renderProducts();
 view(location.hash.slice(1)||"overview");
})();
