import assert from 'node:assert/strict';
const base='http://localhost:5173';
const catalog=await (await fetch(base+'/api/catalog')).json(); const productIds=(catalog.products||[]).map(p=>p.id); const sampleProducts=productIds.slice(0,2);
const routes=['/','/shop','/shop?q='+encodeURIComponent('شنطة'),'/category/'+encodeURIComponent('ملابس'),'/category/'+encodeURIComponent('شنط'),...sampleProducts.map(id=>'/product/'+encodeURIComponent(id)),'/cart','/checkout','/favorites','/about','/contact','/shipping','/privacy','/returns'];
for(const path of routes){const response=await fetch(base+path);assert.equal(response.status,200,path);console.log('OK',decodeURIComponent(path));}
for(const path of ['/missing-page','/product/does-not-exist','/category/unknown','/admin/unknown'])assert.equal((await fetch(base+path)).status,404,path);
const signin=await fetch(base+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});const cookie=signin.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
for(const path of ['/admin','/admin/products','/admin/orders','/admin/settings','/admin/analytics','/admin/coupons','/admin/categories','/admin/shipping','/admin/notifications','/admin/team']){assert.equal((await fetch(base+path,{headers:{cookie}})).status,200,path);console.log('OK',path);}
assert.equal((await fetch(base+'/api/admin')).status,403);
console.log('PASS: storefront and authenticated admin routes; invalid routes return 404; admin API denied for anonymous users.');
