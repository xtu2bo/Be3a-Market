import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base='http://localhost:5173';const login=await fetch(base+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
let r=await fetch(base+'/api/upload',{method:'POST',headers:{cookie,Origin:base,'Content-Type':'image/svg+xml'},body:'<svg/>'});assert.equal(r.status,400);
r=await fetch(base+'/api/upload',{method:'POST',headers:{cookie,Origin:base,'Content-Type':'image/png'},body:readFileSync('public/images/collection.png')});const data=await r.json();assert.equal(r.status,200,JSON.stringify(data));r=await fetch(base+data.url);assert.equal(r.status,200);assert.equal(r.headers.get('content-type'),'image/png');assert.equal(r.headers.get('x-content-type-options'),'nosniff');console.log('PASS: image upload persists and serves from object storage; SVG upload rejected.');
