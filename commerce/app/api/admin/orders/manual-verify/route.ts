import {NextRequest} from 'next/server';import {owner,error,json,transaction,audit} from '../../../../../lib/server';
export async function POST(req:NextRequest){const admin=await owner(req);if(!admin)return error(403,'Owner only');const b=await req.json().catch(()=>({}));if(!/^[a-f0-9-]{36}$/i.test(b.orderId)||b.confirm!=='MANUALLY_VERIFIED_RECEIPT')return error(400,'Explicit manual verification required');const result=await transaction(async c=>{
 const r=await c.query("UPDATE orders SET payment_status='paid',status='on_hold_stock',updated_at=now() WHERE id=$1 AND method IN ('bank','wallet') AND payment_status='awaiting_verification' RETURNING id",[b.orderId]);if(!r.rowCount)return false;
 const items=await c.query('SELECT product_id,quantity FROM order_items WHERE order_id=$1',[b.orderId]);
 const stock=await c.query('SELECT id,stock FROM products WHERE id=ANY($1::text[]) ORDER BY id FOR UPDATE',[items.rows.map((x:any)=>x.product_id)]);
 if(items.rows.every((x:any)=>stock.rows.find((p:any)=>p.id===x.product_id)?.stock>=x.quantity)){
  for(const x of items.rows)await c.query('UPDATE products SET stock=stock-$2 WHERE id=$1',[x.product_id,x.quantity]);
  await c.query("UPDATE orders SET status='pending_fulfillment' WHERE id=$1",[b.orderId]);
 }
 await audit(c,admin.id,'manual_payment.verified',b.orderId);return true});return result?json({ok:true}):error(409,'Order not awaiting manual verification')}
