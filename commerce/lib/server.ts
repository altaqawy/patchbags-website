import 'server-only';
import {Pool, type PoolClient} from 'pg';
import {NextRequest,NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {sha256,constantEqual,keyFromEnv,decrypt} from './security.mjs';
export const runtime='nodejs';
const url=process.env.DATABASE_URL;
let connection:Pool|undefined;
export function db():Pool {if(!url)throw new Error('DATABASE_URL is not configured');connection??=new Pool({connectionString:url,max:8,ssl:url.includes('sslmode=require')?{rejectUnauthorized:true}:undefined});return connection}
export async function transaction<T>(run:(client:PoolClient)=>Promise<T>){const client=await db().connect();try{await client.query('BEGIN');const result=await run(client);await client.query('COMMIT');return result}catch(e){await client.query('ROLLBACK');throw e}finally{client.release()}}
export function json(data:unknown,status=200){return NextResponse.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
export function error(status:number,message:string){return json({error:message},status)}
export function originAllowed(req:NextRequest){const origin=req.headers.get('origin');const site=process.env.APP_ORIGIN;if(!site||!origin)return false;try{return new URL(origin).origin===new URL(site).origin}catch{return false}}
export function unsafeAllowed(req:NextRequest){return originAllowed(req)&&['application/json','application/x-www-form-urlencoded'].some(t=>req.headers.get('content-type')?.startsWith(t))}
export function publicOriginAllowed(req:NextRequest){const origin=req.headers.get('origin');if(!origin)return true;return origin===process.env.CORS_ALLOWED_ORIGIN||origin===process.env.APP_ORIGIN}
export function corsHeaders(){return {'Access-Control-Allow-Origin':process.env.CORS_ALLOWED_ORIGIN||'https://altaqawy.github.io','Access-Control-Allow-Headers':'Content-Type, X-Request-ID','Access-Control-Allow-Methods':'POST,OPTIONS,GET','Vary':'Origin','Cache-Control':'no-store'}}
export function publicJson(data:unknown,status=200){return NextResponse.json(data,{status,headers:corsHeaders()})}
export function publicError(status:number,message:string){return publicJson({error:message},status)}
export function encKey(){return keyFromEnv(process.env.PAYMOB_ENCRYPTION_KEY_BASE64)}
export function signingKey(){return keyFromEnv(process.env.COOKIE_SIGNING_KEY_BASE64)}
export type Admin={id:string,email:string,role:string,token:string,csrf:string};
export async function getAdmin():Promise<Admin|null>{
 const jar=await cookies();const token=jar.get('patch_admin_session')?.value;if(!token)return null;
 const found=await db().query(`SELECT a.id,a.email,a.role,s.csrf_token_hash FROM admin_sessions s
 JOIN admin_users a ON a.id=s.admin_id WHERE s.token_hash=$1 AND s.expires_at>now() AND a.active=true LIMIT 1`,[sha256(token)]);
 const row=found.rows[0];return row?{id:row.id,email:row.email,role:row.role,token,csrf:row.csrf_token_hash}:null;
}
export async function owner(req:NextRequest){if(!originAllowed(req))return null;const user=await getAdmin();if(!user||!['owner','super_admin'].includes(user.role))return null;
 const supplied=req.headers.get('x-csrf-token');const cookie=(await cookies()).get('patch_csrf')?.value;
 if(!supplied||!cookie||!constantEqual(supplied,cookie)||!constantEqual(sha256(supplied),user.csrf))return null;return user}
export async function readOnlyOwner(){const user=await getAdmin();return user&&['owner','super_admin'].includes(user.role)?user:null}
export async function settings(env:'test'|'live'){
 const r=await db().query('SELECT * FROM gateway_configs WHERE environment=$1',[env]);return r.rows[0]||null;
}
export function secret(row:Record<string,unknown>,name:'secret_cipher'|'hmac_cipher'){const value=row[name];if(!value||typeof value!=='string')throw Error('Gateway credentials missing');return decrypt(value,encKey())}
export function audit(client:PoolClient,adminId:string|null,action:string,target:string,metadata:Record<string,unknown>={}){
 return client.query('INSERT INTO audit_log(actor_id,action,target,metadata) VALUES($1,$2,$3,$4)',[adminId,action,target,JSON.stringify(metadata)]);
}
