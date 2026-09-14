import assert from 'node:assert/strict';
const base='http://localhost:5173';
const login=await fetch(base+'/signin-with-chatgpt?return_to=/admin',{redirect:'manual'});
const cookie=login.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
console.log('Local sign-in response',login.status,'cookie present',!!cookie);
const anon=await fetch(base+'/api/admin');assert.equal(anon.status,403);
const admin=await fetch(base+'/api/admin',{headers:{cookie}});console.log('Admin data response',admin.status);const initial=await admin.json();if(admin.status!==200)throw Error(JSON.stringify(initial));
const send=async(path,payload,authenticated=true,origin=base)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...(authenticated?{cookie}:{})},body:JSON.stringify(payload)});const text=await r.text();let data;try{data=JSON.parse(text);}catch{data={error:text};}return {status:r.status,data};};
assert.equal((await send('/api/admin',{action:'settings',data:initial.settings},false)).status,403);
assert.equal((await send('/api/admin',{action:'settings',data:initial.settings},true,'https://evil.example')).status,403);
const closed=await send('/api/orders',{id:crypto.randomUUID(),customer:'Test customer',phone:'01012345678',address:'Test address only',governorate:'Test region',notes:'',items:[{productId:'test-item',size:'M',color:'black',quantity:1}]},false);assert.equal(closed.status,409);
const id='test-'+crypto.randomUUID();
const product={id,name:'Test product only',category:initial.settings.categories[0],price:500,image:'/images/collection.png',images:['/images/editorial.png'],description:'Automated local test, removed after verification',stock:2,sizes:['M'],colors:['black'],active:true,demo:false,featured:false};
assert.equal((await send('/api/admin',{action:'product',data:product})).status,200);
const testSettings={...initial.settings,checkoutEnabled:true,shipping:[{name:'Test region',price:50}]};assert.equal((await send('/api/admin',{action:'settings',data:testSettings})).status,200);
const beforeOrder=await (await fetch(base+'/api/admin',{headers:{cookie}})).json();
const staleProduct=beforeOrder.products.find(p=>p.id===id);
assert.deepEqual(staleProduct.images,['/images/editorial.png']);
assert.equal((await fetch(base+'/product/'+id)).status,200);
const order={id:crypto.randomUUID(),customer:'Test customer',phone:'01012345678',address:'Test address only',governorate:'Test region',notes:'Local test only',items:[{productId:id,size:'M',color:'black',quantity:1}]};
const placed=await send('/api/orders',order,false);assert.equal(placed.status,201,JSON.stringify(placed));assert.equal(placed.data.total,55000);
assert.equal((await send('/api/admin',{action:'product',data:staleProduct})).status,409);
const now=await (await fetch(base+'/api/admin',{headers:{cookie}})).json();assert.equal((await send('/api/admin',{action:'product',data:{...now.products.find(p=>p.id===id),description:'Updated safely'}})).status,200);
const repeat=await send('/api/orders',order,false);assert.equal(repeat.status,200);assert.equal(repeat.data.reference,placed.data.reference);
const oversell=await send('/api/orders',{...order,id:crypto.randomUUID(),items:[{...order.items[0],quantity:2}]},false);assert.equal(oversell.status,409);
const current=await (await fetch(base+'/api/admin',{headers:{cookie}})).json();assert.equal(current.products.find(p=>p.id===id).stock,1);
assert.equal((await send('/api/admin',{action:'status',id:order.id,status:'cancelled'})).status,200);
assert.equal((await send('/api/admin',{action:'status',id:order.id,status:'confirmed'})).status,400);
const restored=await (await fetch(base+'/api/admin',{headers:{cookie}})).json();assert.equal(restored.products.find(p=>p.id===id).stock,2);
assert.equal((await send('/api/admin',{action:'settings',data:initial.settings})).status,200);
assert.equal((await send('/api/admin',{action:'archive',id})).status,200);
const store=await fetch(base);assert.equal(store.status,200);
const panel=await fetch(base+'/admin',{headers:{cookie}});assert.equal(panel.status,200);
console.log('PASS: anonymous/CSRF denied; authenticated CRUD; closed checkout; real order persistence; authoritative totals; idempotency; oversell rejection; cancellation stock restoration; status validation; storefront and admin render.');
console.log('Cleanup IDs:',id,order.id);



