import {hashPassword} from '../lib/security.mjs';
if(!process.stdin.isTTY){console.error('Run interactively to avoid exposing a password on the process command line.');process.exit(1)}
const {createInterface}=await import('node:readline');const reader=createInterface({input:process.stdin,output:process.stdout});
const password=await new Promise(r=>reader.question('Owner password (input will be visible; use a private terminal): ',r));reader.close();
if(password.length<14)throw Error('Use a password of at least 14 characters');console.log(hashPassword(password));
