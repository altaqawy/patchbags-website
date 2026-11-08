'use client';
import {useEffect,useState} from 'react';
type Method={method:'paymob'|'cod'|'bank'|'wallet',enabled:boolean,instructions:string,receiving_account:string,verified:boolean};
type Config={environment:'test'|'live',publicKey:string,integrationIds:number[],hasSecret:boolean,hasHmac:boolean,credentialStatus:string,webhookVerified:boolean,liveActivated:boolean};
type MediaAsset={type:'image'|'video'|'model',url:string,alt?:string,posterUrl?:string};
type Category={slug:string,name_ar:string,name_en:string,position:number,active:boolean};
type Product={id:string,title:string,title_ar?:string,description:string,price_minor:string,compare_at_minor:string|null,
 stock:number,active:boolean,image_url:string,category_slug:string,media:MediaAsset[],badge:string,featured:boolean,position:number};
const newProduct=():Product=>({id:'',title:'',title_ar:'',description:'',price_minor:'0',compare_at_minor:null,stock:0,active:false,image_url:'',category_slug:'bags',media:[],badge:'',featured:false,position:100});
type Order={id:string,customer_name:string,email:string,method:string,payment_status:string,status:string,total_minor:string,manual_reference:string,created_at:string};
const title:Record<string,string>={paymob:'Paymob — المدفوعات الإلكترونية',cod:'الدفع عند الاستلام',bank:'تحويل بنكي / InstaPay',wallet:'تحويل لمحفظة إلكترونية'};
const currency=(c:number|string)=>`${(Number(c)/100).toFixed(2)} ج.م`;
export default function Admin(){
 const [authorized,setAuthorized]=useState(false),[busy,setBusy]=useState(true),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[csrf,setCsrf]=useState('');
 const [tab,setTab]=useState('payments'),[env,setEnv]=useState<'test'|'live'>('test'),[step,setStep]=useState(1),[show,setShow]=useState(false),[msg,setMsg]=useState('');
 const [configs,setConfigs]=useState<Config[]>([]),[methods,setMethods]=useState<Method[]>([]),[store,setStore]=useState<any>({}),[products,setProducts]=useState<Product[]>([]),[orders,setOrders]=useState<Order[]>([]),[report,setReport]=useState<any>({});
 const [cred,setCred]=useState({secretKey:'',publicKey:'',hmacSecret:'',integrationIds:''});
 const [editMethod,setEditMethod]=useState<Method|null>(null),[shipping,setShipping]=useState('');
 const [productEdit,setProductEdit]=useState<Product|null>(null),[categories,setCategories]=useState<Category[]>([]),
 [categoryEdit,setCategoryEdit]=useState<Category|null>(null),[mediaUrl,setMediaUrl]=useState(''),[mediaBusy,setMediaBusy]=useState(false);
 const [orderDetails,setOrderDetails]=useState<any>(null);
 const [reportDays,setReportDays]=useState(7);
 const [language,setLanguage]=useState<'ar'|'en'>('ar');
 const cfg=configs.find(c=>c.environment===env),validLive=configs.find(c=>c.environment==='live');
 async function api(path:string,method='GET',data?:any){
  const res=await fetch(path,{method,credentials:'same-origin',headers:{'Content-Type':'application/json',...(method==='GET'?{}:{'x-csrf-token':csrf})},body:method==='GET'?undefined:JSON.stringify(data),cache:'no-store'});
  const json=await res.json().catch(()=>({error:'Invalid server response'}));if(!res.ok)throw Error(json.error||'Request failed');return json;
 }
 async function load(){const [a,p,o,r]=await Promise.all([api('/api/admin/payments'),api('/api/admin/products'),api('/api/admin/orders'),api('/api/admin/reports')]);setConfigs(a.configs);setMethods(a.methods);setStore(a.store);setShipping(a.store?.shipping_minor===null?'':String(a.store?.shipping_minor/100));setProducts(p.products);setCategories(p.categories||[]);setOrders(o.orders);setReport(r)}
 useEffect(()=>{fetch('/api/admin/session',{cache:'no-store'}).then(async r=>{if(!r.ok)return;const s=await r.json();setCsrf(s.csrf);setAuthorized(true)}).finally(()=>setBusy(false))},[]);
 useEffect(()=>{if(authorized&&csrf)load().catch(e=>setMsg(e.message))},[authorized,csrf]);
 async function send(path:string,data:any){setBusy(true);setMsg('');try{await api(path,'POST',data);await load();setMsg('تم حفظ الإعدادات.');return true}catch(e:any){setMsg(e.message);return false}finally{setBusy(false)}}

 const saleSavings=(p:Product)=>p.compare_at_minor&&Number(p.compare_at_minor)>Number(p.price_minor)
  ?Math.round((1-Number(p.price_minor)/Number(p.compare_at_minor))*100):0;
 async function saveEditedProduct(){
  if(!productEdit)return;
  const p=productEdit,price=Number(p.price_minor),compare=p.compare_at_minor===null?null:Number(p.compare_at_minor);
  if(!p.title.trim()||price<0||!Number.isSafeInteger(price)||compare!==null&&(!Number.isSafeInteger(compare)||compare<=price)||
    (p.active&&(!price||p.stock<=0))){setMsg('راجعي السعر الحالي والسعر قبل الخصم والمخزون');return}
  const done=await send('/api/admin/products',{
   id:p.id,title:p.title,titleAr:p.title_ar||'',description:p.description||'',
   priceMinor:price,compareAtMinor:compare,stock:p.stock,active:p.active,
   category:p.category_slug||'bags',imageUrl:p.image_url||'',media:p.media||[],
   badge:p.badge||'',featured:Boolean(p.featured),position:p.position||100
  });
  if(done){setProductEdit(null);setMediaUrl('')}
 }
 async function uploadAssets(files:FileList|null){
  if(!productEdit||!files?.length)return;
  setMediaBusy(true);setMsg('');
  const result=[...(productEdit.media||[])];
  let cover=productEdit.image_url;
  try{
   for(const file of Array.from(files)){
    if(result.length>=12)throw Error('الحد الأقصى 12 ملفًا للمنتج');
    let mime=file.type;
    if(!mime&&file.name.toLowerCase().endsWith('.glb'))mime='model/gltf-binary';
    if(!mime&&file.name.toLowerCase().endsWith('.gltf'))mime='model/gltf+json';
    const signed=await api('/api/admin/media','POST',{filename:file.name,contentType:mime,size:file.size});
    const uploaded=await fetch(signed.uploadUrl,{method:'PUT',headers:{'Content-Type':mime},body:file});
    if(!uploaded.ok)throw Error('فشل رفع '+file.name+' — راجعي إعدادات CORS والتخزين');
    const media:MediaAsset={type:signed.mediaType,url:signed.assetUrl,alt:file.name};
    result.push(media);
    if(!cover&&media.type==='image')cover=media.url;
   }
   setProductEdit(v=>v?{...v,media:result,image_url:cover}:v);
   setMsg('تم رفع الملفات إلى مساحة التخزين، احفظي المنتج لربطها به');
  }catch(e:any){setMsg(e.message||'الرفع غير متاح حاليًا')}finally{setMediaBusy(false)}
 }
 function addMediaLink(){
  if(!productEdit)return;
  try{
   const u=new URL(mediaUrl);
   if(u.protocol!=='https:'||u.username||u.password)throw Error('HTTPS مطلوب');
   if((productEdit.media||[]).length>=12)throw Error('الحد الأقصى 12 ملفًا');
   const ext=u.pathname.toLowerCase();
   const type:MediaAsset['type']=/\.(glb|gltf)$/.test(ext)?'model':/\.(mp4|webm)$/.test(ext)?'video':'image';
   const asset={type,url:u.href,alt:productEdit.title};
   setProductEdit({...productEdit,media:[...(productEdit.media||[]),asset],image_url:productEdit.image_url|| (type==='image'?u.href:'')});
   setMediaUrl('');
  }catch(e:any){setMsg(e.message||'رابط غير صالح')}
 }

 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMsg('');try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const j=await r.json();if(!r.ok)throw Error(j.error);setAuthorized(true);setCsrf(j.csrf);setPassword('')}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 if(!authorized)return <main className="shell"><div className="panel" style={{maxWidth:500,margin:'80px auto'}}><h1>PatCh.BaGs</h1><h2>تسجيل دخول مالكة المتجر</h2><p>هذه منطقة إدارة خاصة، ولا تستخدم حساب الزبون.</p>{busy?<div className="loader"/>:<form className="fields" onSubmit={login}><label className="field">البريد الإداري<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">كلمة المرور<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn primary" type="submit">دخول آمن</button></form>}{msg&&<p className="warn">{msg}</p>}</div></main>;
 return <main className="shell">
 <header className="top"><div className="brand">PatCh.BaGs <small>لوحة إدارة المتجر · خاصة بالمالكة</small></div><button className="btn" type="button" onClick={()=>setLanguage(language==='ar'?'en':'ar')} aria-label="تغيير لغة لوحة التحكم">{language==='ar'?'EN':'عربي'}</button><button className="btn" onClick={async()=>{await fetch('/api/admin/logout',{method:'POST'});location.reload()}}>تسجيل الخروج</button></header>
 <h1>مرحبًا بك في إدارة المتجر</h1><p className="lead">إدارة المنتجات والمدفوعات والطلبات من مكان واحد. لا يتم عرض مفاتيح Paymob السرية بعد حفظها.</p>
 <nav className="tabs" aria-label="أقسام لوحة التحكم">{[['overview','نظرة عامة'],['products','المنتجات'],['categories','التصنيفات'],['orders','الطلبات'],['payments','المدفوعات'],['reports','الإحصائيات']].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'selected':''}>{label}</button>)}</nav>
 {msg&&<p className={'status '+(/خطأ|error|failed|unavailable|not/i.test(msg)?'err':'')} role="status">{msg}</p>}{busy&&<div className="loader"/>}

 {tab==='overview'&&<><div className="owner-dashboard-metrics">
 <div className="owner-metric"><span>إجمالي المنتجات</span><strong>{products.length}</strong><small>منتج مسجل</small></div>
 <div className="owner-metric"><span>المنتجات المتاحة</span><strong>{products.filter(p=>p.active).length}</strong><small>مع سعر ومخزون</small></div>
 <div className="owner-metric"><span>الطلبات</span><strong>{orders.length}</strong><small>الطلبات الحديثة</small></div>
 <div className="owner-metric"><span>مبيعات مؤكدة</span><strong>{currency((report.periods||[]).reduce((n:number,x:any)=>n+Number(x.paid_minor||0),0))}</strong><small>آخر 31 يومًا فقط</small></div>
 </div><div className="panel owner-feature-panel"><div><small>THE PATCH EDIT / STUDIO</small><h2>كل قطعة ليها حكاية</h2><p>تحكمي في الصور والألوان والمجموعات والطلبات من شاشة واحدة.</p><button className="btn primary" onClick={()=>setTab('products')}>افتحي إدارة المنتجات ←</button></div><img src={products.find(p=>p.image_url)?.image_url||'/placeholder.png'} alt="PatCh.BaGs product" /></div></>}
 {tab==='categories'&&<><div className="panel"><h2>التصنيفات والمجموعات</h2><p>اسمي كل مجموعة بالعربي والإنجليزي، والمنتجات هتظهر تحت تصنيفها.</p><div className="owner-category-grid">{categories.map(c=><article className="owner-category-card" key={c.slug}><small>{c.slug}</small><h3>{c.name_ar}</h3><p>{c.name_en}</p><span>{products.filter(p=>p.category_slug===c.slug).length} منتج</span><button className="btn" onClick={()=>setCategoryEdit(c)}>تعديل</button></article>)}</div><button className="btn primary" onClick={()=>setCategoryEdit({slug:'',name_ar:'',name_en:'',position:100,active:true})}>+ إضافة تصنيف</button></div>
 {categoryEdit&&<div className="panel fields"><div className="row"><h2>إضافة / تعديل تصنيف</h2><button className="btn" onClick={()=>setCategoryEdit(null)}>إغلاق</button></div>
 <label className="field">رابط التصنيف (slug)<input dir="ltr" value={categoryEdit.slug} onChange={e=>setCategoryEdit({...categoryEdit,slug:e.target.value.toLowerCase()})} placeholder="handmade-bags" /></label>
 <label className="field">الاسم بالعربي<input value={categoryEdit.name_ar} onChange={e=>setCategoryEdit({...categoryEdit,name_ar:e.target.value})} /></label>
 <label className="field">Name in English<input dir="ltr" value={categoryEdit.name_en} onChange={e=>setCategoryEdit({...categoryEdit,name_en:e.target.value})} /></label>
 <label><input type="checkbox" checked={categoryEdit.active} onChange={e=>setCategoryEdit({...categoryEdit,active:e.target.checked})} /> تصنيف ظاهر</label>
 <button className="btn primary" disabled={busy} onClick={async()=>{if(await send('/api/admin/categories',{slug:categoryEdit.slug,nameAr:categoryEdit.name_ar,nameEn:categoryEdit.name_en,position:categoryEdit.position,active:categoryEdit.active}))setCategoryEdit(null)}}>حفظ التصنيف</button></div>}
 </>}
 {tab==='payments'&&<>
 <div className="panel"><h2>طرق الدفع</h2><p>كل وسيلة مستقلة ويمكن إيقافها. Paymob لا ينشط تلقائيًا بمجرد إدخال المفاتيح.</p><div className="methods">{methods.map(m=><div className="method" key={m.method}><div className="row"><h3>{title[m.method]}</h3><span className="flag">{m.enabled?'مفعّل':'متوقف'}</span></div><p>{m.method==='paymob'?'يحتاج ربط الحساب والـ Webhook واختبارًا.':m.method==='cod'?'تُسجل الطلبات دون تحصيل مسبق.':'لا يُعتمد التحويل قبل تحقق المالكة من وصوله.'}</p><div className="row"><button className="btn" onClick={()=>setEditMethod(m)}>إعدادات الوسيلة</button><button className="btn" disabled={busy} onClick={()=>send('/api/admin/payments',{action:'method',method:m.method,enabled:!m.enabled,instructions:m.instructions,receivingAccount:m.receiving_account})}>{m.enabled?'إيقاف':'تفعيل'}</button></div></div>)}</div></div>
 {editMethod&&<div className="panel fields"><div className="row"><h2>إعداد {title[editMethod.method]}</h2><button className="btn" onClick={()=>setEditMethod(null)}>إغلاق</button></div><label className="field">تعليمات الدفع<textarea value={editMethod.instructions||''} onChange={e=>setEditMethod({...editMethod,instructions:e.target.value})}/></label><label className="field">حساب الاستقبال (إن وجد)<input value={editMethod.receiving_account||''} onChange={e=>setEditMethod({...editMethod,receiving_account:e.target.value})}/></label><button className="btn primary" onClick={()=>{send('/api/admin/payments',{action:'method',method:editMethod.method,enabled:editMethod.enabled,instructions:editMethod.instructions,receivingAccount:editMethod.receiving_account});setEditMethod(null)}}>حفظ بشكل آمن</button></div>}
 <div className="panel"><h2>إعداد Paymob خطوة بخطوة</h2><div className="steps">{['حساب التاجر','بيئة التشغيل','المفاتيح','الويب هوك','اختبار الاتصال','التفعيل'].map((x,i)=><span key={x} style={{background:step===i+1?'#dae6d5':''}}>{i+1} · {x}</span>)}</div>
 {step===1&&<><p>سجلي حساب Paymob باسمك، وأكملي التحقق من الهوية وتفعيل وسيلة الاستلام لدى Paymob مباشرة.</p><p className="warn">دخولك إلى Paymob وإدخال المفاتيح لا يعني تفعيل التاجر. لا تشاركي كلمة مرور Paymob أو مفاتيحك عبر واتساب أو المحادثات.</p><p><a target="_blank" rel="noreferrer" href="https://egypt.paymob.com/portal/en/register">إنشاء حساب Paymob رسمي ↗</a></p><button className="btn primary" onClick={()=>setStep(2)}>عندي حساب / متابعة الإعداد ←</button></>}
 {step===2&&<><div className="seg"><button className={env==='test'?'selected':''} onClick={()=>setEnv('test')}>اختبار Test</button><button className={env==='live'?'selected':''} onClick={()=>setEnv('live')}>تشغيل Live</button></div><p>الافتراضي Test. لا يمكن قبول مدفوعات حقيقية إلا بعد موافقة Paymob والتحقق من مفاتيح Live وWebhook.</p><button className="btn primary" onClick={()=>setStep(3)}>متابعة ←</button></>}
 {step===3&&<div className="fields"><p className="muted">البيئة المختارة: {env.toUpperCase()} · تم حفظ مفتاح سري؟ {cfg?.hasSecret?'نعم — مخفي':'لا'} · HMAC؟ {cfg?.hasHmac?'نعم — مخفي':'لا'}</p><label className="field">Secret Key <input autoComplete="off" type={show?'text':'password'} value={cred.secretKey} onChange={e=>setCred({...cred,secretKey:e.target.value})} placeholder="egy_sk_test_…"/></label><label className="field">Public Key<input autoComplete="off" value={cred.publicKey} onChange={e=>setCred({...cred,publicKey:e.target.value})} placeholder="egy_pk_test_…"/></label><label className="field">Integration IDs (مفصولة بفواصل)<input autoComplete="off" value={cred.integrationIds} onChange={e=>setCred({...cred,integrationIds:e.target.value})} placeholder="12345, 67890"/></label><label className="field">HMAC Secret<input autoComplete="off" type={show?'text':'password'} value={cred.hmacSecret} onChange={e=>setCred({...cred,hmacSecret:e.target.value})}/></label><button className="btn" onClick={()=>setShow(!show)}>{show?'إخفاء المفاتيح':'إظهار المفاتيح مؤقتًا'}</button><div className="row"><button className="btn primary" onClick={async()=>{await send('/api/admin/payments',{action:'credentials',environment:env,...cred,integrationIds:cred.integrationIds.split(',').map(x=>Number(x.trim()))});setCred({secretKey:'',publicKey:'',hmacSecret:'',integrationIds:''})}}>حفظ مشفّر</button><button className="btn" onClick={()=>{if(confirm('حذف مفاتيح هذه البيئة وتعطيل Paymob؟'))send('/api/admin/payments',{action:'revoke',environment:env})}}>إلغاء / حذف المفاتيح</button><button className="btn" onClick={()=>setStep(4)}>التالي ←</button></div><p className="muted"><a target="_blank" rel="noreferrer" href="https://developers.paymob.com/">توثيق Paymob الرسمي ↗</a></p></div>}
 {step===4&&<><p>اضبطي رابط Transaction Processed Callback في لوحة Paymob أو عبر notification_url الذي يرسله خادمنا عند إنشاء Intention.</p><label className="field">Webhook URL<input readOnly value={(typeof window!=='undefined'?location.origin:'')+'/api/paymob/webhook'}/></label><button className="btn" onClick={()=>navigator.clipboard.writeText(location.origin+'/api/paymob/webhook')}>نسخ عنوان الويب هوك</button><p className="flag">Webhook verified: {cfg?.webhookVerified?'نعم — تم استقبال توقيع صحيح':'لم يتم التحقق بعد'}</p><p>لا يمكن اعتبار الويب هوك متحققًا قبل وصول Callback موقّع صحيحًا.</p><button className="btn primary" onClick={()=>setStep(5)}>متابعة ←</button></>}
 {step===5&&<><p>اختبار المفاتيح ينشئ Intention فقط بلا صفحة دفع ولا أي خصم. اختبار Live يحتاج موافقتك، ولا يعني أن حساب التاجر قد تم تفعيله.</p><button className="btn primary" disabled={busy} onClick={()=>{if(env==='live'&&!confirm('سيتم إنشاء Intention في بيئة Live للتأكد من المفاتيح دون إتمام أي دفع. هل تؤكدين؟'))return;send('/api/admin/payments/test',{environment:env,...(env==='live'?{confirm:'VERIFY_WITHOUT_CHARGE'}:{})})}}>Test Connection — بلا خصم</button><p className="status">Credentials: {cfg?.credentialStatus||'not_configured'} | Webhook: {cfg?.webhookVerified?'verified':'unverified'}</p><button className="btn" onClick={()=>setStep(6)}>التالي ←</button></>}
 {step===6&&<><p className="warn">التفعيل المباشر يسمح للزبائن ببدء معاملات أموال حقيقية. يجب التأكد من موافقة Paymob واختبار الـ Webhook واكتمال مفاتيح Live.</p><p>Live credentials: {validLive?.credentialStatus||'not_configured'} | Live webhook: {validLive?.webhookVerified?'verified':'not verified'}</p><button className="btn primary" disabled={busy||validLive?.credentialStatus!=='verified'||!validLive?.webhookVerified} onClick={()=>{if(confirm('هل تؤكدين تفعيل المدفوعات الحقيقية؟'))send('/api/admin/payments/activate',{confirm:'ACTIVATE_REAL_PAYMENTS'})}}>تفعيل المدفوعات الحقيقية</button></>}
 <p><button className="btn" onClick={()=>setStep(Math.max(1,step-1))} disabled={step===1}>→ الخطوة السابقة</button></p></div>
 <div className="panel"><h2>رسوم التوصيل</h2><p>يجب تحديد رسوم التوصيل بالجنيه قبل استقبال طلبات حقيقية. أسعار المنتجات تؤخذ من قاعدة البيانات، لا من المتصفح.</p><div className="row"><label className="field">التوصيل بالجنيه المصري<input type="number" min="0" step="0.01" value={shipping} onChange={e=>setShipping(e.target.value)}/></label><button className="btn primary" onClick={()=>send('/api/admin/payments',{action:'store',shippingMinor:Math.round(Number(shipping)*100),taxBasisPoints:0})}>حفظ رسوم التوصيل</button></div></div>
 </>}
 {tab==='products'&&<><div className="panel"><h2>الكتالوج — الأسعار والمخزون</h2><p>المنتجات غير مسعّرة وغير نشطة افتراضيًا. لا يمكن استقبال دفع قبل وضع أسعار صحيحة.</p><table className="list"><thead><tr><th>SKU</th><th>المنتج</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th></th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td>{p.id}</td><td>{p.title}</td><td>{currency(p.price_minor)}</td><td>{p.stock}</td><td>{p.active?'معروض':'غير نشط'}</td><td><button className="btn" onClick={()=>setProductEdit(p)}>تعديل</button></td></tr>)}</tbody></table></div>{productEdit&&<div className="panel fields"><div className="row"><h2>تعديل {productEdit.id}</h2><button className="btn" onClick={()=>setProductEdit(null)}>إغلاق</button></div><label className="field">الاسم<input value={productEdit.title} onChange={e=>setProductEdit({...productEdit,title:e.target.value})}/></label><label className="field">السعر بالجنيه<input type="number" step="0.01" min="0" value={Number(productEdit.price_minor)/100} onChange={e=>setProductEdit({...productEdit,price_minor:String(Math.round(Number(e.target.value)*100))})}/></label><label className="field">المخزون<input type="number" min="0" value={productEdit.stock} onChange={e=>setProductEdit({...productEdit,stock:Number(e.target.value)})}/></label><label><input type="checkbox" style={{width:18,minHeight:18,marginLeft:10}} checked={productEdit.active} onChange={e=>setProductEdit({...productEdit,active:e.target.checked})}/>متاح للبيع</label><button className="btn primary" onClick={()=>send('/api/admin/products',{id:productEdit.id,title:productEdit.title,description:productEdit.description,priceMinor:Number(productEdit.price_minor),stock:productEdit.stock,active:productEdit.active,imageUrl:productEdit.image_url})}>حفظ المنتج</button></div>}</>}
 {tab==='orders'&&<div className="panel"><div className="row"><h2>الطلبات</h2><button className="btn" onClick={load}>تحديث</button></div><table className="list"><thead><tr><th>العميل</th><th>الطلب</th><th>الوسيلة</th><th>المبلغ</th><th>الدفع</th><th>الإجراء</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>{o.customer_name}<br/><small>{o.email}</small></td><td>{o.id.slice(0,8)}</td><td>{o.method}</td><td>{currency(o.total_minor)}</td><td>{o.payment_status}</td><td><button className="btn" onClick={async()=>{try{setOrderDetails(await api('/api/admin/orders/'+o.id))}catch(e:any){setMsg(e.message)}}}>التفاصيل</button> {['bank','wallet'].includes(o.method)&&o.payment_status==='awaiting_verification'?<button className="btn" onClick={()=>{if(confirm('لا تؤكدي إلا بعد مراجعة وصول المبلغ فعليًا إلى الحساب'))send('/api/admin/orders/manual-verify',{orderId:o.id,confirm:'MANUALLY_VERIFIED_RECEIPT'})}}>تحقق يدوي</button>:'—'}</td></tr>)}</tbody></table>{orders.length===0&&<p>لا توجد طلبات حتى الآن.</p>}{orderDetails&&<div className="panel"><div className="row"><h2>تفاصيل الطلب {orderDetails.order?.id}</h2><button className="btn" onClick={()=>setOrderDetails(null)}>إغلاق</button></div><p>{orderDetails.order?.customer_name} · {orderDetails.order?.phone} · {orderDetails.order?.city}</p><p>{orderDetails.order?.address}</p><p>مرجع التحويل: {orderDetails.order?.manual_reference||'لا يوجد'}</p><table className="list"><tbody>{(orderDetails.items||[]).map((it:any)=><tr key={it.product_id}><td>{it.title_snapshot}</td><td>× {it.quantity}</td><td>{currency(it.total_minor)}</td></tr>)}</tbody></table><p>محاولات Paymob: {(orderDetails.attempts||[]).length}</p></div>}</div>}
 {tab==='reports'&&<><div className="panel"><div className="row"><h2>تقارير المدفوعات</h2><a className="btn" href="/api/admin/reports?format=csv">تصدير CSV</a></div><p>الإحصاءات تشمل المبالغ التي تم تأكيدها فقط.</p><table className="list"><thead><tr><th>اليوم</th><th>الطلبات</th><th>المدفوع المؤكد</th></tr></thead><tbody>{(report.periods||[]).map((r:any)=><tr key={r.day}><td>{r.day}</td><td>{r.orders}</td><td>{currency(r.paid_minor)}</td></tr>)}</tbody></table>{!report.periods?.length&&<p>لا توجد إيرادات مؤكدة.</p>}</div></>}
 </main>
}
