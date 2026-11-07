import {NextRequest} from 'next/server';import {db,error,json,settings,secret,transaction} from '../../../../lib/server';
import {verifyTransactionHmac} from '../../../../lib/security.mjs';import {webhookDecision} from '../../../../lib/commerce-core.mjs';
export const runtime='nodejs';
export async function GET(){return error(405,'Browser redirects cannot confirm payments')}
export async function POST(req:NextRequest){
 const signature=req.nextUrl.searchParams.get('hmac')||'';
 if(!/^[0-9a-f]{128}$/i.test(signature))return error(401,'Invalid signature');
 if(Number(req.headers.get('content-length')||0)>256000)return error(413,'Webhook too large');
 const body=await req.json().catch(()=>null),tx=body?.obj;
 if(body?.type!=='TRANSACTION'||!tx||typeof tx!=='object')return error(400,'Unsupported callback');
 if(typeof tx.is_live!=='boolean')return error(400,'Unspecified environment');
 const env=tx.is_live?'live':'test';const g=await settings(env);
 if(!g?.hmac_cipher)return error(503,'Webhook verification not configured');
 if(!verifyTransactionHmac(tx,signature,secret(g,'hmac_cipher')))return error(401,'HMAC mismatch');
 // An authenticated webhook proves reachability/signature, but doesn't by itself
 // prove every payment integration is active or live-approved.
 await db().query('UPDATE gateway_configs SET webhook_verified=true,updated_at=now() WHERE environment=$1',[env]);
 const providerId=String(tx.order?.id||''),transactionId=String(tx.id||'');
 if(!providerId||!transactionId||tx.currency!=='EGP')return error(400,'Malformed transaction');
 const result=await transaction(async c=>{
  const attempt=await c.query('SELECT * FROM payment_attempts WHERE provider_order_id=$1 AND environment=$2 FOR UPDATE',[providerId,env]);
  if(!attempt.rowCount)return 'unknown';
  const a=attempt.rows[0];const orderResult=await c.query('SELECT * FROM orders WHERE id=$1 FOR UPDATE',[a.order_id]);if(!orderResult.rowCount)return 'unknown';
  const order=orderResult.rows[0];const decision=webhookDecision(order,a,tx);
  if(decision==='mismatch')return 'mismatch';
  const added=await c.query(`INSERT INTO payment_events(provider_transaction_id,payment_attempt_id,event_type,result) VALUES($1,$2,$3,$4)
    ON CONFLICT(provider_transaction_id,event_type,result) DO NOTHING RETURNING id`,[transactionId,a.id,'TRANSACTION',decision]);
  if(!added.rowCount)return 'duplicate';
  await c.query('UPDATE payment_attempts SET status=$2,updated_at=now() WHERE id=$1',[a.id,decision]);
  if(decision==='paid'){
   // Compare-and-set prevents two verified attempts from double-fulfilling an order.
   const updated=await c.query("UPDATE orders SET payment_status='paid',status='pending_fulfillment',updated_at=now() WHERE id=$1 AND payment_status<>'paid' AND payment_status<>'refunded' RETURNING id",[order.id]);
   if(updated.rowCount){
    const lines=await c.query('SELECT product_id,quantity FROM order_items WHERE order_id=$1',[order.id]);
    for(const line of lines.rows){await c.query('UPDATE products SET stock=GREATEST(0,stock-$2) WHERE id=$1',[line.product_id,line.quantity]);}
   }
  }else if(decision==='refunded'&&order.payment_status==='paid'){
   await c.query("UPDATE orders SET payment_status='refunded',status='on_hold',updated_at=now() WHERE id=$1",[order.id]);
  }else if(decision==='failed'&&order.payment_status==='pending'){
   await c.query("UPDATE orders SET payment_status='failed',status='pending_payment',updated_at=now() WHERE id=$1",[order.id]);
  }
  return decision;
 });
 if(result==='mismatch')return error(409,'Amount, currency or order mismatch');
 if(result==='unknown')return error(404,'Unknown provider order');
 return json({received:true});
}
