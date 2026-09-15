import { db } from '@/lib/server';
import { ensureAdminTables } from '@/lib/admin-auth';

export async function ensureAnalyticsTables() {
  await ensureAdminTables();
  await db().batch([
    db().prepare('CREATE TABLE IF NOT EXISTS site_visits (day TEXT PRIMARY KEY, count INTEGER NOT NULL, updated INTEGER NOT NULL)'),
    db().prepare('CREATE TABLE IF NOT EXISTS admin_notifications (id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, href TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)'),
  ]);
}

export async function recordVisit(day = new Date().toISOString().slice(0, 10)) {
  await ensureAnalyticsTables();
  await db().prepare('INSERT INTO site_visits(day,count,updated) VALUES(?,1,?) ON CONFLICT(day) DO UPDATE SET count=count+1,updated=excluded.updated').bind(day, Date.now()).run();
}

export async function notify(type: string, title: string, body: string, href = '/admin') {
  await ensureAnalyticsTables();
  await db().prepare('INSERT INTO admin_notifications(id,type,title,body,href,read,created) VALUES(?,?,?,?,?,0,?)').bind(crypto.randomUUID(), type, title, body, href, Date.now()).run();
}

export async function readAnalytics() {
  await ensureAnalyticsTables();
  const [visits, notifications, weekVisits, weekOrders] = await Promise.all([
    db().prepare('SELECT day,count FROM site_visits ORDER BY day DESC LIMIT 30').all<{day:string;count:number}>(),
    db().prepare('SELECT id,type,title,body,href,read,created FROM admin_notifications ORDER BY created DESC LIMIT 30').all(),
    db().prepare("SELECT COALESCE(SUM(count),0) as total FROM site_visits WHERE day>=date('now','-6 day')").first<{total:number}>(),
    db().prepare('SELECT COUNT(*) as total FROM orders WHERE created>=?').bind(Date.now()-6*86400000).first<{total:number}>(),
  ]);
  const total = Number(weekVisits?.total||0);
  return { visits: visits.results, totalVisits: total, weekOrders: Number(weekOrders?.total||0), notifications: notifications.results };
}

export async function markNotificationsRead() {
  await ensureAnalyticsTables();
  await db().prepare('UPDATE admin_notifications SET read=1 WHERE read=0').run();
}
