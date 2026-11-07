import {NextRequest,NextResponse} from 'next/server';import {db,originAllowed,error,json} from '../../../../lib/server';import {sha256,newToken,checkPassword} from '../../../../lib/security.mjs';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!originAllowed(req))return error(403,'Invalid origin');
 const ipHash=sha256(req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown');
 const pool=db();const rate=await pool.query("SELECT COUNT(*)::int n FROM auth_attempts WHERE ip_hash=$1 AND attempt_at>now()-interval '15 minutes'",[ipHash]);
 if(rate.rows[0].n>=8)return error(429,'محاولات كثيرة. حاول لاحقًا.');
 await pool.query('INSERT INTO auth_attempts(ip_hash) VALUES($1)',[ipHash]);
 const body=await req.json().catch(()=>({}));const email=String(body.email||'').toLowerCase().trim(),password=String(body.password||'');
 if(email.length>240||password.length>256)return error(400,'Invalid credentials');
 const r=await pool.query('SELECT * FROM admin_users WHERE email=$1 AND active=true LIMIT 1',[email]);const user=r.rows[0];
 if(!user||!checkPassword(password,user.password_hash))return error(401,'البريد أو كلمة المرور غير صحيحة');
 const token=newToken(),csrf=newToken();await pool.query("INSERT INTO admin_sessions(admin_id,token_hash,csrf_token_hash,expires_at) VALUES($1,$2,$3,now()+interval '8 hours')",[user.id,sha256(token),sha256(csrf)]);
 const response=json({ok:true,csrf,role:user.role});response.cookies.set('patch_admin_session',token,{httpOnly:true,secure:true,sameSite:'strict',path:'/',maxAge:8*3600});response.cookies.set('patch_csrf',csrf,{httpOnly:false,secure:true,sameSite:'strict',path:'/',maxAge:8*3600});return response;
}
