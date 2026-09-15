import { db } from '@/lib/server';
import { ensureAdminTables } from '@/lib/admin-auth';

export type Coupon = { code: string; kind: 'percent'|'fixed'; value: number; minSubtotal: number; usageLimit: number; used: number; active: boolean; starts: number|null; expires: number|null; scope: 'order'|'shipping' };

export async function ensureCommerceTables() {
  await ensureAdminTables();
  await db().batch([
    db().prepare("CREATE TABLE IF NOT EXISTS coupons (code TEXT PRIMARY KEY, kind TEXT NOT NULL, value INTEGER NOT NULL, min_subtotal INTEGER NOT NULL DEFAULT 0, usage_limit INTEGER NOT NULL DEFAULT 0, used INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, starts INTEGER, expires INTEGER, scope TEXT NOT NULL DEFAULT 'order', created INTEGER NOT NULL)"),
    db().prepare('CREATE TABLE IF NOT EXISTS site_visits (day TEXT PRIMARY KEY, count INTEGER NOT NULL, updated INTEGER NOT NULL)'),
    db().prepare('DROP TRIGGER IF EXISTS restore_returned_stock'),
  ]);
  for (const statement of [
    'ALTER TABLE orders ADD COLUMN coupon TEXT',
    'ALTER TABLE orders ADD COLUMN discount INTEGER NOT NULL DEFAULT 0',
  ]) { try { await db().prepare(statement).run(); } catch { /* columns already exist */ } }
  try { await db().prepare("ALTER TABLE coupons ADD COLUMN scope TEXT NOT NULL DEFAULT 'order'").run(); } catch { /* column already exists */ }
}

export async function listCoupons() { await ensureCommerceTables(); const result = await db().prepare('SELECT code,kind,value,min_subtotal as minSubtotal,usage_limit as usageLimit,used,active,starts,expires,scope FROM coupons ORDER BY created DESC').all(); return result.results.map((row: any) => ({...row, value: Number(row.value)/100, minSubtotal: Number(row.minSubtotal)/100, active: !!row.active, scope: row.scope==='shipping'?'shipping':'order'})); }
export async function saveCoupon(input: Coupon) { await ensureCommerceTables(); await db().prepare('INSERT INTO coupons(code,kind,value,min_subtotal,usage_limit,used,active,starts,expires,scope,created) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(code) DO UPDATE SET kind=excluded.kind,value=excluded.value,min_subtotal=excluded.min_subtotal,usage_limit=excluded.usage_limit,active=excluded.active,starts=excluded.starts,expires=excluded.expires,scope=excluded.scope').bind(input.code.toUpperCase(), input.kind, Math.round(input.value*100), Math.round(input.minSubtotal*100), input.usageLimit, input.used, +input.active, input.starts, input.expires, input.scope||'order', Date.now()).run(); }
export async function deleteCoupon(code: string) { await ensureCommerceTables(); await db().prepare('DELETE FROM coupons WHERE code=?').bind(code.toUpperCase()).run(); }
export async function findCoupon(code: string, subtotal: number, shipping = 0) { await ensureCommerceTables(); const row = await db().prepare('SELECT code,kind,value,min_subtotal as minSubtotal,usage_limit as usageLimit,used,active,starts,expires,scope FROM coupons WHERE code=?').bind(code.trim().toUpperCase()).first<any>(); if (!row || !row.active || (row.starts && row.starts>Date.now()) || (row.expires && row.expires<Date.now()) || (row.usageLimit && row.used>=row.usageLimit) || subtotal<row.minSubtotal) return null; const base=row.scope==='shipping'?shipping:subtotal; const raw = row.kind==='percent' ? Math.min(base, Math.round(base*Number(row.value)/10000)) : Math.min(base, Number(row.value)); return {code:row.code, discount:raw, scope:row.scope==='shipping'?'shipping':'order'}; }
export async function useCoupon(code: string) { await ensureCommerceTables(); await db().prepare('UPDATE coupons SET used=used+1 WHERE code=? AND (usage_limit=0 OR used<usage_limit)').bind(code).run(); }

export async function readReports(days = 30) {
  await ensureCommerceTables();
  return readReportsRange(Date.now() - days*86400000, Date.now());
}

export async function readReportsRange(from: number, to: number) {
  await ensureCommerceTables();
  const since = from;
  const until = to;
  const fromDay = new Date(since).toISOString().slice(0,10);
  const untilDay = new Date(until).toISOString().slice(0,10);
  const [sales, visits] = await Promise.all([
    db().prepare('SELECT substr(datetime(created/1000,\'unixepoch\'),1,10) as day, COUNT(*) as orders, COALESCE(SUM(total),0) as revenue, COALESCE(SUM(discount),0) as discounts FROM orders WHERE created>=? AND created<=? GROUP BY day ORDER BY day').bind(since,until).all(),
    db().prepare('SELECT day,count FROM site_visits WHERE day>=? AND day<=? ORDER BY day').bind(fromDay,untilDay).all(),
  ]);
  return { sales: sales.results.map((x:any)=>({...x,orders:Number(x.orders),revenue:Number(x.revenue)/100,discounts:Number(x.discounts)/100})), visits: visits.results.map((x:any)=>({...x,count:Number(x.count)})) };
}
