import {NextRequest} from 'next/server';import {db,owner,readOnlyOwner,transaction,audit,settings,encKey,error,json} from '../../../../lib/server';import {encrypt} from '../../../../lib/security.mjs';
import {verifyKeyPairForEnvironment} from '../../../../lib/paymob.mjs';
const safe=(r:any)=>r?({environment:r.environment,publicKey:r.public_key||'',integrationIds:r.integration_ids||[],hasSecret:!!r.secret_cipher,hasHmac:!!r.hmac_cipher,credentialStatus:r.credential_status,webhookVerified:r.webhook_verified,liveActivated:r.live_activated,updatedAt:r.updated_at}):null;
export async function GET(){const user=await readOnlyOwner();if(!user)return error(403,'Owner only');const [config,methods,store]=await Promise.all([db().query('SELECT * FROM gateway_configs ORDER BY environment DESC'),db().query('SELECT * FROM payment_methods ORDER BY method'),db().query('SELECT shipping_minor,tax_basis_points FROM store_settings WHERE id=1')]);return json({configs:config.rows.map(safe),methods:methods.rows,store:store.rows[0]||{shipping_minor:null}})}
export async function POST(req:NextRequest){
 const user=await owner(req);if(!user)return error(403,'Owner authorization / CSRF required');
 const b=await req.json().catch(()=>({}));const action=b.action;
 if(action==='credentials'){
  const env=b.environment;if(env!=='test'&&env!=='live')return error(400,'Invalid environment');
  const ids=Array.isArray(b.integrationIds)?b.integrationIds.map(Number):[];
  if(!ids.length||ids.length>12||ids.some((id:number)=>!Number.isSafeInteger(id)||id<1))return error(400,'Enter valid payment integration IDs');
  const pk=String(b.publicKey||'').trim(),sk=String(b.secretKey||'').trim(),hm=String(b.hmacSecret||'').trim();
  if(!verifyKeyPairForEnvironment(pk,sk,env)||hm.length<16||hm.length>500||sk.length>500)return error(400,'Invalid or mismatched test/live credential format');
  await transaction(async c=>{await c.query(`UPDATE gateway_configs SET secret_cipher=$2,public_key=$3,hmac_cipher=$4,integration_ids=$5,credential_status='saved_unverified',webhook_verified=false,live_activated=false,updated_at=now() WHERE environment=$1`,[env,encrypt(sk,encKey()),pk,encrypt(hm,encKey()),ids]);await audit(c,user.id,'credentials.saved',env,{ids:ids.length})});
  return json({ok:true,status:'saved_unverified'});
 }
 if(action==='revoke'){
  if(b.environment!=='test'&&b.environment!=='live')return error(400,'Invalid environment');
  await transaction(async c=>{await c.query("UPDATE gateway_configs SET secret_cipher=null,public_key=null,hmac_cipher=null,integration_ids='{}',credential_status='not_configured',webhook_verified=false,live_activated=false WHERE environment=$1",[b.environment]);await c.query("UPDATE payment_methods SET enabled=false WHERE method='paymob'");await audit(c,user.id,'credentials.revoked',b.environment)});return json({ok:true});
 }
 if(action==='method'){
  if(!['paymob','cod','bank','wallet'].includes(b.method)||typeof b.enabled!=='boolean')return error(400,'Invalid payment method');
  if(b.method==='paymob'&&b.enabled){const live=await settings('live'),test=await settings('test');if(!live?.live_activated && test?.credential_status!=='verified')return error(409,'Paymob connection not verified in either environment');}
  if(b.instructions && String(b.instructions).length>1300)return error(400,'Instructions too long');
  if(b.receivingAccount && String(b.receivingAccount).length>180)return error(400,'Receiving details too long');
  await transaction(async c=>{await c.query('UPDATE payment_methods SET enabled=$2,instructions=$3,receiving_account=$4,verified=false,updated_at=now() WHERE method=$1',[b.method,b.enabled,String(b.instructions||'').trim(),String(b.receivingAccount||'').trim()]);await audit(c,user.id,'payment_method.updated',b.method,{enabled:b.enabled})});return json({ok:true});
 }
 if(action==='store'){
  const shipping=Number(b.shippingMinor),tax=Number(b.taxBasisPoints||0);
  if(!Number.isSafeInteger(shipping)||shipping<0||shipping>1000000||!Number.isInteger(tax)||tax!==0)return error(400,'Shipping must be configured in piasters; tax requires a tax integration review');
  await transaction(async c=>{await c.query('UPDATE store_settings SET shipping_minor=$1,tax_basis_points=$2,updated_at=now() WHERE id=1',[shipping,tax]);await audit(c,user.id,'store.shipping_updated','store',{shipping})});return json({ok:true});
 }
 return error(400,'Unknown action');
}
