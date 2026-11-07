import {NextRequest} from 'next/server';import {db,publicError,publicJson,publicOriginAllowed} from '../../../../../lib/server';import {sha256} from '../../../../../lib/security.mjs';
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!publicOriginAllowed(req))return publicError(403,'Origin not allowed');const {id}=await params;const b=await req.json().catch(()=>({}));
 const token=String(b.trackingToken||''),reference=String(b.reference||'').trim();
 if(!/^[a-f0-9-]{36}$/i.test(id)||token.length<30||reference.length<5||reference.length>120)return publicError(400,'Invalid order or reference');
 const r=await db().query("UPDATE orders SET manual_reference=$3,updated_at=now() WHERE id=$1 AND tracking_token_hash=$2 AND method IN('bank','wallet') AND payment_status='awaiting_verification' RETURNING id",[id,sha256(token),reference]);
 if(!r.rowCount)return publicError(404,'Order not found or not awaiting transfer verification');return publicJson({ok:true,status:'awaiting_verification'});
}
export async function OPTIONS(){return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':process.env.CORS_ALLOWED_ORIGIN||'https://altaqawy.github.io','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}})}
