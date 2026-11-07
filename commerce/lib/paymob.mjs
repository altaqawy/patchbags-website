/* Official Egyptian Paymob Intention API, server-side only. */
export const INTENTIONS='https://accept.paymob.com/v1/intention/';
export const UNIFIED_CHECKOUT='https://eg.checkout.paymob.com/';
function requireHttps(value){const u=new URL(value);if(u.protocol!=='https:')throw Error('HTTPS required');return u.toString()}
export function intentionPayload({price,customer,orderId,attemptId,integrationIds,webhookUrl,returnUrl}){
 const fields={
  apartment:'NA',floor:'NA',street:customer.address,building:'NA',phone_number:customer.phone,
  first_name:customer.name.split(' ')[0],last_name:customer.name.split(' ').slice(1).join(' ')||'NA',
  city:customer.city,country:'EG',state:customer.city,email:customer.email
 };
 // Add shipping as a distinct item to keep the sum of items equal to the charge.
 const items=price.items.map(i=>({name:i.title,amount:i.amount,quantity:i.quantity,description:i.id}));
 if(price.shippingMinor>0)items.push({name:'Delivery',amount:price.shippingMinor,quantity:1,description:'Shipping'});
 return {amount:price.total,currency:'EGP',payment_methods:integrationIds,items,
   billing_data:fields,special_reference:attemptId,notification_url:requireHttps(webhookUrl),
   redirection_url:requireHttps(returnUrl),expiration:3600};
}
export async function createIntention(secretKey,payload,{fetcher=fetch,signal}={}){
 const response=await fetcher(INTENTIONS,{method:'POST',headers:{Authorization:'Token '+secretKey,'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
 // Do not leak provider response bodies: they may include sensitive details.
 if(!response.ok)throw Error(response.status===401?'Paymob rejected the secret key.':response.status===404?'Paymob rejected the integration ID or environment.':'Paymob intention request failed ('+response.status+').');
 const result=await response.json();
 if(!result.client_secret||!result.intention_order_id||!result.id)throw Error('Incomplete Paymob intention response');
 return {clientSecret:result.client_secret,providerOrderId:String(result.intention_order_id),intentionId:String(result.id)};
}
export function unifiedCheckoutUrl(publicKey,clientSecret){if(!/^egy_pk_(?:test|live)_/.test(publicKey||''))throw Error('Invalid Paymob public key');if(!/^egy_csk_(?:test|live)_/.test(clientSecret||''))throw Error('Invalid client secret');const u=new URL(UNIFIED_CHECKOUT);u.searchParams.set('publicKey',publicKey);u.searchParams.set('clientSecret',clientSecret);return u.toString()}
export function verifyKeyPairForEnvironment(publicKey,secretKey,env){const type=env==='live'?'live':'test';return String(publicKey).startsWith('egy_pk_'+type+'_')&&(String(secretKey).startsWith('egy_sk_'+type+'_')||String(secretKey).startsWith('sk_'+type+'_'))}
