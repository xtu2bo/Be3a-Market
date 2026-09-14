import { env } from 'cloudflare:workers';
import { defaults, type Settings, type Product } from '@/lib/catalog';
export function db() { if(!env.DB) throw new Error('Storage unavailable'); return env.DB; }
export async function readSettings():Promise<Settings> { const row=await db().prepare('SELECT data FROM settings WHERE id=1').first<{data:string}>(); return row?{...defaults,...JSON.parse(row.data)}:defaults; }
export async function readProducts(all=false):Promise<Product[]> { const {results}=await db().prepare(all?'SELECT * FROM products ORDER BY updated DESC':'SELECT * FROM products WHERE active=1 ORDER BY updated DESC').all<{id:string;data:string;updated:number;stock:number;price:number;active:number;demo:number}>();return results.map(r=>({...JSON.parse(r.data),id:r.id,revision:r.updated,stock:r.stock,price:r.price/100,active:!!r.active,demo:!!r.demo})); }
export async function readOrders() { const {results}=await db().prepare('SELECT * FROM orders ORDER BY created DESC LIMIT 500').all(); const {results:items}=await db().prepare('SELECT * FROM order_items WHERE order_id IN (SELECT id FROM orders ORDER BY created DESC LIMIT 500)').all(); return results.map(o=>({...o,items:items.filter(i=>i.order_id===o.id)})); }

