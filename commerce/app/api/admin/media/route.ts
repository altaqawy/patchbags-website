import {NextRequest} from 'next/server';
import {randomUUID} from 'node:crypto';
import {S3Client,PutObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {error,json,owner} from '../../../../lib/server';
export const runtime='nodejs';
const MIME:Record<string,{type:string,ext:string,limit:number}>={
 'image/jpeg':{type:'image',ext:'jpg',limit:10*1024*1024},
 'image/png':{type:'image',ext:'png',limit:10*1024*1024},
 'image/webp':{type:'image',ext:'webp',limit:10*1024*1024},
 'video/mp4':{type:'video',ext:'mp4',limit:60*1024*1024},
 'video/webm':{type:'video',ext:'webm',limit:60*1024*1024},
 'model/gltf-binary':{type:'model',ext:'glb',limit:40*1024*1024},
 'model/gltf+json':{type:'model',ext:'gltf',limit:5*1024*1024}
};
export async function POST(req:NextRequest){
 const admin=await owner(req);
 if(!admin)return error(403,'Owner only');
 const endpoint=process.env.MEDIA_S3_ENDPOINT,bucket=process.env.MEDIA_S3_BUCKET,region=process.env.MEDIA_S3_REGION||'auto';
 const base=process.env.MEDIA_PUBLIC_BASE_URL,accessKeyId=process.env.MEDIA_S3_ACCESS_KEY_ID,secretAccessKey=process.env.MEDIA_S3_SECRET_ACCESS_KEY;
 if(!endpoint||!bucket||!base||!accessKeyId||!secretAccessKey)return error(503,'Media storage not configured');
 let publicBase:URL;
 try{publicBase=new URL(base);if(publicBase.protocol!=='https:')throw Error('HTTPS required')}catch{return error(503,'Media public URL invalid')}
 const b=await req.json().catch(()=>({}));
 const mime=String(b.contentType||''),size=Number(b.size),filename=String(b.filename||'');
 const allowed=MIME[mime];
 if(!allowed||!Number.isSafeInteger(size)||size<1||size>allowed.limit||
     filename.length<1||filename.length>200||/[\\/\u0000-\u001f]/.test(filename))
  return error(400,'Invalid file type, filename or file size');
 const key='products/'+new Date().toISOString().slice(0,7).replace('-','/')+'/'+randomUUID()+'.'+allowed.ext;
 try{
  const client=new S3Client({endpoint,region,forcePathStyle:true,credentials:{accessKeyId,secretAccessKey}});
  const command=new PutObjectCommand({Bucket:bucket,Key:key,ContentType:mime,ContentLength:size,CacheControl:'public,max-age=31536000,immutable'});
  const uploadUrl=await getSignedUrl(client,command,{expiresIn:300});
  return json({uploadUrl,assetUrl:base.replace(/\/$/,'')+'/'+key,contentType:mime,mediaType:allowed.type,maxBytes:allowed.limit,expiresInSeconds:300});
 }catch{return error(502,'Unable to prepare media upload')}
}
