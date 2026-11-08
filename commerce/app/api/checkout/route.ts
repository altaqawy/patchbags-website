import {NextRequest} from 'next/server';import {randomUUID} from 'node:crypto';
import {db,transaction,error,publicJson,publicError,publicOriginAllowed,corsHeaders,secret,settings} from '../../../lib/server';
import {newToken,sha256} from '../../../lib/security.mjs';import {normalizeCart,priceCart} from '../../../lib/commerce-core.mjs';
import {createIntention,intentionPayload,unifiedCheckoutUrl} from '../../../lib/paymob.mjs';
import {verifiedCustomer} from '../../../lib/customer-auth';
export const runtime='nodejs';
export async function OPTIONS(){return new Response(null,{status:204,headers:corsHeaders()})}
export async function POST(req:NextRequest){
 if(!publicOriginAllowed(req))return publicError(403,'Origin not allowed');
 if(!req.headers.get('content-type')?.startsWith('application/json'))return publicError(415,'JSON required');
 const identity=await verifiedCustomer(req);
 if(!identity)return publicError(401,'Please sign in to your verified account before checkout');
 const ipHash=sha256(req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown');
 const attempts=await db().query("SELECT COUNT(*)::int n FROM api_attempts WHERE ip_hash=$1 AND attempt_at>now()-interval '1 hour'",[ipHash]);
 if(attempts.rows[0].n>=40)return publicError(429,'Too many checkout attempts. Try again later.');
 await db().query('INSERT INTO api_attempts(ip_hash) VALUES($1)',[ipHash]);
 const b=await req.json().catch(()=>({}));let cart:{id:string;quantity:number}[];
 try{cart=normalizeCart(b.cart)}catch(e){return publicError(400,e instanceof Error?e.message:'Invalid cart')}
 const method=String(b.method||''),customer=b.customer||{},ref=String(b.requestId||'');
 if(!['paymob','cod','bank','wallet'].includes(method)||!/^[-\w]{20,120}$/.test(ref))return publicError(400,'Invalid method or request identifier');
 const name=String(customer.name||identity.fullName||'').trim(),email=identity.email,phone=String(customer.phone||'').trim(),city=String(customer.city||'').trim(),address=String(customer.address||'').trim(),notes=String(customer.notes||'').trim();
 if(name.length<2||name.length>100||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)||phone.length<7||phone.length>25||city.length<2||city.length>100||address.length<4||address.length>300||notes.length>400)return publicError(400,'Please complete valid customer and delivery fields');
 // Do not create an orphan payment order if no merchant integration is configured.
 const liveGateway=method==='paymob'?await settings('live'):null;
 const testGateway=method==='paymob'?await settings('test'):null;
 const chosenEnv=liveGateway?.live_activated?'live':'test';
 const chosenGateway=chosenEnv==='live'?liveGateway:testGateway;
 if(method==='paymob'&&(!chosenGateway?.secret_cipher||!chosenGateway.public_key||
    !chosenGateway.integration_ids?.length||chosenGateway.credential_status!=='verified'))
   return publicError(503,'Paymob payment is not yet configured and verified');
 const mode=method==='paymob'?'paymob':method;
 const [allowed,ship,active]=await Promise.all([
  db().query('SELECT enabled,receiving_account,instructions FROM payment_methods WHERE method=$1',[mode]),
  db().query('SELECT shipping_minor,tax_basis_points FROM store_settings WHERE id=1'),
  db().query('SELECT id,title,price_minor,currency,stock,active FROM products WHERE id=ANY($1::text[])',[cart.map(i=>i.id)])
 ]);
 if(!allowed.rows[0]?.enabled)return publicError(409,'Payment method is not enabled');
 if(ship.rows[0]?.shipping_minor===null||ship.rows[0]?.shipping_minor===undefined)return publicError(409,'Delivery fees are not configured yet');
 if(ship.rows[0].tax_basis_points!==0)return publicError(409,'Tax rules are not configured for this store');
 let price:ReturnType<typeof priceCart>;try{price=priceCart(cart,active.rows,Number(ship.rows[0].shipping_minor))}catch(e){return publicError(409,e instanceof Error?e.message:'Unavailable product')}
 const token=newToken(),attemptId=randomUUID();
 let orderId:string;
 try{orderId=await transaction(async c=>{
  const existing=await c.query('SELECT id FROM orders WHERE client_request_id=$1',[ref]);if(existing.rowCount)throw Error('Duplicate request ID — refresh status instead of submitting again');
  const customerRow=await c.query('INSERT INTO customers(email,full_name,phone) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET email=EXCLUDED.email RETURNING id',[email,name,phone]);
  const status=method==='cod'?'pending_confirmation':method==='paymob'?'pending_payment':'awaiting_payment_verification';
  const paymentStatus=method==='cod'?'unpaid':method==='paymob'?'pending':'awaiting_verification';
  const result=await c.query(`INSERT INTO orders(customer_id,customer_name,email,phone,city,address,notes,shipping_minor,subtotal_minor,total_minor,method,status,payment_status,client_request_id,tracking_token_hash)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,[customerRow.rows[0].id,name,email,phone,city,address,notes,price.shippingMinor,price.subtotal,price.total,method,status,paymentStatus,ref,sha256(token)]);
  for(const i of price.items)await c.query('INSERT INTO order_items(order_id,product_id,title_snapshot,quantity,unit_minor,total_minor) VALUES($1,$2,$3,$4,$5,$6)',[result.rows[0].id,i.id,i.title,i.quantity,i.price,i.amount]);
  if(method==='paymob')await c.query('INSERT INTO payment_attempts(id,order_id,environment,amount_minor,currency,special_reference) VALUES($1,$2,$3,$4,$5,$6)',[attemptId,result.rows[0].id,'test',price.total,'EGP',attemptId]);
  return result.rows[0].id as string;
 })}catch(e){return publicError(409,e instanceof Error?e.message:'Unable to create order')}
 const base=process.env.APP_ORIGIN;
 if(method!=='paymob'){
  return publicJson({orderId,trackingToken:token,method,status:method==='cod'?'pending_confirmation':'awaiting_verification',paymentStatus:method==='cod'?'unpaid':'awaiting_verification',instructions:method==='cod'?'Pay when the store confirms delivery.':allowed.rows[0].instructions,receivingAccount:method==='cod'?'':allowed.rows[0].receiving_account},201);
 }
 const env=chosenEnv,g=chosenGateway;
 if(!g?.secret_cipher||!g.public_key||!g.integration_ids?.length||g.credential_status!=='verified')return publicError(503,'Paymob configuration is incomplete. Order remains pending; contact the studio.');
 if(!base?.startsWith('https://'))return publicError(503,'Secure backend URL is missing');
 await db().query('UPDATE payment_attempts SET environment=$2 WHERE id=$1',[attemptId,env]);
 const payload=intentionPayload({price,customer:{name,email,phone,city,address},orderId,attemptId,integrationIds:g.integration_ids,webhookUrl:base+'/api/paymob/webhook',returnUrl:base+'/payment-result?order='+encodeURIComponent(orderId)});
 try{
  const result=await createIntention(secret(g,'secret_cipher'),payload);
  await db().query('UPDATE payment_attempts SET intention_id=$2,provider_order_id=$3,client_secret_hash=$4 WHERE id=$1',[attemptId,result.intentionId,result.providerOrderId,sha256(result.clientSecret)]);
  const checkoutUrl=unifiedCheckoutUrl(g.public_key,result.clientSecret);
  return publicJson({orderId,trackingToken:token,checkoutUrl,amountMinor:price.total,currency:'EGP',status:'pending',environment:env},201);
 }catch(e){await db().query("UPDATE payment_attempts SET status='failed' WHERE id=$1",[attemptId]);return publicError(502,e instanceof Error?e.message:'Paymob unavailable')}
}
