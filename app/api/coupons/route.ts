import { json } from '@/lib/auth';
import { findCoupon } from '@/lib/commerce';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = (url.searchParams.get('code') || '').trim();
  const subtotal = Math.max(0, Math.round(Number(url.searchParams.get('subtotal') || 0) * 100));
  const shipping = Math.max(0, Math.round(Number(url.searchParams.get('shipping') || 0) * 100));
  if (!code) return json({ error: 'اكتبي كود الخصم أولًا' }, 400);
  const coupon = await findCoupon(code, subtotal, shipping);
  if (!coupon) return json({ error: 'الكود غير صحيح أو غير موجود أو انتهت صلاحيته' }, 404);
  return json({ ok: true, code: coupon.code, discount: coupon.discount / 100, scope: coupon.scope });
}
