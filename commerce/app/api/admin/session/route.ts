import {cookies} from 'next/headers';import {getAdmin,error,json} from '../../../../lib/server';
export async function GET(){const admin=await getAdmin();if(!admin)return error(401,'Not authenticated');const csrf=(await cookies()).get('patch_csrf')?.value;return json({email:admin.email,role:admin.role,csrf})}
