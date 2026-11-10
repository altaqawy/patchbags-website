/* Patch Bags V4.2 — Design Your Bag Studio.
   Requests only. Existing product photography is NEVER AI-recolored, and selected
   materials/sizes/custom colors are not advertised as confirmed inventory.
   Client-only drafts are deliberately separate from chargeable SKU cart items. */
(()=>{
'use strict';
const KEY='patchbags_custom_designs_v1';
const LIMIT=12;
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const ar=()=>document.documentElement.lang==='ar';
const phrase=(en,arabic)=>ar()?arabic:en;
const cat=()=>typeof products!=='undefined'&&Array.isArray(products)?products.filter(p=>p.category==='bags'):[];
const product=id=>cat().find(p=>p.id===id)||null;
const currentProduct=()=>product(state.productId)||cat()[0]||null;
const roots=()=>cat().filter(p=>typeof colorRootById==='undefined'||!colorRootById.has(p.id)||colorRootById.get(p.id)===p.id);
const rootId=id=>(typeof colorRootById!=='undefined'&&colorRootById.get(id))||id;
const photos=p=>Array.isArray(p?.images)&&p.images.length?p.images.slice(0,12):[p?.image].filter(Boolean);
const safeModelURL=value=>{
 if(typeof value!=='string')return null;
 const raw=value.trim();
 const local=/^assets\/models\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.gl(?:b|tf)$/i.test(raw);
 const remote=/^https:\/\/[^\s]+$/i.test(raw);
 if(!local&&!remote)return null;
 try{
  const url=new URL(raw,document.baseURI);
  if(url.protocol!=='https:'||!/\.gl(?:b|tf)$/i.test(url.pathname))return null;
  return local?raw:url.href;
 }catch(_){return null}
};
const availableModel=p=>Array.isArray(p?.mediaExtras)?
 p.mediaExtras.map(m=>m?.type==='model'?safeModelURL(m.url):null).find(Boolean)||null:null;
const families=()=>typeof productColorFamilies!=='undefined'?productColorFamilies:[];
const choices=id=>{
 const family=families().find(f=>f.options.some(option=>option.id===id));
 return family?family.options.filter(v=>product(v.id)):[{id,color:'As photographed',hex:'#ded8cb'}];
};
const clean=(v,max=220)=>String(v??'').replace(/[\u0000-\u001F\u007F<>]/g,' ').trim().slice(0,max);
const safeDesign=d=>{
 if(!d||typeof d!=='object'||!product(d.productId))return null;
 const material=['as_shown','cotton_rope_request','fabric_request'].includes(d.material)?d.material:'as_shown';
 const size=['as_shown','compact_request','roomy_request'].includes(d.size)?d.size:'as_shown';
 const colorMode=d.colorMode==='custom'?'custom':'photo';
 const letterStyle=['classic','modern','signature'].includes(d.letterStyle)?d.letterStyle:'classic';
 const letterPosition=['center','lower'].includes(d.letterPosition)?d.letterPosition:'lower';
 return {id:clean(d.id,48)||'draft-'+Date.now(),productId:d.productId,
  material,size,colorMode,letterStyle,letterPosition,customColor:clean(d.customColor,48),
  monogram:clean(d.monogram,14),notes:clean(d.notes,240),
  qty:Math.max(1,Math.min(5,Math.round(Number(d.qty)||1)))};
};
const read=()=>{
 try{
  const v=JSON.parse(localStorage.getItem(KEY)||'[]');
  if(!Array.isArray(v))return [];
  return v.slice(0,LIMIT).map(safeDesign).filter(Boolean);
 }catch(_){return []}
};
let saved=read();
const write=()=>{
 try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(_){return false}
 document.dispatchEvent(new CustomEvent('patch:custom-designs-changed',{detail:{count:saved.reduce((n,d)=>n+d.qty,0)}}));
 return true;
};
const base=()=>({id:'',productId:cat()[0]?.id||'PB-01',material:'as_shown',size:'as_shown',colorMode:'photo',customColor:'',monogram:'',letterStyle:'classic',letterPosition:'lower',notes:'',qty:1});
let state=base();
let layer=null,body=null,prevFocus=null,prevOverflow='';
let photoIndex=0,editingId=null,touchX=null,viewMode='photo',studioLight='studio';
const tr={
 kicker:['DESIGN YOUR BAG / PATCH STUDIO','صمّمي حقيبتك / استوديو باتش'],
 title:['Made yours.','قطعة على ذوقك.'],
 desc:['Choose a photographed style, then send your personalization wishes to the maker.','اختاري التصميم الأقرب لذوقك، وأضيفي التفاصيل اللي تحبي تنفذها صاحبة المشروع.'],
 preview:['YOUR CONCEPT','تصورك الخاص'],
 previewCaption:['Illustrative concept · original product photograph','معاينة مبدئية · صورة المنتج الأصلية'],
 previewNotice:['A letter is shown as an example only, not a rendered embroidery or finished product.','الحرف المعروض للتوضيح فقط وليس تطريزًا فعليًا أو شكلًا نهائيًا للمنتج.'],
 chooseBase:['01 / CHOOSE THE BAG','01 / اختاري التصميم'],
 chooseColor:['02 / PHOTOGRAPHED COLOR','02 / اللون المصوّر'],
 customColor:['Request another color','اطلبي لونًا مختلفًا'],
 customColorHint:['Describe your preferred shade','اكتبي درجة اللون المطلوبة'],
 material:['03 / MATERIAL REQUEST','03 / الخامة المطلوبة'],
 materialOptions:[['as_shown','As photographed','مثل المعروض'],['cotton_rope_request','Cotton rope request','حبال قطن حسب الطلب'],['fabric_request','Fabric request','قماش حسب الطلب']],
 size:['04 / SIZE REQUEST','04 / الحجم المطلوب'],
 sizeOptions:[['as_shown','As photographed','مثل المعروض'],['compact_request','Compact request','حجم صغير حسب الطلب'],['roomy_request','Roomier request','حجم أكبر حسب الطلب']],
 monogram:['INITIALS OR NAME · OPTIONAL','حرف أو اسم · اختياري'],
 monogramPlaceholder:['Up to 14 characters','حتى 14 حرفًا'],
 note:['YOUR NOTES · OPTIONAL','ملاحظات إضافية · اختياري'],
 notePlaceholder:['Tell us about the color, handle, or detail you would like.','اكتبي أي تفاصيل تحبي تضيفيها للتصميم'],
 quantity:['QUANTITY','الكمية'],
 caution:['Colors, materials, dimensions, lettering and price require confirmation from the studio. No payment is taken.','الألوان والخامات والمقاسات والحروف والسعر بتتأكد من صاحبة المشروع قبل التنفيذ. مفيش أي دفع هنا.'],
 save:['SAVE DESIGN TO BAG','احفظي التصميم في الحقيبة'],
 saved:['Saved design requests','طلبات التخصيص المحفوظة'],
 savedNone:['Your personal designs will appear here.','تصميماتك اللي حفظتيها هتظهر هنا.'],
 copy:['Copy request','انسخي الطلب'],
 whatsapp:['Discuss on WhatsApp','اسألي عنها على واتساب'],
 remove:['Remove','إزالة'],
 savedDevice:['Saved only on this device until checkout integration is enabled.','محفوظة على الجهاز ده فقط لحين ربط الطلبات بالحساب.'],
 savedDone:['Your design was saved. The studio will confirm availability and pricing.','تم حفظ تصميمك، وصاحبة المشروع هتأكد التوفر والسعر قبل التنفيذ.'],
 colorLabel:['Color request','لون حسب الطلب'],
 photoLabel:['Real product photo','صورة المنتج الحقيقية'],
 photoInfo:['Selecting a photographed color changes the reference image. A custom shade will not recolor the photo.','اختيار لون مصوّر بيغير الصورة المرجعية، أما طلب لون جديد مش هيغيّر صورة المنتج.'],
 notice:['Request only — not an online order','طلب تخصيص مبدئي — مش طلب شراء مؤكد'],
 draftLabel:['Custom design','تصميم مخصص'],
 bagLabel:['Added to your bag as a design request','أُضيف للحقيبة كطلب تخصيص'],
 errors:['Please choose a bag and describe the custom color you want.','اختاري الشنطة واكتبي اللون المطلوب لو اخترتي لونًا مخصصًا.'],
 offline:['Could not save on this device. Please copy your request instead.','تعذر الحفظ على الجهاز، جربي نسخ الطلب بدلًا من كده.'],
 max:['Your bag already has the maximum number of saved designs.','وصلتي للحد الأقصى من التصميمات المحفوظة.'],
 copied:['Request copied — send it to the studio to confirm details.','اتنسخت تفاصيل التصميم، ابعتيها للاستوديو لتأكيد الطلب.'],
 share:['Copy all designs','نسخ كل التصميمات'],
 close:['Close customizer','إغلاق أداة التخصيص'],
 open:['Design your bag','صمّمي شنطتك'],
 manage:['Manage saved designs','إدارة التصميمات المحفوظة'],
 noBag:['Choose a bag first','اختاري شنطة الأول'],
 previewOnly:['Preview uses the original photograph','المعاينة بتستخدم صورة المنتج الأصلية'],
 imageViews:['REAL PRODUCT PHOTOS','صور حقيقية للمنتج'],
 prevImage:['Previous product photo','صورة المنتج السابقة'],
 nextImage:['Next product photo','صورة المنتج التالية'],
 viewImage:['View product photo','عرض صورة المنتج'],
 edit:['Edit design','تعديل التصميم'],
 update:['UPDATE SAVED DESIGN','احفظي التعديلات'],
 cancelEdit:['Cancel editing','إلغاء التعديل'],
 editingTitle:['EDITING YOUR DESIGN','بتعدّلي تصميمك المحفوظ'],
 updateDone:['Your saved design has been updated.','تم حفظ تعديلات التصميم.'],
 summary:['YOUR DESIGN DETAILS','تفاصيل تصميمك'],
 summaryMaterial:['Material','الخامة'],
 summarySize:['Size','الحجم'],
 summaryColor:['Color','اللون'],
 summaryName:['Lettering','الكتابة'],
 summaryQty:['Quantity','العدد'],
 notSet:['Not selected','بدون إضافة'],
 letterStyle:['LETTERING STYLE · PREVIEW ONLY','شكل الخط · للتوضيح فقط'],
 letterPosition:['LETTER POSITION · PREVIEW ONLY','مكان الحرف · للتوضيح فقط'],
 letterStyles:[['classic','Classic serif','كلاسيكي'],['modern','Modern minimal','مودرن بسيط'],['signature','Soft signature','توقيع ناعم']],
 letterPositions:[['lower','Lower area','أسفل المعاينة'],['center','Center area','منتصف المعاينة']],
 explorePhotos:['Tap the thumbnails to see real angles of this piece.','اضغطي على الصور المصغرة وشوفي الشنطة من زوايا مختلفة.'],
 chooseStyle:['CHOOSE A SHAPE','اختاري شكل الشنطة'],
 previewSummary:['Your choices are updated as you design. Availability and final execution require confirmation.','اختياراتك بتتحدث مع التصميم. إمكانية التنفيذ والسعر النهائي بعد التأكيد.'],
 reviewSaved:['Review saved requests','راجعي تصميماتك المحفوظة'],
 photosTab:['Photos','الصور'],
 modelTab:['3D model','نموذج 3D'],
 modelPreview:['Original 3D model provided by the studio','نموذج ثلاثي الأبعاد أصلي من الاستوديو'],
 modelHelp:['Drag to rotate and pinch to zoom the 3D bag. Model size and materials are illustrative until confirmed by the studio.','لفّي المجسم باللمس أو الماوس وكبّريه بإصبعين. الحجم والخامة للتوضيح لحد ما صاحبة المشروع تأكد التفاصيل.'],
 modelLoadFailed:['Could not load the 3D model. Product photos remain available.','تعذر تحميل المجسم ثلاثي الأبعاد، لكن صور الشنطة ما زالت متاحة.'],
 studioLight:['PREVIEW LIGHT','إضاءة المعاينة'],
 studio:['Studio','استوديو'],
 daylight:['Daylight','نهار'],
 soft:['Soft','ناعمة'],
 previewColorNote:['3D colors are illustrative. Real fabric shade depends on the item and lighting.','ألوان المجسم توضيحية، ودرجة الخامة الحقيقية ممكن تختلف حسب الإضاءة.']
};
const T=k=>{const v=tr[k];return v? v[ar()?1:0]:k};
const materialLabel=v=>tr.materialOptions.find(x=>x[0]===v)?.[ar()?2:1]||v;
const sizeLabel=v=>tr.sizeOptions.find(x=>x[0]===v)?.[ar()?2:1]||v;
const letterLabel=v=>tr.letterStyles.find(x=>x[0]===v)?.[ar()?2:1]||v;
const positionLabel=v=>tr.letterPositions.find(x=>x[0]===v)?.[ar()?2:1]||v;
const productLabel=p=>ar()?(p.nameAr||window.PATCH_LANGUAGE?.translate?.(p.name)||p.name):p.name;
const referenceColor=(id)=>{const opt=families().flatMap(f=>f.options).find(x=>x.id===id);
 return opt?ar()?(window.PATCH_LANGUAGE?.translate?.(opt.color)||opt.color):opt.color:phrase('As photographed','مثل الصورة');};
const description=d=>{
 const p=product(d.productId);
 return [
  productLabel(p||{name:d.productId})+' ('+d.productId+')',
  phrase('Photo color','اللون المصوّر')+': '+(d.colorMode==='custom'?T('colorLabel')+': '+d.customColor:referenceColor(d.productId)),
  phrase('Material','الخامة')+': '+materialLabel(d.material),
  phrase('Size','الحجم')+': '+sizeLabel(d.size),
  ...(d.monogram?[
    phrase('Initials/name','الحرف أو الاسم')+': '+d.monogram,
    phrase('Requested letter style (illustrative)','نوع الخط المطلوب (توضيحي)')+': '+letterLabel(d.letterStyle),
    phrase('Requested placement (illustrative)','مكان الكتابة المطلوب (توضيحي)')+': '+positionLabel(d.letterPosition)
   ]:[]),
  ...(d.notes?[phrase('Notes','ملاحظات')+': '+d.notes]:[]),
  phrase('Quantity','الكمية')+': '+d.qty
 ].join('\n');
};
const formatRequests=designs=>{
 const rows=designs.map((d,i)=>phrase('Custom design','تصميم مخصص')+' '+(i+1)+'\n'+description(d)).join('\n\n');
 return phrase('Hello PatCh.BaGs, I would like to request a custom handmade bag:\n','مرحبًا باتش باجز، حابة أستفسر عن تنفيذ شنطة مخصصة:\n')+
 rows+'\n\n'+phrase('Please confirm which options are possible, the final price, production time and shipping. No order or payment has been placed.','ياريت تأكدوا التفاصيل المتاحة والسعر النهائي ومدة التنفيذ والتوصيل. ده استفسار مبدئي من غير تأكيد طلب أو دفع.');
};
async function copyText(text){
 try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(_){}
 const input=document.createElement('textarea');input.value=text;input.style.cssText='position:fixed;left:-9999px;opacity:0';
 document.body.appendChild(input);input.select();let okay=false;
 try{okay=document.execCommand('copy')}catch(_){}
 input.remove();return okay;
}
function notify(text){
 const node=document.getElementById('toast');
 if(!node)return;node.textContent=text;node.classList.add('show');
 clearTimeout(notify.timer);notify.timer=setTimeout(()=>node.classList.remove('show'),3500);
}
const chip=(value,active,label,attr)=>'<button type="button" class="patch-cz-choice'+(active?' selected':'')+'" '+attr+'="'+E(value)+'" aria-pressed="'+active+'">'+E(label)+'</button>';
function imageSrc(p){return p?.image||''}
function summaryRows(){
 return [
  [T('summaryColor'),state.colorMode==='custom'?(state.customColor||T('colorLabel')):referenceColor(state.productId)],
  [T('summaryMaterial'),materialLabel(state.material)],
  [T('summarySize'),sizeLabel(state.size)],
  [T('summaryName'),state.monogram||T('notSet')],
  [T('summaryQty'),String(state.qty)]
 ];
}
function summaryMarkup(){
 return summaryRows().map(([label,value])=>'<div class="patch-cz-summary-row"><dt>'+E(label)+'</dt><dd>'+E(value)+'</dd></div>').join('');
}
function redrawSummary(){
 const node=layer?.querySelector('.patch-cz-summary-values');
 if(node)node.innerHTML=summaryMarkup();
}
function render(){
 if(!body)return;
 const scroll=body.querySelector('.patch-cz-editor')?.scrollTop||0;
 const active=document.activeElement;
 const focusAttr=active instanceof Element?[...active.attributes].find(a=>a.name.startsWith('data-cz-')&&!['data-cz-input'].includes(a.name)):null;
 const p=currentProduct();if(!p)return;
 const locale=ar()?'ar':'en';
 layer.lang=locale;layer.dir=ar()?'rtl':'ltr';
 const list=roots();
 const imageList=photos(p);
 const model=availableModel(p);
 if(!model)viewMode='photo';
 photoIndex=Math.max(0,Math.min(photoIndex,imageList.length-1));
 const optionList=choices(p.id);
 const colorGroup=optionList.map(v=>{
  const selected=state.productId===v.id&&state.colorMode==='photo';
  const label=referenceColor(v.id);
  return '<button type="button" class="patch-cz-color'+(selected?' selected':'')+'" data-cz-color="'+E(v.id)+'" aria-pressed="'+selected+'" aria-label="'+E(label)+'" title="'+E(label)+'">'+
   '<span class="patch-cz-swatch" style="background:'+E(v.hex||'#ddd3c1')+'"></span><span>'+E(label)+'</span></button>';
 }).join('');
 const selected=state.colorMode==='custom';
 const image=E(imageList[photoIndex]||imageSrc(p));
 body.innerHTML=
 '<div class="patch-cz-gallery"><div class="patch-cz-gallery-inner">'+
  '<p class="patch-cz-overline">'+E(T('preview'))+' <span>✳</span></p>'+
  (model?'<div class="patch-cz-view-modes" role="group"><button type="button" data-cz-view="photo" aria-pressed="'+(viewMode==='photo')+'">'+E(T('photosTab'))+'</button><button type="button" data-cz-view="model" aria-pressed="'+(viewMode==='model')+'">'+E(T('modelTab'))+'</button></div>':'')+
  '<div class="patch-cz-photo'+(viewMode==='model'?' patch-cz-photo-model':'')+'" aria-label="'+E(viewMode==='model'?T('modelPreview'):T('previewOnly'))+'">'+
  (viewMode==='model'&&model?'<model-viewer src="'+E(model)+'" poster="'+E(image)+'" alt="'+E(productLabel(p))+'" camera-controls touch-action="pan-y" shadow-intensity="0.85" exposure="1.05" environment-image="neutral" loading="eager">'+
      '</model-viewer>':
   '<img src="'+image+'" alt="'+E(productLabel(p)+' · '+(photoIndex+1)+' / '+imageList.length)+'" decoding="async">')+
  (viewMode==='photo'&&state.monogram?'<span class="patch-cz-monogram patch-cz-monogram--'+E(state.letterStyle)+' patch-cz-monogram--'+E(state.letterPosition)+'">'+E(state.monogram)+'</span>':'')+
  '<span class="patch-cz-photo-tag">'+E(viewMode==='model'?T('modelPreview'):T('previewOnly'))+'</span>'+
  (viewMode==='photo'&&imageList.length>1?'<div class="patch-cz-photo-arrows"><button type="button" data-cz-photo="-1" aria-label="'+E(T('prevImage'))+'">←</button><span aria-live="polite">'+(photoIndex+1)+' / '+imageList.length+'</span><button type="button" data-cz-photo="1" aria-label="'+E(T('nextImage'))+'">→</button></div>':'')+'</div>'+
  (viewMode==='photo'&&imageList.length>1?'<div class="patch-cz-thumbs" role="group" aria-label="'+E(T('imageViews'))+'">'+imageList.map((src,i)=>
   '<button type="button" data-cz-thumb="'+i+'" class="'+(i===photoIndex?'active':'')+'" aria-label="'+E(T('viewImage')+' '+(i+1))+'" aria-pressed="'+(i===photoIndex)+'"><img src="'+E(src)+'" alt="" loading="lazy"></button>'
  ).join('')+'</div>':'')+
  '<div class="patch-cz-preview-bottom"><p>'+E(productLabel(p))+'</p><span>'+E(T('previewCaption'))+'</span></div>'+
  '<p class="patch-cz-preview-note">'+E(viewMode==='model'?T('modelHelp'):T('previewNotice'))+'</p>'+
  (viewMode==='model'&&window.PATCH_BAG_LOOKS?.isReference(model)?'<div class="patch-cz-studio-light"><span>'+E(T('studioLight'))+'</span><div role="group">'+
   ['studio','daylight','soft'].map(id=>'<button type="button" data-cz-studio-light="'+id+'" aria-pressed="'+(studioLight===id)+'">'+E(T(id))+'</button>').join('')+'</div><small>'+E(T('previewColorNote'))+'</small></div>':'')+
  '<div class="patch-cz-summary"><p class="patch-cz-summary-title">'+E(T('summary'))+'</p><dl class="patch-cz-summary-values" aria-live="off">'+summaryMarkup()+'</dl><p>'+E(T('previewSummary'))+'</p></div></div></div>'+
 '<div class="patch-cz-editor"><div class="patch-cz-top">'+
  '<p class="patch-cz-kicker">'+E(editingId?T('editingTitle'):T('kicker'))+'</p>'+
  '<h2 id="patchCustomizerTitle">'+E(T('title'))+'</h2>'+
  '<p class="patch-cz-intro">'+E(T('desc'))+'</p></div>'+
  '<fieldset class="patch-cz-field"><legend>'+E(T('chooseStyle'))+'</legend><div class="patch-cz-products">'+list.map(item=>
   '<button type="button" class="patch-cz-product'+(item.id===rootId(p.id)?' selected':'')+'" data-cz-product="'+E(item.id)+'" aria-pressed="'+(item.id===rootId(p.id))+'">'+
   '<img src="'+E(imageSrc(item))+'" alt="" loading="lazy"><span>'+E(productLabel(item))+'</span></button>').join('')+'</div></fieldset>'+
  '<fieldset class="patch-cz-field"><legend>'+E(T('chooseColor'))+'</legend><div class="patch-cz-colors">'+colorGroup+
    '<button type="button" class="patch-cz-color patch-cz-custom-color'+(selected?' selected':'')+'" data-cz-custom-color aria-pressed="'+selected+'"><span class="patch-cz-swatch patch-cz-custom-swatch">＋</span><span>'+E(T('customColor'))+'</span></button></div>'+
    (selected?'<label class="patch-cz-control">'+E(T('customColorHint'))+'<input data-cz-input="customColor" type="text" maxlength="48" value="'+E(state.customColor)+'"></label>':'')+
    '<p class="patch-cz-muted">'+E(T('photoInfo'))+'</p></fieldset>'+
  '<fieldset class="patch-cz-field"><legend>'+E(T('material'))+'</legend><div class="patch-cz-choices">'+tr.materialOptions.map(x=>chip(x[0],state.material===x[0],x[ar()?2:1],'data-cz-material')).join('')+'</div></fieldset>'+
  '<fieldset class="patch-cz-field"><legend>'+E(T('size'))+'</legend><div class="patch-cz-choices">'+tr.sizeOptions.map(x=>chip(x[0],state.size===x[0],x[ar()?2:1],'data-cz-size')).join('')+'</div></fieldset>'+
  '<div class="patch-cz-personalization"><p class="patch-cz-personal-title">'+E(T('letterStyle'))+'</p><div class="patch-cz-choices">'+tr.letterStyles.map(x=>chip(x[0],state.letterStyle===x[0],x[ar()?2:1],'data-cz-letter-style')).join('')+'</div>'+
  '<p class="patch-cz-personal-title">'+E(T('letterPosition'))+'</p><div class="patch-cz-choices">'+tr.letterPositions.map(x=>chip(x[0],state.letterPosition===x[0],x[ar()?2:1],'data-cz-letter-position')).join('')+'</div></div>'+
  '<div class="patch-cz-fields-row"><label class="patch-cz-control">'+E(T('monogram'))+'<input data-cz-input="monogram" autocomplete="off" type="text" maxlength="14" placeholder="'+E(T('monogramPlaceholder'))+'" value="'+E(state.monogram)+'"></label>'+
  '<div class="patch-cz-control patch-cz-qty"><span>'+E(T('quantity'))+'</span><div class="patch-cz-qty-stepper"><button type="button" data-cz-qty="-1" aria-label="Decrease">−</button><output>'+state.qty+'</output><button type="button" data-cz-qty="1" aria-label="Increase">+</button></div></div></div>'+
  '<label class="patch-cz-control">'+E(T('note'))+'<textarea data-cz-input="notes" rows="2" maxlength="240" placeholder="'+E(T('notePlaceholder'))+'">'+E(state.notes)+'</textarea></label>'+
  '<div class="patch-cz-save"><p>'+E(T('caution'))+'</p><div class="patch-cz-save-actions"><button type="button" class="patch-cz-save-btn" data-cz-save>'+E(editingId?T('update'):T('save'))+' <span aria-hidden="true">↗</span></button>'+
   (editingId?'<button type="button" class="patch-cz-cancel" data-cz-cancel>'+E(T('cancelEdit'))+'</button>':'')+'</div></div>'+
  '<div class="patch-cz-saved"><div class="patch-cz-saved-head"><h3>'+E(T('saved'))+' <span>('+saved.length+')</span></h3></div>'+
  (saved.length?'<div class="patch-cz-saved-list">'+saved.map((d)=>
    '<div class="patch-cz-saved-card" data-cz-draft="'+E(d.id)+'"><img src="'+E(imageSrc(product(d.productId)))+'" alt="">'+
    '<div><strong>'+E(productLabel(product(d.productId)))+'</strong><small>'+E(T('draftLabel'))+' · ×'+d.qty+'</small>'+
    '<div class="patch-cz-saved-actions"><button type="button" data-cz-edit="'+E(d.id)+'">'+E(T('edit'))+'</button><button type="button" data-cz-copy="'+E(d.id)+'">'+E(T('copy'))+'</button><button type="button" data-cz-remove="'+E(d.id)+'">'+E(T('remove'))+'</button></div>'+
    '<a class="patch-cz-contact-link" href="https://wa.me/201141693208?text='+encodeURIComponent(formatRequests([d]))+'" target="_blank" rel="noopener noreferrer">'+E(T('whatsapp'))+' ↗</a></div></div>'
   ).join('')+'</div><button type="button" class="patch-cz-share-all" data-cz-copy-all>'+E(T('share'))+' ↗</button>'
   :'<p class="patch-cz-empty">'+E(T('savedNone'))+'</p>')+
  '<p class="patch-cz-fineprint">'+E(T('savedDevice'))+'</p></div></div>';
 const viewer=body.querySelector('model-viewer');
 if(viewer){
  window.PATCH_BAG_LOOKS?.attach(viewer,()=>({productId:state.productId,light:studioLight}));
  viewer.addEventListener('error',()=>{
   const info=body.querySelector('.patch-cz-preview-note');
   if(info)info.textContent=T('modelLoadFailed');
  });
 }
 const editor=body.querySelector('.patch-cz-editor');
 if(editor)editor.scrollTop=scroll;
 if(focusAttr){
  const target=[...body.querySelectorAll('['+focusAttr.name+']')].find(n=>n.getAttribute(focusAttr.name)===focusAttr.value);
  target?.focus({preventScroll:true});
 }
 layer.querySelector('.patch-cz-close')?.setAttribute('aria-label',T('close'));
}
function mount(){
 if(layer)return;
 layer=document.createElement('div');
 layer.className='patch-cz-layer';
 layer.id='patchCustomizerLayer';
 layer.dataset.patchTranslate='off';
 layer.hidden=true;
 layer.innerHTML='<div class="patch-cz-backdrop" data-cz-close></div>'+
  '<section class="patch-cz-dialog" role="dialog" aria-modal="true" aria-labelledby="patchCustomizerTitle" tabindex="-1">'+
  '<button type="button" class="patch-cz-close" data-cz-close aria-label="Close customizer">×</button>'+
  '<div class="patch-cz-layout" id="patchCustomizerBody"></div></section>';
 document.body.appendChild(layer);
 body=document.getElementById('patchCustomizerBody');
 layer.addEventListener('click',handleClick);
 layer.addEventListener('input',handleInput);
 // Touch gestures on photos never intercept the regular editor's scrolling.
 layer.addEventListener('touchstart',e=>{
  if(viewMode!=='photo'||!e.target.closest('.patch-cz-photo'))return;
  touchX={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};
 },{passive:true});
 layer.addEventListener('touchend',e=>{
  if(!touchX||viewMode!=='photo')return;
  const dx=e.changedTouches[0].clientX-touchX.x,dy=e.changedTouches[0].clientY-touchX.y;
  touchX=null;
  if(Math.abs(dx)<45||Math.abs(dx)<Math.abs(dy)*1.5)return;
  const count=photos(currentProduct()).length;
  if(count<2)return;
  photoIndex=(photoIndex+(dx<0?1:-1)+count)%count;
  render();
 },{passive:true});
}
function open(id){
 mount();
 const productId=product(id)?id:(typeof activeProduct!=='undefined'&&product(activeProduct)?activeProduct:cat()[0]?.id);
 if(!productId){notify(T('noBag'));return}
 state=base();state.productId=productId;
 photoIndex=0;editingId=null;viewMode='photo';
 prevFocus=document.activeElement;prevOverflow=document.body.style.overflow;
 layer.hidden=false;document.body.style.overflow='hidden';
 render();layer.querySelector('.patch-cz-dialog').focus({preventScroll:true});
}
function close(){
 if(!layer||layer.hidden)return;
 layer.hidden=true;document.body.style.overflow=prevOverflow;
 if(prevFocus?.isConnected)prevFocus.focus({preventScroll:true});
 else document.querySelector('#bagDrawer.open, #productModal.open, .patch-cz-entry, #productGrid [data-cz-open]')?.focus({preventScroll:true});
}
function edit(id){
 const draft=saved.find(d=>d.id===id);
 if(!draft)return;
 if(!layer||layer.hidden)open(draft.productId);
 editingId=draft.id;state={...draft};photoIndex=0;viewMode='photo';
 render();
 const editor=body?.querySelector('.patch-cz-editor');
 if(editor)editor.scrollTop=0;
 body?.querySelector('[data-cz-product]')?.focus({preventScroll:true});
}
function handleInput(e){
 const key=e.target.dataset.czInput;if(!key||!(key in state))return;
 state[key]=clean(e.target.value,key==='notes'?240:key==='monogram'?14:48);
 if(key==='monogram'){
  const photo=layer.querySelector('.patch-cz-photo');
  if(!photo)return;
  const previous=photo.querySelector('.patch-cz-monogram');
  if(state.monogram){if(previous)previous.textContent=state.monogram;
   else{const badge=document.createElement('span');badge.className='patch-cz-monogram patch-cz-monogram--'+state.letterStyle+' patch-cz-monogram--'+state.letterPosition;badge.textContent=state.monogram;photo.appendChild(badge);}
  }else previous?.remove();
 }
 redrawSummary();
}
function handleClick(e){
 const target=e.target.closest('button,[data-cz-close]');if(!target)return;
 if(target.hasAttribute('data-cz-close')){close();return}
 if(target.dataset.czStudioLight){
  studioLight=target.dataset.czStudioLight;
  window.PATCH_BAG_LOOKS?.apply(body.querySelector('model-viewer'),{productId:state.productId,light:studioLight});
  layer.querySelectorAll('[data-cz-studio-light]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.czStudioLight===studioLight)));
  return;
 }
 if(target.dataset.czView){viewMode=target.dataset.czView==='model'&&availableModel(currentProduct())?'model':'photo';render();return}
 if(target.dataset.czPhoto){
  const count=photos(currentProduct()).length;
  if(count>1){photoIndex=(photoIndex+Number(target.dataset.czPhoto)+count)%count;render();}
  return;
 }
 if(target.hasAttribute('data-cz-thumb')){photoIndex=Number(target.dataset.czThumb)||0;render();return}
 if(target.dataset.czProduct){state.productId=target.dataset.czProduct;state.colorMode='photo';state.customColor='';photoIndex=0;viewMode='photo';render();return}
 if(target.dataset.czColor){state.productId=target.dataset.czColor;state.colorMode='photo';state.customColor='';photoIndex=0;viewMode='photo';render();return}
 if(target.hasAttribute('data-cz-custom-color')){state.colorMode='custom';render();layer.querySelector('[data-cz-input="customColor"]')?.focus();return}
 if(target.dataset.czMaterial){state.material=target.dataset.czMaterial;render();return}
 if(target.dataset.czSize){state.size=target.dataset.czSize;render();return}
 if(target.dataset.czLetterStyle){state.letterStyle=target.dataset.czLetterStyle;render();return}
 if(target.dataset.czLetterPosition){state.letterPosition=target.dataset.czLetterPosition;render();return}
 if(target.dataset.czEdit){edit(target.dataset.czEdit);return}
 if(target.hasAttribute('data-cz-cancel')){const original=saved.find(d=>d.id===editingId);editingId=null;state=original?{...original,id:''}:base();photoIndex=0;viewMode='photo';render();return}
 if(target.dataset.czQty){state.qty=Math.min(5,Math.max(1,state.qty+Number(target.dataset.czQty)));render();return}
 if(target.hasAttribute('data-cz-save')){
  if(state.colorMode==='custom'&&!state.customColor.trim()){notify(T('errors'));layer.querySelector('[data-cz-input="customColor"]')?.focus();return}
  if(editingId&&!saved.some(d=>d.id===editingId)){editingId=null;notify(T('offline'));return}
  if(!editingId&&saved.length>=LIMIT){notify(T('max'));return}
  const id=editingId||'cz-'+(window.crypto?.randomUUID?.()||String(Date.now())+'-'+Math.floor(Math.random()*1e5));
  const record=safeDesign({...state,id});
  if(!record)return;
  const before=saved,wasEditing=Boolean(editingId);
  saved=editingId?saved.map(d=>d.id===editingId?record:d):[...saved,record];
  if(!write()){saved=before;notify(T('offline'));return}
  editingId=null;state={...record,id:''};
  render();notify(T(wasEditing?'updateDone':'savedDone'));
  // Custom requests cannot be treated as stock or charged through product checkout.
  return;
 }
 if(target.dataset.czRemove){
  const before=saved;
  saved=saved.filter(d=>d.id!==target.dataset.czRemove);
  if(!write()){saved=before;notify(T('offline'))}
  if(editingId===target.dataset.czRemove){editingId=null;state=base()}
  render();return;
 }
 if(target.dataset.czCopy){const d=saved.find(d=>d.id===target.dataset.czCopy);if(d)copyText(formatRequests([d])).then(ok=>{if(ok)notify(T('copied'));else prompt(T('copy'),formatRequests([d]))});return}
 if(target.hasAttribute('data-cz-copy-all')){copyText(formatRequests(saved)).then(ok=>{if(ok)notify(T('copied'));else prompt(T('copy'),formatRequests(saved))});}
}
function syncProductCards(){
 const grid=document.getElementById('productGrid');if(!grid)return;
 grid.querySelectorAll('.product-card').forEach(card=>{
  const sku=card.dataset.selectedProduct||card.dataset.colorCard;
  if(!product(sku))return;
  const info=card.querySelector('.product-info>div');
  if(!info)return;
  const existing=info.querySelector('[data-cz-open]');
  if(existing){existing.dataset.czOpen=sku;return}
  const b=document.createElement('button');
  b.type='button';b.className='patch-cz-card-link';b.dataset.czOpen=sku;b.dataset.czOrigin='card';
  b.textContent=T('open')+' ↗';
  info.appendChild(b);
 });
}
function syncModal(){
 const modal=document.getElementById('productModal');
 if(!modal)return;
 let button=document.getElementById('modalCustomize');
 if(!button){
  button=document.createElement('button');
  button.type='button';button.id='modalCustomize';button.className='patch-cz-modal-button';button.dataset.czOpen='modal';
  const add=document.getElementById('modalAdd');
  if(add)add.insertAdjacentElement('afterend',button);
 }
 button.textContent=T('open')+' ↗';
 button.hidden=!(typeof activeProduct!=='undefined'&&product(activeProduct));
}
function setup(){
 mount();
 // Replace the old "ask about custom pieces" link with a real experience.
 const old=document.querySelector('#custom .custom-copy>a.button');
 if(old){
  const btn=document.createElement('button');
  btn.type='button';btn.className=old.className+' patch-cz-entry';
  btn.dataset.czOpen='first';
  btn.textContent=T('open')+' ↗';old.replaceWith(btn);
 }
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-cz-open]');if(!trigger)return;
  e.preventDefault();
  if(trigger.dataset.czOpen==='modal'){open(typeof activeProduct!=='undefined'?activeProduct:null);return}
  open(trigger.dataset.czOpen==='first'?null:trigger.dataset.czOpen);
 });
 document.addEventListener('keydown',e=>{
  if(!layer||layer.hidden)return;
  if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();return}
  if(e.key!=='Tab')return;
  e.stopImmediatePropagation(); // background product modal must not trap focus
  const nodes=[...layer.querySelectorAll('button:not([disabled]):not([hidden]),input:not([disabled]),textarea:not([disabled])')]
   .filter(el=>el.getClientRects().length);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes[nodes.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 },true);
 const grid=document.getElementById('productGrid');
 if(grid){
  syncProductCards();
  new MutationObserver(muts=>{if(muts.some(m=>m.addedNodes.length))syncProductCards()}).observe(grid,{childList:true});
 }
 document.addEventListener('patch:variant-changed',syncProductCards);
 const modalTitle=document.getElementById('modalTitle');
 if(modalTitle)new MutationObserver(syncModal).observe(modalTitle,{childList:true,characterData:true,subtree:true});
 syncModal();
 const language=()=>{
  if(layer&&!layer.hidden)render();
  document.querySelectorAll('[data-cz-open]').forEach(btn=>{btn.textContent=T('open')+' ↗'});
 };
 document.addEventListener('patch:language-changed',language);
 document.addEventListener('patch:reference-3d-ready',()=>{if(layer&&!layer.hidden)render()});
 window.addEventListener('storage',e=>{if(e.key===KEY){saved=read();if(layer&&!layer.hidden)render();document.dispatchEvent(new Event('patch:custom-designs-changed'))}});
 if(saved.length)document.dispatchEvent(new Event('patch:custom-designs-changed'));
}
window.PATCH_CUSTOMIZER={
 list:()=>saved.map(d=>({...d})),
 count:()=>saved.reduce((sum,d)=>sum+d.qty,0),
 remove:id=>{
  const before=saved;
  saved=saved.filter(d=>d.id!==id);
  if(!write()){saved=before;notify(T('offline'))}
  if(editingId===id){editingId=null;state=base()}
  if(layer&&!layer.hidden)render();
 },
 open,edit,formatRequests,description
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);
else setup();
})();
