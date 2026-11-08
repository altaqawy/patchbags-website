import {NextRequest} from 'next/server';
export type VerifiedCustomer={id:string,email:string,fullName:string|null};
/**
 * Server verifies an opaque Supabase access token against Supabase Auth.
 * An email typed in checkout is never accepted as proof of identity.
 * Fail-closed if the auth project or publishable key is not configured.
 */
export async function verifiedCustomer(req:NextRequest):Promise<VerifiedCustomer|null>{
 const header=req.headers.get('authorization')||'';
 const token=header.startsWith('Bearer ')?header.slice(7).trim():'';
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!token||token.length<30||token.length>8192||!base||!key)return null;
 let url:URL;try{url=new URL('/auth/v1/user',base);if(url.protocol!=='https:')return null}catch{return null}
 try{
  const r=await fetch(url,{method:'GET',headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(7000)});
  if(!r.ok)return null;
  const user=await r.json();
  if(!user||! /^[a-f0-9-]{36}$/.test(String(user.id||''))||
     ! /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(user.email||''))||
     !user.email_confirmed_at)return null;
  return {id:user.id,email:String(user.email).toLowerCase(),fullName:typeof user.user_metadata?.display_name==='string'?user.user_metadata.display_name.slice(0,100):null};
 }catch{return null}
}
