import {randomBytes,createHash,createHmac,timingSafeEqual,createCipheriv,createDecipheriv,scryptSync} from 'node:crypto';
export function sha256(s){return createHash('sha256').update(String(s)).digest('hex')}
export function keyFromEnv(value){const k=Buffer.from(value||'','base64');if(k.length!==32)throw Error('Missing or invalid 32-byte encryption key');return k}
export function encrypt(plaintext,key){const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',key,iv);const ciphertext=Buffer.concat([cipher.update(plaintext,'utf8'),cipher.final()]);return Buffer.concat([iv,cipher.getAuthTag(),ciphertext]).toString('base64')}
export function decrypt(value,key){const b=Buffer.from(value,'base64');if(b.length<29)throw Error('Invalid ciphertext');const d=createDecipheriv('aes-256-gcm',key,b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8')}
export function constantEqual(a,b){if(typeof a!=='string'||typeof b!=='string')return false;const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right)}
export function newToken(){return randomBytes(32).toString('base64url')}
export function hashPassword(password,salt=randomBytes(16).toString('hex')){return 'scrypt$'+salt+'$'+scryptSync(password,salt,64).toString('hex')}
export function checkPassword(password,stored){const [method,salt,h]=String(stored).split('$');if(method!=='scrypt'||!salt||!h)return false;return constantEqual(scryptSync(password,salt,64).toString('hex'),h)}
const FIELDS=['amount_cents','created_at','currency','error_occured','has_parent_transaction','id','integration_id','is_3d_secure','is_auth','is_capture','is_refunded','is_standalone_payment','is_voided','order.id','owner','pending','source_data.pan','source_data.sub_type','source_data.type','success'];
export function signedTransactionString(tx){return FIELDS.map(field=>{const value=field.split('.').reduce((obj,key)=>obj?.[key],tx);if(value===undefined||value===null)throw Error('Missing signed field '+field);return String(value)}).join('')}
export function transactionHmac(tx,secret){return createHmac('sha512',secret).update(signedTransactionString(tx)).digest('hex')}
export function verifyTransactionHmac(tx,received,secret){if(!/^[a-f0-9]{128}$/i.test(received||''))return false;try{return constantEqual(transactionHmac(tx,secret),received.toLowerCase())}catch{return false}}
