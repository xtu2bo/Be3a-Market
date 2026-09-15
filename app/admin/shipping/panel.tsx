'use client';
import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Pencil, Plus, Save, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import type { Settings } from '@/lib/catalog';

type Data={settings?:Settings;error?:string};

export default function ShippingPanel(){
  const [settings,setSettings]=useState<Settings|null>(null);
  const [busy,setBusy]=useState(false);
  const [dirty,setDirty]=useState(false);
  const [editing,setEditing]=useState<number|null>(null);

  async function load(){
    const r=await fetch('/api/admin'); const v=await r.json() as Data;
    if(r.ok&&v.settings){setSettings({...v.settings,shipping:v.settings.shipping.map(x=>({...x,active:x.active!==false}))});setDirty(false);setEditing(null);}
    else toast.error(v.error||'تعذر تحميل إعدادات التوصيل');
  }
  useEffect(()=>{void load();},[]);
  function updateShipping(shipping:Settings['shipping']){if(!settings)return;setSettings({...settings,shipping});setDirty(true);}
  function addArea(){if(!settings||!window.confirm('تأكيد إضافة منطقة توصيل جديدة؟'))return;const next=[...settings.shipping,{name:'',price:0,active:true}];setSettings({...settings,shipping:next});setEditing(next.length-1);setDirty(true);}
  async function save(e:React.FormEvent){
    e.preventDefault(); if(!settings||!dirty)return;
    if(settings.shipping.some(x=>!x.name.trim())){toast.error('اكتبي اسم كل محافظة قبل الحفظ');return;}
    if(!window.confirm('تأكيد حفظ محافظات وأسعار التوصيل؟'))return;
    setBusy(true); try{const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'settings',data:settings})});const v=await r.json() as {error?:string};if(!r.ok)throw Error(v.error);setDirty(false);setEditing(null);toast.success('اتحفظت إعدادات التوصيل');}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  if(!settings)return <main className="standalone-admin-page"><div className="admin-card">جاري تحميل التوصيل…</div></main>;
  return <main className="standalone-admin-page"><form onSubmit={save}>
    <div className="admin-heading"><div><p className="eyebrow">BE3A / DELIVERY</p><h1>المحافظات والتوصيل</h1><p>أضيفي المحافظة وحددي السعر. اضغطي تعديل قبل تغيير منطقة موجودة، أو أخفيها مؤقتًا بدل حذفها.</p></div><button className="primary" disabled={busy||!dirty}><Save size={18}/>{busy?'جاري الحفظ…':'حفظ التغييرات'}</button></div>
    <section className="admin-card"><h2><Truck size={19}/>مناطق الشحن</h2>
      <div className="shipping-rows">{settings.shipping.map((row,i)=><div className={'shipping-row '+(row.active===false?'is-hidden':'')} key={i}>
        <input aria-label="اسم المحافظة" required readOnly={editing!==i} placeholder="مثال: القاهرة" value={row.name} onChange={e=>updateShipping(settings.shipping.map((x,n)=>n===i?{...x,name:e.target.value}:x))}/>
        <input aria-label="سعر التوصيل" required readOnly={editing!==i} type="number" min="0" max="10000" step="0.01" value={row.price} onChange={e=>updateShipping(settings.shipping.map((x,n)=>n===i?{...x,price:Number(e.target.value)}:x))}/>
        <div className="shipping-actions">
          {editing===i?<button type="button" className="shipping-confirm" aria-label="تأكيد تعديل المنطقة" title="تأكيد التعديل" onClick={()=>{if(window.confirm('تأكيد حفظ تعديل اسم المحافظة وسعر التوصيل؟'))setEditing(null);}}><Check size={18}/></button>:<button type="button" aria-label={'تعديل '+row.name} title="تعديل" onClick={()=>{if(window.confirm('تأكيد فتح تعديل منطقة التوصيل؟'))setEditing(i);}}><Pencil size={17}/></button>}
          <button type="button" aria-label={row.active===false?'إظهار '+row.name:'إخفاء '+row.name} title={row.active===false?'إظهار':'إخفاء'} onClick={()=>{if(window.confirm(row.active===false?'إظهار منطقة التوصيل؟':'إخفاء منطقة التوصيل مؤقتًا؟'))updateShipping(settings.shipping.map((x,n)=>n===i?{...x,active:x.active===false}:x));}}>{row.active===false?<Eye size={17}/>:<EyeOff size={17}/>}</button>
          <button type="button" aria-label={'حذف '+row.name} title="حذف" onClick={()=>{if(window.confirm('حذف منطقة التوصيل نهائيًا؟'))updateShipping(settings.shipping.filter((_,n)=>n!==i));}}><Trash2 size={18}/></button>
        </div>
      </div>)}</div>
      <button type="button" className="secondary" onClick={addArea}><Plus size={17}/>إضافة محافظة</button>
      {!settings.shipping.length&&<p className="notification-empty">أضيفي أول محافظة وسعر التوصيل من هنا.</p>}
    </section>
  </form></main>;
}

