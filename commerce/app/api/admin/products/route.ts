import {NextRequest} from 'next/server';
import {db,error,json,owner,readOnlyOwner,audit,transaction} from '../../../../lib/server';
export const runtime='nodejs';
const VALID_MEDIA=new Set(['image','video','model']);
function assetUrl(v:unknown):string|null {
 if(typeof v!=='string'||v.length>1800)return null;
 try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password?u.href:null}catch{return null}
}
function normalizedMedia(input:unknown){
 if(!Array.isArray(input)||input.length>12)throw Error('Maximum 12 media files');
 return input.map((m:any)=>{
  if(!m||!VALID_MEDIA.has(m.type))throw Error('Unknown media type');
  const url=assetUrl(m.url),posterUrl=m.posterUrl?assetUrl(m.posterUrl):null;
  if(!url||m.posterUrl&&!posterUrl)throw Error('Media URLs must use HTTPS');
  return {type:m.type,url,alt:String(m.alt||'').slice(0,180),...(posterUrl?{posterUrl}:{})};
 });
}
export async function GET(){
 if(!await readOnlyOwner())return error(403,'Owner only');
 const [p,c]=await Promise.all([
  db().query('SELECT id,title,title_ar,description,description_ar,price_minor,badge_ar,compare_at_minor,stock,active,image_url,category_slug,media,badge,featured,position,updated_at FROM products ORDER BY position,id'),
  db().query('SELECT slug,name_ar,name_en,position,active FROM categories ORDER BY position,slug')]);
 return json({products:p.rows,categories:c.rows});
}
export async function POST(req:NextRequest){
 const admin=await owner(req);if(!admin)return error(403,'Owner only');
 const b=await req.json().catch(()=>({}));
 const id=String(b.id||'').trim(),title=String(b.title||'').trim(),titleAr=String(b.titleAr||'').trim(),description=String(b.description||'').trim(),descriptionAr=String(b.descriptionAr||'').trim(),badgeAr=String(b.badgeAr||'').trim();
 const category=String(b.category||'bags').trim(),badge=String(b.badge||'').trim(),image=String(b.imageUrl||'').trim(),featured=b.featured===true;
 const price=Number(b.priceMinor),before=b.compareAtMinor===null||b.compareAtMinor===undefined||b.compareAtMinor===''?null:Number(b.compareAtMinor);
 const stock=Number(b.stock),position=b.position===undefined?100:Number(b.position);
 if(id&&!/^PB-[0-9]{2,4}$/.test(id)||
  title.length<2||title.length>200||titleAr.length>200||description.length>3000||descriptionAr.length>3000||badge.length>40||badgeAr.length>40||
  !/^[a-z0-9][a-z0-9-]{1,49}$/.test(category)||!Number.isSafeInteger(price)||price<0||price>100000000||
  before!==null&&(!Number.isSafeInteger(before)||before<=price||before>100000000)||
  !Number.isInteger(stock)||stock<0||stock>100000||!Number.isInteger(position)||position<0||position>100000||
  typeof b.active!=='boolean'||b.active&&(price<=0||stock<=0)||
  image&&image.length>1800||image&&!image.startsWith('assets/')&&!assetUrl(image))
  return error(400,'Invalid fields, discount or stock');
 let media:ReturnType<typeof normalizedMedia>;
 try{media=normalizedMedia(b.media||[])}catch(e){return error(400,e instanceof Error?e.message:'Invalid media')}
 const found=await db().query('SELECT slug FROM categories WHERE slug=$1 AND active=true',[category]);
 if(!found.rowCount)return error(400,'Choose an active category');
 try{
  const saved=await transaction(async client=>{
   const sku=id||'PB-'+String((await client.query("SELECT nextval('product_sku_seq')::int AS n")).rows[0].n).padStart(3,'0');
   const query=[
    'INSERT INTO products(id,title,title_ar,description,description_ar,price_minor,compare_at_minor,stock,active,image_url,category_slug,media,badge,badge_ar,featured,position)',
    'VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16)',
    'ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,title_ar=EXCLUDED.title_ar,description=EXCLUDED.description,description_ar=EXCLUDED.description_ar,',
    'price_minor=EXCLUDED.price_minor,compare_at_minor=EXCLUDED.compare_at_minor,stock=EXCLUDED.stock,active=EXCLUDED.active,',
    'image_url=EXCLUDED.image_url,category_slug=EXCLUDED.category_slug,media=EXCLUDED.media,badge=EXCLUDED.badge,badge_ar=EXCLUDED.badge_ar,',
    'featured=EXCLUDED.featured,position=EXCLUDED.position,updated_at=now() RETURNING id,title,active,category_slug'
   ].join(' ');
   const result=await client.query(query,[sku,title,titleAr,description,descriptionAr,price,before,stock,b.active,image,category,JSON.stringify(media),badge,badgeAr,featured,position]);
   await audit(client,admin.id,'product.updated',sku,{category,active:b.active,priceMinor:price,compareAtMinor:before,stock,mediaCount:media.length,featured});
   return result.rows[0];
  });
  return json({ok:true,product:saved});
 }catch{return error(500,'Unable to save product')}
}
