import {NextRequest} from 'next/server';import {db,readOnlyOwner,error,json} from '../../../../../lib/server';
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!await readOnlyOwner())return error(403,'Owner only');const {id}=await params;if(!/^[a-f0-9-]{36}$/i.test(id))return error(404,'Order not found');
 const [o,i,a]=await Promise.all([db().query('SELECT id,customer_name,email,phone,city,address,notes,method,status,payment_status,total_minor,shipping_minor,currency,manual_reference,created_at FROM orders WHERE id=$1',[id]),db().query('SELECT product_id,title_snapshot,quantity,unit_minor,total_minor FROM order_items WHERE order_id=$1',[id]),db().query('SELECT environment,provider_order_id,intention_id,status,created_at FROM payment_attempts WHERE order_id=$1 ORDER BY created_at DESC',[id])]);
 return o.rowCount?json({order:o.rows[0],items:i.rows,attempts:a.rows}):error(404,'Order not found');
}
