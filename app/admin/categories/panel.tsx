'use client';
import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product, Settings } from '@/lib/catalog';

type Data={settings?:Settings;products?:Product[];error?:string};

export default function CategoriesPanel(){
  const [settings,setSettings]=useState<Settings|null>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [name,setName]=useState('');
  const [image,setImage]=useState('');
  const [editing,setEditing]=useState('');
  const [selectedCategory,setSelectedCategory]=useState('');
  const [productToAdd,setProductToAdd]=useState('');
  const [busy,setBusy]=useState(false);
  const [imageBusy,setImageBusy]=useState(false);

  async function load(){
    const r=await fetch('/api/admin');
    const v=await r.json() as Data;
    if(r.ok&&v.settings){
      setSettings(v.settings);
      setProducts(v.products||[]);
      setSelectedCategory(current=>current&&v.settings!.categories.includes(current)?current:(v.settings!.categories[0]||''));
    } else toast.error(v.error||'تعذر تحميل الأقسام');
  }
  useEffect(()=>{void load();},[]);

  function startEdit(category:string){setEditing(category);setName(category);setImage(settings?.categoryImages?.[category]||'');}
  function cancelEdit(){setEditing('');setName('');setImage('');}
  async function uploadImage(file:File){
    if(file.size>5*1024*1024){toast.error('أقصى حجم للصورة 5 ميجا');return;}
    setImageBusy(true);
    try{const r=await fetch('/api/upload',{method:'POST',headers:{'Content-Type':file.type},body:file});const v=await r.json() as {url?:string;error?:string};if(!r.ok||!v.url)throw Error(v.error||'تعذر رفع الصورة');setImage(v.url);toast.success('الصورة اترفعت');}
    catch(e){toast.error((e as Error).message);}finally{setImageBusy(false);}
  }
  async function saveCategory(e:React.FormEvent){
    e.preventDefault();
    if(!settings||!name.trim())return;
    const next=name.trim();
    if(settings.categories.includes(next)&&next!==editing){toast.error('اسم القسم موجود بالفعل');return;}
    const categories=editing?settings.categories.map(c=>c===editing?next:c):[...settings.categories,next];
    const categoryImages={...settings.categoryImages};
    if(editing&&editing!==next&&categoryImages[editing]){categoryImages[next]=categoryImages[editing];delete categoryImages[editing];}
    if(image.trim())categoryImages[next]=image.trim();else delete categoryImages[next];
    if(!window.confirm(editing?'تأكيد تعديل بيانات القسم؟':'تأكيد إضافة القسم؟'))return;
    setBusy(true);
    try{
      const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'settings',data:{...settings,categories,categoryImages}})});
      const v=await r.json() as {error?:string};if(!r.ok)throw Error(v.error||'تعذر حفظ القسم');
      const nextSettings={...settings,categories,categoryImages};setSettings(nextSettings);setSelectedCategory(next);cancelEdit();toast.success(editing?'اتعدل القسم':'اتضاف القسم');
    }catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  async function remove(category:string){
    if(!settings||settings.categories.length<=1){toast.error('لازم يفضل قسم واحد على الأقل');return;}
    if(!window.confirm('حذف القسم؟ المنتجات الحالية داخله لن تُحذف، لكن اختاري لها قسمًا آخر قبل تعديلها.'))return;
    setBusy(true);
    try{
      const categories=settings.categories.filter(c=>c!==category);const categoryImages={...settings.categoryImages};delete categoryImages[category];
      const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'settings',data:{...settings,categories,categoryImages}})});
      const v=await r.json() as {error?:string};if(!r.ok)throw Error(v.error||'تعذر حذف القسم');
      setSettings({...settings,categories,categoryImages});setSelectedCategory(categories[0]||'');toast.success('اتحذف القسم');
    }catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  async function addExistingProduct(){
    if(!selectedCategory||!productToAdd)return;
    const product=products.find(p=>p.id===productToAdd);if(!product)return;
    if(!window.confirm(`إضافة ${product.name} إلى قسم ${selectedCategory}؟`))return;
    setBusy(true);
    try{
      const r=await fetch('/api/admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'moveProduct',id:product.id,category:selectedCategory})});
      const v=await r.json() as {error?:string};if(!r.ok)throw Error(v.error||'تعذر نقل المنتج');
      setProductToAdd('');toast.success('اتضاف المنتج للقسم');await load();
    }catch(e){toast.error((e as Error).message);}finally{setBusy(false);}
  }
  const currentProducts=useMemo(()=>products.filter(product=>product.category===selectedCategory),[products,selectedCategory]);
  const availableProducts=useMemo(()=>products.filter(product=>product.category!==selectedCategory),[products,selectedCategory]);

  if(!settings)return <main className="standalone-admin-page"><div className="admin-card">جاري تحميل الأقسام…</div></main>;
  return <main className="standalone-admin-page categories-admin-page">
    <div className="admin-heading"><div><p className="eyebrow">BE3A / CATEGORIES</p><h1>أقسام المتجر</h1><p>عدّلي اسم القسم وصورته وأديري المنتجات الموجودة داخله.</p></div></div>
    <section className="admin-card"><h2><Plus size={19}/>{editing?'تعديل بيانات القسم':'إضافة قسم'}</h2><form className="category-form category-edit-form" onSubmit={saveCategory}><input required maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="اسم القسم"/><div className="category-image-input"><ImagePlus size={17}/><input value={image} onChange={e=>setImage(e.target.value)} placeholder="رابط صورة القسم (اختياري)" dir="ltr"/><label className="category-upload-button">{imageBusy?'جاري الرفع…':'رفع صورة'}<input type="file" accept="image/png,image/jpeg,image/webp" disabled={imageBusy} onChange={e=>{const file=e.target.files?.[0];if(file)void uploadImage(file);e.target.value='';}}/></label></div><button className="primary" disabled={busy||imageBusy}>{editing?'حفظ القسم':'إضافة القسم'}</button>{editing&&<button type="button" className="secondary" onClick={cancelEdit}>إلغاء</button>}</form></section>
    <section className="admin-card"><h2><Tags size={19}/>الأقسام الحالية</h2><div className="category-list">{settings.categories.map(category=><div className={'category-row'+(selectedCategory===category?' selected':'')} key={category}><button className="category-select" type="button" onClick={()=>setSelectedCategory(category)}><strong>{category}</strong><small>{products.filter(product=>product.category===category).length} منتج</small></button><div><button aria-label={'تعديل '+category} onClick={()=>startEdit(category)}><Pencil size={17}/></button><button aria-label={'حذف '+category} onClick={()=>void remove(category)}><Trash2 size={17}/></button></div></div>)}</div></section>
    <section className="admin-card category-products-card"><div className="card-heading"><div><h2>منتجات قسم {selectedCategory}</h2><p className="muted">انقلي منتجًا موجودًا للقسم أو افتحي صفحة المنتجات لإضافة منتج جديد.</p></div><a className="secondary" href="/admin/products"><Plus size={17}/>إضافة منتج جديد</a></div><div className="category-product-add"><select value={productToAdd} onChange={e=>setProductToAdd(e.target.value)} disabled={!availableProducts.length}><option value="">اختاري منتجًا موجودًا</option>{availableProducts.map(product=><option key={product.id} value={product.id}>{product.name}</option>)}</select><button className="primary" type="button" disabled={!productToAdd||busy} onClick={()=>void addExistingProduct()}>إضافة للقسم</button></div>{currentProducts.length?<div className="category-products-list">{currentProducts.map(product=><div className="category-product-row" key={product.id}><img src={product.image} alt=""/><div><strong>{product.name}</strong><small>{product.active?'ظاهر في المتجر':'مخفي'} · {product.stock} قطعة</small></div><a href="/admin/products" aria-label={'تعديل '+product.name}><Pencil size={16}/></a></div>)}</div>:<p className="notification-empty">مفيش منتجات في القسم حاليًا.</p>}</section>
  </main>;
}
