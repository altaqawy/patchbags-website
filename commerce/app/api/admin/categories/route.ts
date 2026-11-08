import {NextRequest} from 'next/server';
import {db,error,json,owner,readOnlyOwner,transaction,audit} from '../../../../lib/server';
export const runtime='nodejs';
export async function GET(){
 if(!await readOnlyOwner())return error(403,'Owner only');
 const r=await db().query('SELECT slug,name_ar,name_en,active,position,created_at FROM categories ORDER BY position,slug');
 return json({categories:r.rows});
}
export async function POST(req:NextRequest){
 const admin=await owner(req);if(!admin)return error(403,'Owner only');
 const body=await req.json().catch(()=>({}));
 const slug=String(body.slug||'').trim().toLowerCase(),ar=String(body.nameAr||'').trim(),en=String(body.nameEn||'').trim();
 const pos=body.position===undefined?100:Number(body.position),active=body.active!==false;
 if(!/^[a-z0-9][a-z0-9-]{1,49}$/.test(slug)||ar.length<2||ar.length>70||en.length<2||en.length>70||!Number.isInteger(pos)||pos<0||pos>100000)
  return error(400,'Invalid collection name or slug');
 try{
  const saved=await transaction(async client=>{
   const found=await client.query('SELECT slug FROM categories WHERE slug=$1',[slug]);
   if(found.rowCount){
    // Preserve the category association of existing products.
    const updated=await client.query('UPDATE categories SET name_ar=$2,name_en=$3,position=$4,active=$5 WHERE slug=$1 RETURNING *',[slug,ar,en,pos,active]);
    await audit(client,admin.id,'collection.updated',slug,{active,position:pos});return updated.rows[0];
   }
   const created=await client.query('INSERT INTO categories(slug,name_ar,name_en,position,active) VALUES($1,$2,$3,$4,$5) RETURNING *',[slug,ar,en,pos,active]);
   await audit(client,admin.id,'collection.created',slug,{active,position:pos});return created.rows[0];
  });
  return json({ok:true,category:saved});
 }catch{return error(500,'Unable to save collection')}
}
