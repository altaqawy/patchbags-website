import {NextRequest} from 'next/server';import {randomUUID} from 'node:crypto';
import {db,transaction,publicOriginAllowed,publicError,publicJson,corsHeaders,settings,secret} from '../../../../../lib/server';
import {sha256} from '../../../../../lib/security.mjs';import {createIntention,intentionPayload,unifiedCheckoutUrl} from '../../../../../lib/paymob.mjs';
export const runtime='nodejs';
export async function OPTIONS(){return new Response(null,{status:204,headers:corsHeaders()})}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!publicOriginAllowed(req))return publicError(403,'Origin not allowed');const {id}=await params;
 const b=await req.json().catch(()=>({})),token=String(b.trackingToken||'');
 if(!/^[a-f0-9-]{36}$/i.test(id)||token.length<30)return publicError(404,'Order not found');
 const [found,lines,method]=await Promise.all([
  db().query('SELECT * FROM orders WHERE id=$1 AND tracking_token_hash=$2',[id,sha256(token)]),
  db().query('SELECT product_id,title_snapshot,quantity,total_minor FROM order_items WHERE order_id=$1',[id]),
  db().query("SELECT enabled FROM payment_methods WHERE method='paymob'")
 ]);
 const order=found.rows[0];if(!order||order.method!=='paymob'||order.payment_status==='paid'||order.payment_status==='refunded')return publicError(409,'This order cannot be retried');
 if(!method.rows[0]?.enabled)return publicError(409,'Paymob payment is disabled');
 const live=await settings('live'),test=await settings('test'),env=live?.live_activated?'live':'test',g=env==='live'?live:test;
 if(!g?.secret_cipher||!g.public_key||g.credential_status!=='verified')return publicError(503,'Payment service unavailable');
 const origin=process.env.APP_ORIGIN;if(!origin?.startsWith('https://'))return publicError(503,'Secure backend not configured');
 const attemptId=randomUUID();
 try{
  await transaction(async c=>{
   const locked=await c.query('SELECT payment_status FROM orders WHERE id=$1 FOR UPDATE',[id]);
   if(['paid','refunded'].includes(locked.rows[0]?.payment_status))throw Error('Already paid');
   const count=await c.query("SELECT COUNT(*)::int n FROM payment_attempts WHERE order_id=$1 AND created_at>now()-interval '1 hour'",[id]);
   if(count.rows[0].n>=5)throw Error('Too many payment attempts');
   await c.query('INSERT INTO payment_attempts(id,order_id,environment,amount_minor,currency,special_reference) VALUES($1,$2,$3,$4,$5,$6)',[attemptId,id,env,order.total_minor,'EGP',attemptId]);
   await c.query("UPDATE orders SET payment_status='pending',status='pending_payment',updated_at=now() WHERE id=$1",[id]);
  });
 }catch(e){return publicError(409,e instanceof Error?e.message:'Retry blocked')}
 const price={total:Number(order.total_minor),shippingMinor:Number(order.shipping_minor),items:lines.rows.map(i=>({id:i.product_id,title:i.title_snapshot,quantity:i.quantity,amount:Number(i.total_minor)}))};
 const customer={name:order.customer_name,email:order.email,phone:order.phone,address:order.address,city:order.city};
 const payload=intentionPayload({price,customer,orderId:id,attemptId,integrationIds:g.integration_ids,webhookUrl:origin+'/api/paymob/webhook',returnUrl:origin+'/payment-result?order='+encodeURIComponent(id)});
 try{
  const intention=await createIntention(secret(g,'secret_cipher'),payload);
  await db().query('UPDATE payment_attempts SET provider_order_id=$2,intention_id=$3,client_secret_hash=$4 WHERE id=$1',[attemptId,intention.providerOrderId,intention.intentionId,sha256(intention.clientSecret)]);
  return publicJson({orderId:id,checkoutUrl:unifiedCheckoutUrl(g.public_key,intention.clientSecret),status:'pending'},200);
 }catch(e){await db().query("UPDATE payment_attempts SET status='failed' WHERE id=$1",[attemptId]);return publicError(502,e instanceof Error?e.message:'Paymob unavailable')}
}
