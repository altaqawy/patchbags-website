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
  byId("currentPageName").textContent=ownerLocale==="ar"?panels[name]:panelsEnglish[name];
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
 let pendingMedia=[];
 const objectUrls=[];
 const fileTypes={
  "image/jpeg":"image","image/png":"image","image/webp":"image",
  "video/mp4":"video","video/webm":"video","model/gltf-binary":"model","model/gltf+json":"model"
 };
 const mediaType=(name,mime)=>{
  if(fileTypes[mime])return fileTypes[mime];
  if(/\.glb$|\.gltf$/i.test(name))return "model";
  if(/\.mp4$|\.webm$/i.test(name))return "video";
  if(/\.(png|jpe?g|webp)$/i.test(name))return "image";
  return null;
 };
 function renderMedia(){
  const el=byId("editorMediaList");
  el.innerHTML=pendingMedia.map((m,i)=>{
   const thumb=m.type==="image"?'<img src="'+escape(m.url)+'" alt="'+escape(m.name||"Preview")+'">':
   m.type==="video"?'<video src="'+escape(m.url)+'" preload="metadata" muted controls playsinline></video>':
   '<model-viewer class="editor-3d" src="'+escape(m.url)+'" camera-controls auto-rotate interaction-prompt="none" alt="3D model preview"><div slot="poster" class="model-poster">3D</div></model-viewer>';
   return '<div class="editor-media-item">'+thumb+
     '<div><span>'+escape(m.type.toUpperCase())+'</span><small>'+escape(m.name||"Media")+'</small></div>'+
     '<button type="button" data-remove-media="'+i+'" aria-label="Remove media">×</button></div>';
  }).join("");
 }
 function addFiles(event){
  const files=Array.from(event.target.files||[]);
  for(const file of files){
   const type=mediaType(file.name,file.type);
   const maxSize=type==="image"?10:60;
   if(!type||file.size>maxSize*1024*1024||pendingMedia.length>=12){
    notice("راجعي نوع الملف أو حجمه (حد أقصى 12 ملفًا)");continue;
   }
   const url=URL.createObjectURL(file);
   objectUrls.push(url);
   pendingMedia.push({type,name:file.name,url,localOnly:true});
  }
  renderMedia();
  event.target.value="";
 }
 function addMediaLink(){
  const raw=byId("editorMediaUrl").value.trim();
  let url;try{url=new URL(raw)}catch(_){notice("أدخلي رابط HTTPS صحيح");return}
  if(url.protocol!=="https:"||url.username||url.password||pendingMedia.length>=12){
   notice("الرابط لازم يكون HTTPS بدون بيانات دخول");return;
  }
  const type=mediaType(url.pathname,"");
  if(!type){notice("الرابط لازم ينتهي بصورة أو فيديو أو GLB/GLTF");return}
  pendingMedia.push({type,url:url.href,name:url.pathname.split("/").pop()||"Media"});
  byId("editorMediaUrl").value="";
  renderMedia();
 }
 function discountStatus(){
  const now=Number(byId("editorPrice").value),old=Number(byId("editorComparePrice").value);
  const el=byId("editorDiscountStatus");
  if(byId("editorPrice").value&&byId("editorComparePrice").value&&old>now&&now>=0){
   const pct=Math.round((1-now/old)*100);
   el.textContent="خصم "+pct+"% · السعر قبل: "+old+" ج.م · السعر الحالي: "+now+" ج.م";
   el.classList.add("has-discount");
  }else{
   el.textContent="لا يظهر خصم إلا لما يكون السعر قبل الخصم أكبر من السعر الحالي.";
   el.classList.remove("has-discount");
  }
 }
 function openEditor(id){
  let product=items.find(p=>p.id===id);
  if(!product){
   const draftIds=items.filter(x=>x.id.startsWith("DRAFT-")).map(x=>Number(x.id.replace("DRAFT-",""))||0);
   const n=Math.max(items.length+1,...draftIds)+1;
   product={id:"DRAFT-"+String(n).padStart(2,"0"),name:"منتج جديد",nameEnglish:"",description:"",category:"bags",color:"New",image:"assets/new/striped-tote-studio-front.webp",media:[],price:null,comparePrice:null,stock:0,badge:"New",featured:false,active:false};
   items=[...items,product];id=product.id;
   renderOverview();renderCategories();renderProducts();renderCategories();
  }
  editingId=id;lastFocus=document.activeElement;
  const select=byId("editorCategory");
  select.innerHTML=Object.entries(collectionNames).map(([slug,c])=>'<option value="'+escape(slug)+'">'+escape(c.ar)+'</option>').join("");
  select.value=collectionNames[product.category]?product.category:"bags";
  byId("editorTitle").textContent="تعديل "+product.id;
  byId("editorImage").src=product.image;
  byId("editorImage").alt=product.name;
  byId("editorSku").value=product.id;
  byId("editorName").value=product.name;
  byId("editorEnglish").value=product.nameEnglish||product.name;
  byId("editorDescription").value=product.description||"";
  byId("editorPrice").value=product.price===null?"":String(product.price);
  byId("editorComparePrice").value=product.comparePrice===null||product.comparePrice===undefined?"":String(product.comparePrice);
  byId("editorStock").value=product.stock===null?"0":String(product.stock);
  byId("editorBadge").value=product.badge||"";
  byId("editorFeatured").checked=Boolean(product.featured);
  byId("editorActive").checked=Boolean(product.active);
  pendingMedia=(product.media||[]).filter(m=>typeof m.url==="string"&&(m.url.startsWith("https://")||objectUrls.includes(m.url))).map(m=>({...m}));
  renderMedia();discountStatus();
  byId("ownerProductEditor").hidden=false;
  byId("ownerEditorBackdrop").hidden=false;
  document.body.style.overflow="hidden";
  byId("editorName").focus();
 }
 function closeEditor(){
  byId("ownerProductEditor").hidden=true;
  byId("ownerEditorBackdrop").hidden=true;
  document.body.style.overflow="";
  editingId=null;pendingMedia=[];
  if(lastFocus&&document.contains(lastFocus))lastFocus.focus();
  lastFocus=null;
 }
 function saveEditor(event){
  event.preventDefault();
  const p=items.find(item=>item.id===editingId);
  if(!p)return;
  const raw=byId("editorPrice").value.trim(),rawBefore=byId("editorComparePrice").value.trim();
  const price=raw===""?null:Number(raw),before=rawBefore===""?null:Number(rawBefore);
  const stock=Number(byId("editorStock").value),name=byId("editorName").value.trim();
  if(!name||name.length>200||price!==null&&(!Number.isFinite(price)||price<0)||
      before!==null&&(!Number.isFinite(before)||before<=0||price===null||before<=price)||
      !Number.isSafeInteger(stock)||stock<0){
   notice("راجعي الأسعار: قبل الخصم لازم يكون أكبر من السعر الحالي");return;
  }
  p.name=name;p.nameEnglish=byId("editorEnglish").value.trim();
  p.category=byId("editorCategory").value;
  p.description=byId("editorDescription").value.trim();
  p.price=price;p.comparePrice=before;p.stock=stock;
  p.badge=byId("editorBadge").value.trim();
  p.featured=byId("editorFeatured").checked;
  p.active=Boolean(byId("editorActive").checked&&price!==null&&price>0&&stock>0);
  p.media=pendingMedia.map(m=>({...m}));
  const cover=p.media.find(m=>m.type==="image");
  if(cover)p.image=cover.url;
  closeEditor();persistDemo();renderProducts();renderOverview();renderCategories();
  notice("اتحفظ التعديل في المعاينة على جهازك فقط، مش على المتجر الحقيقي");
 }
 document.addEventListener("click",event=>{
  const navButton=event.target.closest("button[data-view]");
  if(navButton){event.preventDefault();view(navButton.dataset.view);return}
  const rm=event.target.closest("[data-remove-media]");
  if(rm){
   event.preventDefault();
   pendingMedia.splice(Number(rm.dataset.removeMedia),1);
   renderMedia();return;
  }
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
 byId("categoryForm").addEventListener("submit",addCategory);
 byId("editorMediaFiles").addEventListener("change",addFiles);
 byId("editorAddMedia").addEventListener("click",addMediaLink);
 byId("editorPrice").addEventListener("input",discountStatus);
 byId("editorComparePrice").addEventListener("input",discountStatus);
 document.querySelectorAll("[data-period]").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll("[data-period]").forEach(b=>b.classList.toggle("is-active",b===btn));
  byId("analyticsPeriod").textContent="آخر "+btn.dataset.period+" يوم · لا توجد بيانات متصلة";
 }));
 byId("ownerLanguage").addEventListener("click",()=>{
  ownerLocale=ownerLocale==="ar"?"en":"ar";
  const nameMap=ownerLocale==="ar"?panels:panelsEnglish;
  byId("currentPageName").textContent=nameMap[location.hash.slice(1)]||nameMap.overview;
  document.querySelectorAll('.owner-nav button[data-view]').forEach(btn=>{
   btn.childNodes.forEach(node=>{if(node.nodeType===3&&node.textContent.trim())node.textContent=nameMap[btn.dataset.view]||node.textContent});
  });
  byId("ownerLanguage").textContent=ownerLocale==="ar"?"English":"العربية";
  byId("ownerLanguage").setAttribute("aria-pressed",String(ownerLocale==="en"));
  notice(ownerLocale==="en"?"Navigation in English · Arabic descriptions are retained":"القائمة بالعربي · الوصف عربي");
 });
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
