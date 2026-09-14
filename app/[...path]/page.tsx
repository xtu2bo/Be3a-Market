import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import Storefront,{type StoreView} from '../storefront';
import {loadStore} from '@/lib/store-data';
export const dynamic='force-dynamic';
type Props={params:Promise<{path:string[]}>;searchParams:Promise<{q?:string}>};
const titles:Record<string,string>={shop:'كل الكولكشن',cart:'شنطة التسوق',checkout:'إتمام الطلب',favorites:'المفضلة',about:'حكاية بيعة',contact:'كلمينا',privacy:'الخصوصية',returns:'الاستبدال والاسترجاع',shipping:'الشحن والتوصيل'};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {path:rawPath}=await params;const path=rawPath.map(v=>{try{return decodeURIComponent(v);}catch{return v;}});const data=await loadStore();const item=path[0]==='product'?data.initialProducts.find(p=>p.id===path[1]):null;return{title:`${item?.name||titles[path[0]]||path[1]||'المتجر'} | ${data.initialSettings.name}`,description:item?.description||data.initialSettings.heroText,...(['cart','checkout','favorites'].includes(path[0])?{robots:{index:false,follow:false}}:{})};}
export default async function StorePage({params,searchParams}:Props){const {path:rawPath}=await params;const path=rawPath.map(v=>{try{return decodeURIComponent(v);}catch{return v;}});const query=await searchParams;const data=await loadStore();let view:StoreView;if(path.length===1&&Object.hasOwn(titles,path[0]))view={kind:path[0] as StoreView['kind']};else if(path.length===2&&path[0]==='category'&&data.initialSettings.categories.includes(path[1]))view={kind:'category',key:path[1]};else if(path.length===2&&path[0]==='product'&&data.initialProducts.some(p=>p.id===path[1]))view={kind:'product',key:path[1]};else notFound();return <Storefront {...data} view={view} initialQuery={typeof query.q==='string'?query.q.slice(0,100):''}/>;}

