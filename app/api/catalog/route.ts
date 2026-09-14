import { readSettings,readProducts } from '@/lib/server';
import { json } from '@/lib/auth';
export async function GET(){try{return json({settings:await readSettings(),products:await readProducts()});}catch(e){console.error('Catalog unavailable',e);return json({error:'المتجر غير متاح مؤقتًا. حاولي مرة تانية.'},503);}}
