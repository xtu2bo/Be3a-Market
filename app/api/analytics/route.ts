import { json, sameOrigin } from '@/lib/auth';
import { isAdmin } from '@/lib/auth';
import { markNotificationsRead, readAnalytics, recordVisit } from '@/lib/analytics';

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'طلب غير مسموح' }, 403);
  try { await recordVisit(); return json({ ok: true }); } catch (e) { console.error('Visit failed', e); return json({ error: 'تعذر تسجيل الزيارة' }, 503); }
}

export async function GET(req: Request) {
  if (!await isAdmin()) return json({ error: 'غير مصرح' }, 403);
  const url = new URL(req.url);
  if (url.searchParams.get('read') === '1') await markNotificationsRead();
  return json(await readAnalytics());
}
