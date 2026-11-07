import {randomUUID} from 'node:crypto';import {NextRequest} from 'next/server';import {owner,settings,secret,db,error,json,transaction,audit} from '../../../../../lib/server';
import {createIntention,intentionPayload,verifyKeyPairForEnvironment} from '../../../../../lib/paymob.mjs';
export async function POST(req:NextRequest){
 const user=await owner(req);if(!user)return error(403,'Owner only');const b=await req.json().catch(()=>({}));const env=b.environment;
 if(!['test','live'].includes(env))return error(400,'Invalid environment');
 if(env==='live'&&b.confirm!=='VERIFY_WITHOUT_CHARGE')return error(400,'Explicit live credential test consent required');
 const g=await settings(env);if(!g?.secret_cipher||!g.public_key||!g.hmac_cipher||!g.integration_ids?.length)return error(409,'Save matching credentials first');
 const key=secret(g,'secret_cipher');if(!verifyKeyPairForEnvironment(g.public_key,key,env))return error(409,'Credentials are inconsistent with the selected mode');
 const app=process.env.APP_ORIGIN;if(!app?.startsWith('https://'))return error(503,'Configure the public HTTPS backend origin first');
 try{
  const price={total:100,shippingMinor:0,items:[{id:'TEST',quantity:1,title:'Connection verification — no checkout',amount:100}]};
  const customer={name:'Test Merchant',email:'sandbox@example.com',phone:'+201010101010',address:'NA',city:'Cairo'};
  // Creates a Paymob intention only. It NEVER redirects, collects cards, initiates capture or charges anything.
  const p=intentionPayload({price,customer,orderId:'setup',attemptId:'credential-check-'+randomUUID(),integrationIds:g.integration_ids,webhookUrl:app+'/api/paymob/webhook',returnUrl:app+'/admin'});
  await createIntention(key,p);
  await transaction(async c=>{await c.query("UPDATE gateway_configs SET credential_status='verified',updated_at=now() WHERE environment=$1",[env]);await audit(c,user.id,'paymob.credentials_verified',env,{chargeInitiated:false})});
  return json({ok:true,credentialsValid:true,webhookVerified:g.webhook_verified,readyForLive:false,message:'Credentials validated by creating a non-charging intention. No checkout or payment was initiated.'});
 }catch(e){await db().query("UPDATE gateway_configs SET credential_status='saved_unverified' WHERE environment=$1",[env]);return error(422,e instanceof Error?e.message:'Paymob validation failed')}
}
